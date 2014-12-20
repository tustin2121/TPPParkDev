// event-compiler.js
// A function that finds compiles global events

var Browserify = require("browserify");
var sync = require("synchronize");

function findGlobalEvents(mapid) {
	var eventPaths = [];
	
	for (var pi = 0; pi < EVENT_DIRS.length; pi++) {
		if (!fs.existsSync(EVENT_DIRS[pi])) continue;
		
		var dirListing = fs.readdirSync(EVENT_DIRS[pi]);
		for (var di = 0; di < dirListing.length; di++) {
			var file = dirListing[di];
			if (!fs.existsSync(EVENT_DIRS[pi] + file + "/base.js")) continue;
			console.log("[Event] Found event:", file, ">", MAP_DIRS[pi]+file+"/base.js");
			
			if (!fs.existsSync(EVENT_DIRS[pi] + file + "/"+mapid+".js")) continue;
			console.log("[Event] Found event for map:", file, ">", MAP_DIRS[pi]+file+"/"+mapid+".js");
			
			eventPaths.push("/"+EVENT_DIRS[pi] + file + "/"+mapid+".js");
		}
	}
	
	//TODO browserify the events together
	var bundler = new Browserify();
	bundler.add(eventPaths);
	
	//TODO exclude Actor and the other events
	bundler.external([
		"/src/js/events/event",
		"/src/js/events/trigger",
		"/src/js/events/warp",
		"/src/js/events/actor",
	]);
	
	var data = sync.await(bundler.bundle(sync.defer()));
	return data;
}
module.exports = findGlobalEvents;
