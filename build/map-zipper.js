// map-zipper.js
// A function that compiles a map into a zip file.

var fs = require("fs");
var ndarray = require("ndarray");
var extend = require("extend");
var sync = require("synchronize");
var archiver = require("archiver");

var evtFinder = require("./event-compiler.js");
var ByLineReader = require("./transform-streams").ByLineReader;
var ProcessorTransform = require("./transform-streams").ProcessorTransform;

/**
 * Verifies and compiles the given map id at the given file.
 */
function compileMap(id, file) {
	// Map package sanity checks
	if (!fs.existsSync(file+"/"+id+".json")) throw "No map json file!";
	if (!fs.existsSync(file+"/"+id+".obj")) throw "No map wavefront obj file!";
	if (!fs.existsSync(file+"/"+id+".mtl")) throw "No map obj material file!";
	
	if (!fs.existsSync(BUILD_TEMP)) fs.mkdirSync(BUILD_TEMP);
	if (!fs.existsSync(BUILD_TEMP+id)) fs.mkdirSync(BUILD_TEMP+id);
	
	//Compress the map
	var json = compressMapJson(id, file);
	fs.writeFileSync(BUILD_TEMP+id+"/map.json", json);
	nextTick();
	
	//Organize the model file and textures
	processMapModel(id, file);
	nextTick();
	
	//Collate the local events
	var evtjs = evtFinder.findLocalEvents(id, file);
	if (evtjs) {
		fs.writeFileSync(BUILD_TEMP+id+"/l_evt.js", evtjs);
	}
	nextTick();
	
	//Collate the global events
	evtjs = evtFinder.findGlobalEvents(id, file);
	if (evtjs) {
		fs.writeFileSync(BUILD_TEMP+id+"/g_evt.js", evtjs);
	}
	nextTick();
	
	//Now zip everything up
	zipWorkingDirectory(id);
	nextTick();
	
	console.log("[cMaps] Compilation of map", '"'+id+'"', "completed.");
	
};
module.exports = compileMap;

function copyFile(src, dest) {
	var read = fs.createReadStream(src);
	var write = fs.createWriteStream(dest);
	
	write.on("finish", sync.defer());
	read.pipe(write);
	
	sync.await();
}

// If you make any changes here, make sure to mirror them in src/js/map.js!
function convertTilePropsToShort(props) {
	// TileData: MMMMLW00 TTTHHHHH
	// Where:
	//    M = Movement, Bits are: (Down, Up, Left, Right)
	//    L = Ledge bit (this tile is a ledge: you jump over it when given permission to enter it)
	//    W = Water bit (this tile is water: most actors are denied entry onto this tile)
	//    H = Height (vertical location of the center of this tile)
	//    T = Transition Tile (transition to another Layer when stepping on this tile)
	var val = 0;
	if (props.movement)		{ val |= (props.movement & 0xF) << 12; }
	if (props.ledge)		{ val |= 0x1 << 11; }
	if (props.water)		{ val |= 0x1 << 10; }
	if (props.transition)	{ val |= (props.transition & 0x7) << 5; }
	if (props.height)		{ val |= (props.height & 0x1F); }
	return val;
}


function compressMapJson(id, file) {
	var json = JSON.parse(fs.readFileSync(file+"/"+id+".json", { encoding: "utf8" }));
	
	// Map JSON sanity checks
	if (json.version != 1) throw "Invalid map version: Was expecting version 1, found version "+json.version+"!";
	if (json.orientation && json.orientation != "orthogonal") throw "Invalid map orientation: must be 'orthogonal', is "+json.orientation;
	if (json.renderorder && json.renderorder != "right-down") throw "Invalid map render order: must be 'right-down', is "+json.renderorder;
	for (var li = 0; li < json.layers.length; li++) {
		if (json.layers[li].x != 0) throw "Invalid map: Layer "+li+" is mis-aligned!";
		if (json.layers[li].y != 0) throw "Invalid map: Layer "+li+" is mis-aligned!";
		if (json.layers[li].width != json.width) throw "Invalid map: Layer is wrong size!";
		if (json.layers[li].height != json.height) throw "Invalid map: Layer is wrong size!";
		
		//also convert to ndarray for easier access
		json.layers[li].data = ndarray(json.layers[li].data, [json.width, json.height], [1, json.width]);
	}
	// console.log("Sanity Checks passed!"); nextTick();
	
	var setup = {};
	if (fs.existsSync(file+"/setup.json")) {
		setup = JSON.parse(fs.readFileSync(file+"/setup.json", { encoding: "utf8" }));
	}
	
	// construct the compressed map, which strips all of the unneeded visuals
	var cmap = {
		width: json.width,
		height: json.height,
		map : ndarray(new Uint16Array(json.width * json.height), [json.width, json.height], [1, json.width]),
		layers : [ //Layer 1 = index 0 = default layer
			// /*1*/ { "2d": [0, 0], "3d": [1,0,0,0,  0,1,0,0,  0,0,1,0,  0,0,0,1] },
		],
		warps : [
			{ loc:[0, 0], anim:0, },
		],
	};
	extend(cmap, setup);
	
	// console.log("Beginning data loop"); nextTick();
	// Loop through the map, and through the layers
	for (var x = 0; x < cmap.width; x++) {
	for (var y = 0; y < cmap.height; y++) {
		var tiledata = 0;
		for (var li = 0; li < json.layers.length; li++) {
			var gid = json.layers[li].data.get(x, y); //gid = global id
			if (gid === 0) continue;
			var props;
			
			//find tile props for this tile
			for (var t = json.tilesets.length - 1; t >= 0; t--) {
				if (json.tilesets[t].firstgid > gid) continue;
				var lid = gid - json.tilesets[t].firstgid; //lid = local id
				props = json.tilesets[t].tileproperties[lid];
				break;
			}
			
			if (props) {
				tiledata |= convertTilePropsToShort(props);
				
				if (props.layerorigin) {
					var lo = props.layerorigin;
					if (lo < 1 && lo > 7) throw "Invalid layer id! "+lo;
					cmap.layers[lo-1] = cmap.layers[lo-1] || {};
					cmap.layers[lo-1]["2d"] = [x, y];
				}
				if (props.warppoint) {
					var wp = parseInt(props.warppoint, 16);
					if (wp < 0 && wp > 16) throw "Invalid warp id! "+wp;
					cmap.warps[wp] = cmap.warps[wp] || {};
					cmap.warps[wp].loc = [x, y];
					
					if (props.entryanim) {
						// Entry anims: as the scene fades up, the player character walks onto the tile
						//Entry anims: 0 = appear, 5 = beam down
						// 1 = walk up, 2 = walk down, 3 = walk right, 4 = walk left
						var e = parseInt(props.entryanim, 16);
						if (e < 0 && e > 7) throw "Invalid entry anim! "+e;
						cmap.warps[wp].anim = e;
					}
				}
			}
			
		}
		cmap.map.set(x, y, tiledata);
	}
	}
	// console.log("completed data loop"); nextTick();
	
	//Find definitions for the Layer offsets and otther properties
	for (var p in json.properties) {
		var ps = p.split(" ");
		switch(ps[0]) {
			case "Layer":
				var layer = cmap.layers[ps[1]-1] = cmap.layers[ps[1]-1] || {};
				switch (ps[2]) {
					case "3d": case "3D":
						layer["3d"] = JSON.parse(json.properties[p]);
						if (layer["3d"].length != 4*4) throw "Layer 3D properties defined incorrectly!";
						break;
					case "2d": case "2D":
						layer["2d"] = JSON.parse(json.properties[p]);
						if (layer["2d"].length != 2) throw "Layer 2D properties defined incorrectly!";
						break;
				}
				break;
			
			case "Warp":
				var warp = cmap.warps[ps[1]] = cmap.warps[ps[1]] || {};
				extend(warp, JSON.parse(json.properties[p]));
				break;
		}
	}
	// console.log("found all properties"); nextTick();
	
	//Now verify all the proper data is here
	__verifyData(cmap);
	
	// console.log("data verified, now stringifying"); nextTick();
	//Now stringify!
	return JSON.stringify(cmap, function(key, value){
		//We need a replacer because TypedArrays don't properly stringify into arrays
		if (key == "map") {
			var data = value.data;
			var array = new Array(data.length);
			for (var i = 0; i < data.length; i++) {
				array[i] = data[i];
			}
			return array;
		}
		return value;
	}
	// , "\t" //TEST
	);
	
	
	function __verifyData(cmap) {
		// Check Layer data
		for (var i = 0; i < cmap.layers.length; i++) {
			var _2d = !!cmap.layers[i]["2d"];
			var _3d = !!cmap.layers[i]["3d"];
			
			if (!(_2d && _3d)) 
				throw "Incomplete Layer definition: Layer "+i+", 2d="+_2d+" 3d="+_3d;
		}
		
		//Check Warp data
		for (var i = 0; i < cmap.warps.length; i++) {
			var _loc = !!cmap.warps[i]["loc"];
			var _anim = !!cmap.warps[i]["anim"]; //TODO provide default 0 instead
			
			if (!(_loc && _anim)) 
				throw "Incomplete Layer definition: Warp "+i+", loc="+_loc+" anim="+_anim;
		}
	}
}

function processMapModel(id, file) {
	var mtl_in, mtl_out, obj_in, obj_out;
	var mtl_liner, obj_liner, obj_trans;
	
	var numMatsDefined = 0;
	var numMatsUsed = 0;
	var materials = {};
	
	var numTextsDefined = 0;
	var numTextsUsed = 0;
	var textures = [];
	
	/////////////////////////////////////////////////////////////////////////////
	// Step 1: Read in MTL file
	// http://en.wikipedia.org/wiki/Wavefront_.obj_file#Introduction
	
	mtl_in = fs.createReadStream(file+"/"+id+".mtl", { encoding: "utf8" });
	mtl_liner = new ByLineReader();
	mtl_in.pipe(mtl_liner);
	mtl_liner.on("end", sync.defer());
	
	mtl_liner.on("data", function(line){
		//Process the MTL file, line-by-line
		if (!line || !line.trim()) return;
		if (line.indexOf("#") == 0) return;
		var comps = line.trim().split(" ");
		
		switch (comps[0]) {
			
			case "newmtl": //New material is being defined
				this.currMat = { oldname: comps[1], props: {}, texs: {} };
				materials[comps[1]] = this.currMat;
				numMatsDefined++;
				break;
			
			case "map_Kd": //handle materials specially
			case "map_Ka":
			case "map_Ks":
			case "map_d":
			case "map_bump":
			case "bump":
			case "disp":
			case "decal":
				this.currMat.texs[comps[0]] = line.substr(comps[0].length).trim();
				numTextsDefined++;
				break;
			
			default:
				this.currMat.props[comps[0]] = line.substr(comps[0].length).trim();
				break;
		}
	});
	
	sync.await(); //Pause here until reading is finished
	
	/////////////////////////////////////////////////////////////////////////////
	// Step 2: Read and Process OBJ file
	
	obj_in = fs.createReadStream(file+"/"+id+".obj", { encoding: "utf8" });
	obj_out = fs.createWriteStream(BUILD_TEMP+id+"/map.obj", { encoding: "utf8" });
	obj_liner = new ByLineReader();
	obj_trans = new ProcessorTransform(function(line){
		//Process the OBJ file, line-by-line
		var comps = line.trim().split(" ");
		switch (comps[0]) {
			case "mtllib": // Rewrite the mtllib line to point to the renamed file
				return "mtllib map.mtl";
			
			case "usemtl": // Rewrite the usemtl line reference the reworked file properly
				var oldname = comps[1]; 
				var mat = materials[oldname];
				if (!mat.newname) {
					var id = "_00"+(numMatsUsed++);
					id = id.substr(id.length-2);
					mat.newname = "mat_"+id;
				}
				return "usemtl "+mat.newname;
			
			default:
				return line;
				
		}
	});
	obj_out.on("finish", sync.defer());
	
	obj_in.pipe(obj_liner).pipe(obj_trans).pipe(obj_out);
	
	sync.await(); //Pause here until the transforming is finished
	
	//////////////////////////////////////////////////////////////////////////////
	// Step 3: Process and Write the MTL file
	mtl_out = fs.createWriteStream(BUILD_TEMP+id+"/map.mtl", { encoding: "utf8" });
	
	for (var matname in materials) {
		var mat = materials[matname];
		if (!mat.newname) continue; //If the material was not used, skip it
		
		mtl_out.write("newmtl "+mat.newname+"\n");
		for (var prop in mat.props) {
			mtl_out.write(prop+" "+mat.props[prop]+"\n");
		}
		for (var tex in mat.texs) {
			mtl_out.write(markTexture(tex, mat.texs[tex])+"\n");
		}
		mtl_out.write("\n");
	}
	mtl_out.end();
	console.log("[cObjs] Wrote", BUILD_TEMP+id+"/map.obj", "and .mtl file; used", numMatsUsed, "materials out of", numMatsDefined);
	
	
	////////////////////////////////////////////////////////////////////////////////
	// Step 4: Copy image files over to the output folder
	
	//TODO Check if images are Powers of Two!
	console.warn("WARNING: TODO Check if Images are Powers of Two!!");
	sync.parallel(function(){
		for (var i = 0; i < textures.length; i++) {
			var tex = textures[i];
			
			var read = fs.createReadStream(tex.path);
			var write = fs.createWriteStream(BUILD_TEMP+id+"/"+tex.newname);
			console.log("[cObjs] Writing Texture file to", BUILD_TEMP+id+"/"+tex.newname);
			write.on("finish", sync.defer());
			read.pipe(write);
		}
	});
	var copyres = sync.await(); //Pause here until the copying is complete
	console.log("[cObjs] Copied", (copyres)?copyres.length:"???","files; used", numTextsUsed, "textues out of", numTextsDefined);
	return;
	
	function markTexture(type, arg) {
		var id = "_000"+(numTextsUsed++);
		id = "tex_"+id.substr(id.length-3);
		
		var texDef = __splitTexArg(arg);
		
		
		var path;
		{ //attempt to find this file
			if (texDef.src.indexOf("C:\\") == 0 || texDef.src.indexOf("/") == 0) { //if this is an absolute filename
				var cwd = process.cwd();
				if (texDef.src.indexOf(cwd) == 0) { //if the file is under the current working directory
					// make a realative path
					path = texDef.src.substr(cwd.length+1);
				} else if ((cwd = texDef.src.indexOf("TPPParkDev")) > -1) {
					// Match name of project to try and make things work on other computers
					path = texDef.src.substr(cwd+"TPPParkDev".length+1);
				} else {
					// else, keep the absolute path
					path = texDef.src;
				}
			} else {
				// else, prepend on the mtl file's path
				path = file+"/"+texDef.src;
			}
			
			if (!fs.existsSync(path)) {
				throw "The Material Library references an image I cannot find! "+path;
			}
		}
		
		var filename = /[^\\\/]*$/.exec(texDef.src)[0]; //grab the file name
		var ext = /[^\.]*$/.exec(filename)[0]; //grab the meaningful extension
		
		textures.push({
			type: type,
			texDef : texDef,
			path : path,
			oldname : texDef.src,
			newname : id+"."+ext,
		});
		return type +" "+ ((texDef.args)?texDef.args +" ":"") + id +"."+ ext;
		
		function __splitTexArg(arg) {
			var comps = arg.split(" ");
			var texDef = {};
			// http://en.wikipedia.org/wiki/Wavefront_.obj_file#Texture_options
			for (var i = 0; i < comps.length; i++) {
				switch (comps[i]) {
					case "-blendu": 
						texDef["blendu"] = (comps[i+1] != "off");
						i += 1; break; //consume the argument
					case "-blendv":
						texDef["blendv"] = (comps[i+1] != "off");
						i += 1; break;
					case "-boost":
						texDef["boost"] = parseFloat(comps[i+1]);
						i += 1; break;
					case "-mm":
						texDef["mm_base"] = parseFloat(comps[i+1]);
						texDef["mm_gain"] = parseFloat(comps[i+2]);
						i += 2; break;
					case "-o":
						texDef["o_u"] = parseFloat(comps[i+1]);
						texDef["o_v"] = parseFloat(comps[i+2]); //technically optional
						texDef["o_w"] = parseFloat(comps[i+3]); //technically optional
						i += 3; break;
					case "-s":
						texDef["s_u"] = parseFloat(comps[i+1]);
						texDef["s_v"] = parseFloat(comps[i+2]); //technically optional
						texDef["s_w"] = parseFloat(comps[i+3]); //technically optional
						i += 3; break;
					case "-t":
						texDef["t_u"] = parseFloat(comps[i+1]);
						texDef["t_v"] = parseFloat(comps[i+2]); //technically optional
						texDef["t_w"] = parseFloat(comps[i+3]); //technically optional
						i += 3; break;
					case "-texres":
						texDef["texres"] = comps[i+1];
						i += 1; break;
					case "-clamp":
						texDef["clamp"] = (comps[i+1] == "on"); //default off
						i += 1; break;
					case "-bm":
						texDef["bm"] = parseFloat(comps[i+1]);
						i += 1; break;
					case "-imfchan":
						texDef["imfchan"] = comps[i+1];
						i += 1; break;
					case "-type":
						texDef["type"] = comps[i+1];
						i += 1; break;
						
					// Custom properties
					case "-timeapp":  //Time applicable
						// -timeapp [startTime] [endTime]
						//   where the times are formatted as follows: m00[d00[h00[m00]]]
						//   each section in sequence is optional
						// startTime = start of the time, inclusive, when the given texture is applicable
						// endTime = end of the time, inclusive, when the given texture is applicable
						texDef["timeapp"] = [comps[i+1], comps[i+2]];
						i += 2; break;
						
					default:
						//Assume the source is the last thing we'll find
						texDef.src = comps.slice(i).join(" ");
						texDef.args = comps.slice(0, i).join(" ");
						return texDef;
				}
			}
			return texDef;
		}
	}
}

function zipWorkingDirectory(id) {
	var outstr = fs.createWriteStream("maps/"+id+".zip");
	var arch = archiver("zip");
	
	outstr.on("finish", sync.defer());
	arch.pipe(outstr);
	arch.bulk([
		{ expand: true, cwd: BUILD_TEMP+id, src: ["*"], flatten: true, },
		//{ expand: true, cwd: 'source', src: ["**"], dest: 'source' },
	]);
	arch.finalize();
	
	sync.await();
	console.log("[cMaps] Zipped file:", "maps/"+id+".zip", "["+arch.pointer()+" bytes]");
}