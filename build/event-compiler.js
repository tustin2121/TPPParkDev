// event-compiler.js
// A function that finds compiles global events

var Browserify = require("browserify");
var sync = require("synchronize");
var fs = require("fs");

const EXTERNAL_EVENT_LIBS = [
	"/src/js/events/event",
	"/src/js/events/trigger",
	"/src/js/events/warp",
	"/src/js/events/actor",
];

function findGlobalEvents(mapid) {
	var eventPaths = [];
	
	for (var pi = 0; pi < EVENT_DIRS.length; pi++) {
		if (!fs.existsSync(EVENT_DIRS[pi])) continue;
		
		var dirListing = fs.readdirSync(EVENT_DIRS[pi]);
		for (var di = 0; di < dirListing.length; di++) {
			var file = dirListing[di];
			if (!fs.existsSync(EVENT_DIRS[pi] + file + "/base.js")) continue;
			// console.log("[Event] Found event:", file, ">", EVENT_DIRS[pi]+file+"/base.js");
			
			if (!fs.existsSync(EVENT_DIRS[pi] + file + "/"+mapid+".js")) continue;
			console.log("[Event] Found event for map:", file, ">", EVENT_DIRS[pi]+file+"/"+mapid+".js");
			
			eventPaths.push("./"+EVENT_DIRS[pi] + file + "/"+mapid+".js");
		}
	}
	
	//TODO browserify the events together
	var bundler = new Browserify({
		noParse : ["three", "jquery"],
		debug : true,
	});
	bundler.add(eventPaths);
	
	//exclude Actor and the other events
	bundler.external(EXTERNAL_EVENT_LIBS);
	bundler.plugin("minifyify", {
		map: "_srcmaps/maps/"+mapid+"/global.map.json",
		output: "_srcmaps/maps/"+mapid+"/global.map.json",
	});
	
	var data = sync.await(bundler.bundle(sync.defer()));
	console.log("[Event] Bundled", eventPaths.length, "global events.");
	return data;
}
module.exports.findGlobalEvents = findGlobalEvents;


function findLocalEvents(mapid, path) {
	if (!fs.existsSync(path+"/events.js")) return null;
	
	//TODO browserify the events together
	var bundler = new Browserify({
		noParse : ["three", "jquery"],
		debug : true,
	});
	bundler.add(path+"/events.js");
	
	//TODO exclude Actor and the other events
	bundler.external(EXTERNAL_EVENT_LIBS);
	bundler.plugin("minifyify", {
		map: "_srcmaps/maps/"+mapid+"/local.map.json",
		output: "_srcmaps/maps/"+mapid+"/local.map.json",
	});
	
	var data = sync.await(bundler.bundle(sync.defer()));
	return data;
}
module.exports.findLocalEvents = findLocalEvents;
