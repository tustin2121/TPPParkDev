// map-zipper.js
// A function that compiles a map into a zip file.

var fs = require("fs");
var ndarray = require("ndarray");
var extend = require("extend");

/**
 * Verifies and compiles the given map id at the given file.
 */
function compileMap(id, file) {
	// Map package sanity checks
	if (!fs.existsSync(file+"/"+id+".json")) throw "No map json file!";
	if (!fs.existsSync(file+"/"+id+".obj")) throw "No map wavefront obj file!";
	if (!fs.existsSync(file+"/"+id+".mtl")) throw "No map obj material file!";
	
	var json = compressMapJson(id, file);
	
};
module.exports = compileMap;

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
}


function compressMapJson(id, file) {
	var json = JSON.parse(fs.readFileSync(file+"/"+id+".json", { encoding: "utf8" }));
	
	// Map JSON sanity checks
	if (json.version != 1) throw "Invalid map version: Was expecting version 1, found version "+json.version+"!";
	if (json.orientation != "orthogonal") throw "Invalid map orientation: must be 'orthogonal'!";
	if (json.renderorder != "right-down") throw "Invalid map render order: must be 'right-down'";
	for (var li = 0; li < json.layers.length; li++) {
		if (json.layers[li].x != 0) throw "Invalid map: Layer "+li+" is mis-aligned!";
		if (json.layers[li].y != 0) throw "Invalid map: Layer "+li+" is mis-aligned!";
		if (json.layers[li].width != json.width) throw "Invalid map: Layer is wrong size!";
		if (json.layers[li].height != json.height) throw "Invalid map: Layer is wrong size!";
		
		//also convert to ndarray for easier access
		json.layers[i].data = ndarray(json.layers[i].data, {json.width, json.height});
	}
	
	// construct the compressed map, which strips all of the uneeded visuals
	var cmap = {
		width: json.width,
		height: json.height,
		map : ndarray(new Uint16Array(json.width * json.height), {json.width, json.height}),
		layers : [ //Layer 1 = index 0 = default layer
			// /*1*/ { "2d": [0, 0], "3d": [1,0,0,0,  0,1,0,0,  0,0,1,0,  0,0,0,1] },
		],
		warps : [
			{ loc:[0, 0], anim:0, },
		],
	};
	
	// Loop through the map, and through the layers
	for (var x = 0; x < cmap.width; x++) {
	for (var y = 0; y < cmap.height; y++) {
		var tiledata = 0;
		
		for (var l = 0; l < json.layers.length; l++) {
			var gid = json.layers.data.get(x, y); //gid = global id
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
					var l = props.layerorigin;
					if (l < 1 && l > 7) throw "Invalid layer id! "+l;
					cmap.layers[l] = cmap.layers[l] || {};
					cmap.layers[l]["2d"] = [x, y];
				}
				if (props.warppoint) {
					var l = parseInt(props.warppoint, 16);
					if (l < 0 && l > 16) throw "Invalid warp id! "+l;
					cmap.warps[l] = cmap.layers[l] || {};
					cmap.warps[l].loc = [x, y];
					
					if (props.entryanim) {
						// Entry anims: as the scene fades up, the player character walks onto the tile
						//Entry anims: 0 = appear, 5 = beam down
						// 1 = walk up, 2 = walk down, 3 = walk right, 4 = walk left
						var e = parseInt(props.entryanim, 16);
						if (e < 0 && e > 7) throw "Invalid entry anim! "+e;
						cmap.warps[l].anim = e;
					}
				}
			}
			
		}
		cmap.map.set(x, y, tiledata);
	}
	}
	
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
	
	//Now verify all the proper data is here
	__verifyData(cmap);
	
	//Now stringify!
	return JSON.stringify(cmap, function(key, value){
		//We need a replacer because TypedArrays don't properly stringify into arrays
		if (value instanceof Uint16Array) {
			var array = [];
			for (var i = 0; i < value.length; i++) {
				array[i] = value[i];
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
			var _anim = !!cmap.warps[i]["anim"];
			
			if (!(_loc && _anim)) 
				throw "Incomplete Layer definition: Warp "+i+", loc="+_loc+" anim="+_anim;
		}
	}
}
