// build.js
// The build script for TPP Park v2

var exec = require("child_process").exec;
var fs = require("fs");
var Browserify = require("browserify");
var exec = require("execSync").run;

var appCache = [
	"./index.html", "./game.html",
	"js/jquery-2.1.1.min.js", "js/jquery.cookie.js", "js/three.min.js",
];

//////////////// Main ///////////////////
function build(){
	console.time("Build time");
	
	//Compile Less files
	compileLess("src/less/game.less", "css/game.css");
	
	//Compile every map in the source directory
	findMaps();
	
	//Browseify the source code
	bundleGame();
	
	//Rewrite the app cache manifest
	writeCache();
	
	console.timeEnd("Build time");
}


//////////////// Build Steps //////////////////
function compileLess(src, dest) {
	console.log("[Less ] Compiling less", src, ">", dest);
	
	if (exec("lessc "+src+" "+dest) != 0){
		throw new Error("Exec lessc returned non-zero!");
	}
	appCache.push(dest);
}

function bundleGame() {
	console.log("[Brify] Browserifying game.js");
	
	var bundler = new Browserify({
		noParse : ["three", "jquery"],
		debug : true,
	});
	
	bundler.exclude("three");
	
	bundler.plugin("minifyify", {
		map: "_srcmaps/game.map.json",
		output: "_srcmaps/game.map.json",
	});
	
	bundler.add("./src/game.js");
	bundler.bundle().pipe(fs.createWriteStream("./js/game.js"));
	appCache.push("js/game.js");
}

function writeCache() {
	console.log("[Cache] Writing cache manifest");
	
	var txt = "CACHE MANIFEST\n";
	txt += "# " + new Date().toISOString() + "\n\n";
	txt += "# Explicitly cached 'master entries'.\nCACHE:\n";
	
	appCache.sort();
	var lastpath = ".";
	for (var i = 0; i < appCache.length; i++) {
		var file = appCache[i];
		var path = file.substring(0, file.lastIndexOf("/"));
		if (path != lastpath) {
			txt += "\n"; 
			lastpath = path;
		}
		if (file.substr(0, 2) == "./") file = file.substr(2);
		txt += file + "\n";
	}
	txt += "\n\n";
	txt += "# Resources that require the user to be online.\n";
	txt += "NETWORK:\n*\n\nFALLBACK:";
	
	fs.writeFileSync("appcache.mf", txt);
}


////////////// Map Compiling ///////////////
const MAP_DIRS = [
	"src/maps/",
];
function findMaps() {
	console.log("[cMaps] Finding maps: ");
	for (var pi = 0; pi < MAP_DIRS.length; pi++) {
		var dirListing = fs.readdirSync(MAP_DIRS[pi]);
		
		for (var di = 0; di < dirListing.length; di++) {
			var file = dirListing[di];
			// if (file.)
			
			console.log("[cMaps] Found map:", file);
			
			
		}
	}
}

const EVENT_DIRS = [
	"src/events/meta.community/",
	"src/events/meta.streamers/",
	"src/events/s1.red/",
	"src/events/s1.crystal/",
	"src/events/s1.emerald/",
	"src/events/s1.firered/",
	"src/events/s1.platinum/",
	"src/events/s1.heartgold/",
	"src/events/s1.black/",
	"src/events/s1.blazeblack2/",
	"src/events/s1.x/",
	"src/events/s1.omegaruby/",
];
function findGlobalEvents(mapid) {
	
}



/////////////////// Finally, call main ///////////////////
build();