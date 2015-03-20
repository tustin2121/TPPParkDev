// infodex-compiler.js
//

var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp").sync;

const TEMP_DEX = BUILD_TEMP+"_infodex_";

var finaldex = {};

function compileInfodex() {
	console.log("\n[InfoD] Compiling Infodex.");
	
	mkdirp(TEMP_DEX);
	
	collateLocalEntries();
	collateGlobalEntries();
	generateIndexes();
	
	//zipWorkingDirectory(); TODO
	
	outputReport();
}
module.exports = compileInfodex;

function collateLocalEntries() {
	_processDir(INFODEX_DIR);
	
	var files = 0;
	
	function _processDir(src) {
		var dirListing = fs.readdirSync(src);
		for (var di = 0; di < dirListing.length; di++) {
			var file = dirListing[di];
			
			var stat = fs.statSync(src+file);
			if (stat.isFile()) {
				copyInfodexEntry(src+file);
				files++;
			} else {
				_processDir(src+file+"/");
			}
			nextTick();
		}
	}
	
	console.log("[InfoD] Collated "+files+" local Infodex entries.");
	nextTick();
}

function collateGlobalEntries() {
	var files = 0;
	//TODO
	console.log("[InfoD] Collated "+files+" global Infodex entries.");
	nextTick();
}

function generateIndexes() {
	var files = 0;
	//TODO
	console.log("[InfoD] Generated "+files+" index pages.");
	nextTick();
}

function outputReport() {
	fs.writeFileSync(TEMP_DEX+"_infodex_report.json", JSON.stringify(finaldex));
	console.log("[InfoD] Output finaldex metadata.");
	nextTick();
}


function copyInfodexEntry(src) {
	var entry = fs.readFileSync(src, "utf8");
	var meta = {
		type: null,
		attrs: {},
	};
	
	var res = /<(index|pokemon|event|trainer)([^>]+)>/i.exec(entry);
	if (!res) {
		throw new Error("Infodex Entry "+src+" is invalid!");
	}
	console.log("RES = ", res[0], res[1], res[2]); sleep(500);
	
	meta.type = res[1];
	{
		var attrs = res[2].trim();
		var attrrgx = /([a-zA-Z0-9]+) ?= ?"([^"]*)"/ig; //must use same regex instance, don't define in loop
		while((res = attrrgx.exec(attrs)) !== null) {
			console.log("RES2 = ", res[0], res[1], res[2]); sleep(500);
			//Loop through attributes
			switch (res[1]) {
				case "name": meta.name = res[2]; break;
				case "id": meta.id = res[2]; break;
				default:
					meta.attrs[res[1]] = res[2];
			}
		}
		console.log("META = ", meta.type, meta.id, meta.name); sleep(500);
	}
	if (!meta.type || !meta.id) {
		console.log("Infodex Entry "+src+" is malformed! Skipping!");
		return;
	}
	
	if (meta.type == "index") {
		// Store the contents of the index for later, don't write now
		meta.contents = entry;
	} else {
		// Write out the file now in its requested location
		var path = meta.id.replace(".", "/");
		path += ".html";
		
		var dir = path.dirname(path);
		if (!fs.existsSync(dir)) {
			mkdirp(dir);
		}
		
		fs.writeFileSync(TEMP_DEX+path, entry);
	}
	__storeMeta(meta);
	return;
	
	function __storeMeta(meta) {
		var dex = finaldex;
		var id = meta.id.split(".");
		for (var i = 0; i < id.length-1; i++) {
			var d = dex[id[i]];
			if (!d) {
				d = dex[id[i]] = {};
			}
			if (d.type) { 
				throw new Error("Invalid dex structure! Attempted to navigate into a leaf node! "+meta.id);
			}
			dex = d;
		}
		var lastid = id[id.length-1];
		
		if (meta.type == "index") {
			dex[lastid] = {};
			dex[lastid]._index = meta;
		} else {
			dex[lastid] = meta;
		}
	}
}








function zipWorkingDirectory(id) {
	var outstr = fs.createWriteStream(BUILD_OUT+"infodex.zip");
	var arch = archiver("zip");
	
	outstr.on("finish", sync.defer());
	arch.pipe(outstr);
	arch.bulk([
		{ expand: true, cwd: BUILD_TEMP+id, src: ["**"], flatten: false, },
		//{ expand: true, cwd: 'source', src: ["**"], dest: 'source' },
	]);
	arch.finalize();
	
	sync.await();
	console.log("[cMaps] Zipped file:", "maps/"+id+".zip", "["+arch.pointer()+" bytes]");
}