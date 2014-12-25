// build.js
// The build script for TPP Park v2

var exec = require("child_process").exec;
var fs = require("fs");
var Browserify = require("browserify");
var sync = require("synchronize");
var Fiber = require("synchronize").Fiber;
var rmdir = require("rimraf").sync;
var util = require("util");

var appCache = [
	"./index.html", "./game.html",
	"js/jquery-2.1.1.min.js", "js/jquery.cookie.js", "js/three.min.js",
	"js/zip/zip.js", "js/zip/zip-fs.js", "js/zip/inflate.js", //"js/zip/deflate.js",
];

//////////////// Globals ///////////////////
global.BUILD_TEMP = "_outtemp/";

global.SRC_DIRS = [ // Directories to be syntax checked
	"src/",
];
global.MAP_DIRS = [
	"src/maps/",
];
global.EVENT_DIRS = [
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

global.nextTick = function() {
	var fiber = Fiber.current;
	process.nextTick(function() {
		fiber.run();
	});
	Fiber.yield();
}
global.sleep = function(time) {
	var fiber = Fiber.current;
	setTimeout(function() {
		fiber.run();
	}, time);
	Fiber.yield();
}

const compileMap = require("./map-zipper.js");
const findGlobalEvents = require("./event-compiler.js");
const checkSyntax = require("./syntax-check.js");

//////////////// Main ///////////////////
function build(){
	console.time("Build time");
	
	clean();
	
	//Syntax checking
	syntaxCheckAllFiles();
	
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
function clean() {
	console.log("[Clean] Deleting", BUILD_TEMP);
	rmdir(BUILD_TEMP);
}

function compileLess(src, dest) {
	console.log("[Less ] Compiling less", src, ">", dest);
	
	sync.await(exec("lessc "+src+" "+dest, sync.defer()));
	
	// if (exec("lessc "+src+" "+dest) != 0){
	// 	throw new Error("Exec lessc returned non-zero!");
	// }
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
	
	bundler.add("./src/js/game.js");
	
	var data = sync.await(bundler.bundle(sync.defer()));
	// console.log(data);
	
	fs.writeFileSync("js/game.js", data);
	
	// var writestr = fs.createWriteStream("./js/game.js");
	//bundler.bundle().pipe(writestr);
	// writestr.on("finish", sync.defer());
		
	// sync.await();
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


////////////////////////////////////////////////////////////

function findMaps() {
	console.log("[cMaps] Finding maps: ");
	for (var pi = 0; pi < MAP_DIRS.length; pi++) {
		if (!fs.existsSync(MAP_DIRS[pi])) continue;
		
		var dirListing = fs.readdirSync(MAP_DIRS[pi]);
		for (var di = 0; di < dirListing.length; di++) {
			var file = dirListing[di];
			console.log("[cMaps] Found map:", file, ">", MAP_DIRS[pi]+file);
			
			try {
				compileMap(file, MAP_DIRS[pi]+file);
			} catch (e) {
				console.error("[cMaps] ERROR compiling map: "+file);
				if (typeof e == "string")
					throw new Error(e);
				else
					throw e;
			}
		}
	}
}

function syntaxCheckAllFiles() {
	console.log("[ESVal] Beginning syntax validation");
	
	for (var pi = 0; pi < SRC_DIRS.length; pi++) {
		if (!fs.existsSync(SRC_DIRS[pi])) continue;
		__findFilesIn(SRC_DIRS[pi]);
	}
	
	console.log("[ESVal] Syntax validation completed");
	return;
	
	function __findFilesIn(dir) {
		var dirListing = fs.readdirSync(dir);
		for (var di = 0; di < dirListing.length; di++) {
			var file = dirListing[di];
			
			// console.log("[ESVal] File: ", dir+file); nextTick();
			var stat = fs.statSync(dir+file);
			if (stat.isFile()) 
			{
				var ext = file.substr(file.lastIndexOf(".")+1);
				var res = checkSyntax(dir+file, ext);
				if (res) {
					if (res instanceof Error) {
						if (res.description) {
							console.log("[ESVal] Error found while validating", 
								dir+file, "(line "+ res.lineNumber+":"+res.column+")");
							console.log("    "+res.description);
						} else {
							console.log("[ESVal] Error found while validating", dir+file);
							console.log(res.toString());
						}
						sleep(100); throw -1;
					} else if (util.isArray(res)) {
						console.log("[ESVal] Multiple errors found while validating", dir+file);
						for (var i = 0; i < res.length; i++) {
							console.log(res[i]);
						}
						sleep(100); throw -1;
					} else {
						console.log("[ESVal] Validation returned object for file", dir+file);
						console.log(res);
						sleep(100); throw res;
					}
				}
			} else {
				__findFilesIn(dir+file+"/");
			}
		}
	}
}


/////////////////// Finally, call main ///////////////////
sync.fiber(build);