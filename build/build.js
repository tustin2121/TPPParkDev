// build.js
// The build script for TPP Park v2

var exec = require("child_process").exec;
var fs = require("fs");
var Browserify = require("browserify");
var sync = require("synchronize");
var Fiber = require("synchronize").Fiber;
var rmdir = require("rimraf").sync;
var util = require("util");
var extend = require("extend");
var path = require("path");
var mkdirp = require("mkdirp").sync;

var appCache = [
	"./index.html", "./game.html",
	"js/jquery-2.1.1.min.js", "js/jquery.cookie.js", "js/three.min.js",
	"js/zip/zip.js", "js/zip/zip-fs.js", "js/zip/z-worker.js", "js/zip/inflate.js", //"js/zip/deflate.js",
	"img/missing_sprite.png", "img/missing_tex.png", "img/twitch_emotes.png",
];
var compiledMaps = [];

//////////////// Globals ///////////////////
global.BUILD_OUT = "_out/";
global.BUILD_TEMP = "_outtemp/";
global.TEST_OUT = "_test/";
global.SRC_MAPS = BUILD_OUT+"_srcmaps/";
global.MINIFY = false; //Set to true to minifiy the source

global.EXT_MAPBUNDLE = ".zip"; //Remember to change in src/js/map.js

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
	"src/events/s1.conquest/",
	"src/events/s1.crossgen/",
	"src/events/s2.intermission/",
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
const findGlobalEvents = require("./event-compiler.js").findGlobalEvents;
const checkSyntax = require("./syntax-check.js");
const uniqueCheckGlobalEvents = require("./event-compiler.js").uniqueCheckGlobalEvents;
const createEventLibraryBundle = require("./event-compiler.js").createEventLibraryBundle;
const ByLineReader = require("./transform-streams").ByLineReader;
const ProcessorTransform = require("./transform-streams").ProcessorTransform;
const PrependTransform = require("./transform-streams").PrependTransform;

//////////////// Main ///////////////////
function build(){
	console.time("Build time");
	
	clean();
	
	//Syntax checking
	syntaxCheckAllFiles();
	uniqueCheckGlobalEvents();
	
	//Copy over non-compiled files
	copyLibraryFiles();
	copyResourceFiles();
	copyHtmlFiles();
	copyConfigFiles();
	
	//Compile Less files
	compileLess("src/less/game.less", BUILD_OUT+"css/game.css");
	compileLess("src/less/landing.less", BUILD_OUT+"css/landing.css");
	
	//Bundler the event library
	createEventLibraryBundle();
	
	//Compile every map in the source directory
	findMaps();
	
	//Browserify the source code
	bundle("game");
	bundle("characterSelect", {
		globals: {
			PLAYERCHARS: function() { return JSON.stringify(enumeratePlayerCharacters()); },
		},
	});
	
	//Bundle the dev tools
	copyDevTools();
	bundle("tools/mapview", { 
		dest:BUILD_OUT+"tools/mapview.js", appcache:false, 
		globals: {
			COMPILED_MAPS : function() { return "['"+compiledMaps.join("', '")+"']"; },
		},
	});
	bundle("tools/gallery", { 
		dest:BUILD_OUT+"tools/gallery.js", appcache:false, 
	});
	
	//Rewrite the app cache manifest
	writeCache();
	
	console.timeEnd("Build time");
	
	//Finally, "jekyllify"
	jekyllify();
}


//////////////// Build Steps //////////////////
function clean() {
	console.log("[Clean] Deleting", BUILD_TEMP);
	rmdir(BUILD_TEMP);
	
	console.log("[Clean] Cleaning "+BUILD_OUT);
	__rmFilesIn(BUILD_OUT);
	
	console.log("[Clean] Cleaning "+TEST_OUT);
	__rmFilesIn(TEST_OUT);
	
	return;
	
	function __rmFilesIn(dir) {
		if (!fs.existsSync(dir)) return;
		var dirListing = fs.readdirSync(dir);
		for (var di = 0; di < dirListing.length; di++) {
			var file = dirListing[di];
			
			//skip files and folders starting with a dot, like ".git/"
			if (file.indexOf(".") == 0) continue;
			
			rmdir(dir+file);
		}
	}
}

function compileLess(src, dest) {
	console.log("[Less ] Compiling less", src, ">", dest);
	
	sync.await(exec("lessc "+src+" "+dest, sync.defer()));
	
	// if (exec("lessc "+src+" "+dest) != 0){
	// 	throw new Error("Exec lessc returned non-zero!");
	// }
	appCache.push(dest);
}

function bundle(file, opts) {
	opts = extend({
		dest: BUILD_OUT+"js/"+file+".js",
		src: "./src/js/"+file+".js",
		map: file+".map.json",
		appcache: true,
	}, opts);
	console.log("[Brify] Browserifying "+file+".js");
	
	var bundler = new Browserify({
		noParse : ["three", "jquery"],
		debug : true,
		insertGlobalVars : opts.globals,
	});
	
	bundler.exclude("three");
	bundler.exclude("jquery");
	
	// Externalize the Event Library
	bundler.external(EXTERNAL_EVENT_LIBS);
	bundler.plugin("minifyify", {
		map: SRC_MAPS+opts.map, //TODO Needs "/" in front?
		output: SRC_MAPS+opts.map,
		minify: MINIFY,
	});
	
	bundler.add(opts.src);
	if (opts.and) {
		bundler.add(opts.and);
	}
	
	var data = sync.await(bundler.bundle(sync.defer()));
	fs.writeFileSync(opts.dest, data);
	
	if (opts.appcache) 
		appCache.push("js/"+file+".js");
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
	
	fs.writeFileSync(BUILD_OUT+"appcache.mf", txt);
}
///////////////////////// Copying Files /////////////////////////////
function copyLibraryFiles() {
	//These copies can happen in parallel
	sync.parallel(function(){
		copyFile("lib/jquery-2.1.1.min.js", BUILD_OUT+"js/jquery-2.1.1.min.js");
		copyFile("lib/jquery.cookie.js", BUILD_OUT+"js/jquery.cookie.js");
		copyFile("lib/jquery.base64.js", BUILD_OUT+"js/jquery.base64.js");
		
		copyFile("lib/three.min.js", BUILD_OUT+"js/three.min.js");
		
		copyDirectory("lib/zip/", BUILD_OUT+"js/zip/");
		
		copyFile("src/js/preload.js", BUILD_OUT+"js/preload.js");
	});
	var l = sync.await();
	console.log("[Copy ] Copied", l.length, "library files.");
}

function copyResourceFiles() {
	//These copies can happen in parallel
	sync.parallel(function(){
		copyDirectory("res/img/", BUILD_OUT+"img/");
		copyDirectory("res/snd/", BUILD_OUT+"snd/");
		copyDirectory("res/css/", BUILD_OUT+"css/");
		
	});
	var l = sync.await();
	console.log("[Copy ] Copied", l.length, "static image files.");
}

function copyHtmlFiles() {
	//These copies can happen in parallel
	sync.parallel(function(){
		copyFileWithJekyllPrepend("src/game.html", BUILD_OUT+"/game.html");
		copyFileWithJekyllPrepend("src/index.html", BUILD_OUT+"/index.html");
		
	});
	var l = sync.await();
	console.log("[Copy ] Copied", l.length, "html files.");
	return;
	
}

function copyConfigFiles() {
	//These copies can happen in parallel
	sync.parallel(function(){
		copyFile("src/.htaccess", BUILD_OUT+"/.htaccess");
		copyFile("src/_config.yml", BUILD_OUT+"/_config.yml");
		
		copyFile("ParkReadme.md", BUILD_OUT+"/README.md");
		
	});
	var l = sync.await();
	console.log("[Copy ] Copied", l.length, "config files.");
}

function copyDevTools() {
	//These copies can happen in parallel
	sync.parallel(function(){
		copyDirectory("lib/tools/", BUILD_OUT+"tools/");
		copyFileWithJekyllPrepend("src/tools/mapview.html", BUILD_OUT+"tools/mapview.html");
		copyFileWithJekyllPrepend("src/tools/gallery.html", BUILD_OUT+"tools/gallery.html");
		
	});
	var l = sync.await();
	console.log("[Copy ] Copied", l.length, "dev tools files.");
}

function copyFile(src, dest, noDefer) {
	var dir = path.dirname(dest);
	if (!fs.existsSync(dir)) {
		mkdirp(dir);
	}
	
	var sfile = fs.createReadStream(src);
	var dfile = fs.createWriteStream(dest);
	
	if (!noDefer) dfile.on("finish", sync.defer());
	
	sfile.pipe(dfile);
}

function copyFileWithJekyllPrepend(src, dest, noDefer) {
	var dir = path.dirname(dest);
	if (!fs.existsSync(dir)) {
		mkdirp(dir);
	}
	
	var sfile = fs.createReadStream(src);
	var dfile = fs.createWriteStream(dest);
	var prepend = new PrependTransform(
		"---\n"+
		"---\n"+
		"{% capture baseurl %}{{ site.github.project_title | prepend:'/' }}{% endcapture %}\n");
	
	if (!noDefer) dfile.on("finish", sync.defer());
	
	sfile.pipe(prepend).pipe(dfile);
}

function copyDirectory(src, dest, noDefer) {
	__findFilesIn(src, dest);
	
	function __findFilesIn(dir, out) {
		if (!fs.existsSync(out)) { mkdirp(out); }
		
		var dirListing = fs.readdirSync(dir);
		for (var di = 0; di < dirListing.length; di++) {
			var file = dirListing[di];
			
			// console.log("[ESVal] File: ", dir+file); nextTick();
			var stat = fs.statSync(dir+file);
			if (stat.isFile()) 
			{
				var sfile = fs.createReadStream(dir+file);
				var dfile = fs.createWriteStream(out+file);
				
				if (!noDefer) dfile.on("finish", sync.defer());
				
				sfile.pipe(dfile);
			}
			else
			{
				__findFilesIn(dir+file+"/", out+file+"/");
			}
		}
	}
}

////////////////////////////////////////////////////////////

function enumeratePlayerCharacters() {
	var pcs = {};
	
	var dirListing = fs.readdirSync("res/img/pcs/");
	for (var di = 0; di < dirListing.length; di++) {
		var file = dirListing[di];
		
		if (path.extname(file) == ".png") {
			var res = /^([^\[]+)\[([^\]]+)\].png$/.exec(file);
		
			var name = file;
			var format = res[2];
			pcs[name] = format;
		}
	}
	
	return pcs;
}

function findMaps() {
	console.log("[cMaps] Begining Map Compilation");
	if (!fs.existsSync(BUILD_OUT+"maps")) {
		mkdirp(BUILD_OUT+"maps");
	}
	
	var total = 0, success = 0;
	for (var pi = 0; pi < MAP_DIRS.length; pi++) {
		if (!fs.existsSync(MAP_DIRS[pi])) continue;
		
		var dirListing = fs.readdirSync(MAP_DIRS[pi]);
		for (var di = 0; di < dirListing.length; di++) {
			var file = dirListing[di];
			console.log("\n[cMaps] Compiling Map", '"'+file+'"', "from file", MAP_DIRS[pi]+file);
			total++;
			
			try {
				var res = compileMap(file, MAP_DIRS[pi]+file);
				if (res) {
					console.log("[cMaps] Skipping compilation of", '"'+file+'":', res);
				} else {
					success++;
					compiledMaps.push(file);
				}
			} catch (e) {
				console.log("[cMaps] ERROR while compiling", '"'+file+'"', "\n"+e+"\n"+e.stack);
				nextTick();
				// if (typeof e == "string")
				// 	throw new Error(e);
				// else
				// 	throw e;
			}
		}
	}
	console.log("\n[cMaps] Compiled", success, "out of", total, "maps successfully.");
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

/* 
	Due to how github pages does subdomains, we need to replace instances of 
	{{ site.baseurl }} with an actual subdomain, and put it to YET ANOTHER folder
	after transforming it, before we can test...
	
	This should be the final step of the build process, mainly because it copies files
	in a non-sequential manner.
*/
function jekyllify() {
	
	console.log("\n[Jekyl] Jekyll-ifying output for testing.");
	
	__findFilesIn(BUILD_OUT, TEST_OUT, "");
	
	return;
	
	function __findFilesIn(base, dest, dir) {
		var dirListing = fs.readdirSync(base+dir);
		for (var di = 0; di < dirListing.length; di++) {
			var file = dirListing[di];
			// Jekyll does not build the following files:
			if (file.indexOf(".") == 0) continue; //hidden or used for backup
			if (file.indexOf("#") == 0) continue; //start with . or #
			if (file.indexOf("_") == 0) continue; //"contain site configuration" (start with _)
			if (file.lastIndexOf("~") == file.length-1) continue; //end with ~
			
			
			// console.log("[ESVal] File: ", dir+file); nextTick();
			var stat = fs.statSync(base+dir+file);
			if (stat.isFile()) 
			{
				var ext = file.substr(file.lastIndexOf(".")+1);
				switch (ext) {
					case "js":
					case "css":
					case "html":
					case "mf":
						__filterCopyFile(base+dir+file, dest+dir+file);
						break;
					default:
						copyFile(base+dir+file, dest+dir+file, true);
						break;
				}
			} else {
				__findFilesIn(base, dest, dir+file+"/");
			}
		}
	}
	
	function __filterCopyFile(src, dest) {
		var dir = path.dirname(dest);
		if (!fs.existsSync(dir)) {
			mkdirp(dir);
		}
		
		var sfile = fs.createReadStream(src);
		var dfile = fs.createWriteStream(dest);
		var byline = new ByLineReader();
		var process = new ProcessorTransform(function(chunk){
			if (chunk.indexOf("---") == 0) return "";
			if (chunk.indexOf("{% capture") == 0) return "";
			return chunk.replace(/\{\{ baseurl \}\}/g, "");
		});
		
		sfile.pipe(byline).pipe(process).pipe(dfile);
	}
	
}


/////////////////// Finally, call main ///////////////////
sync.fiber(build);