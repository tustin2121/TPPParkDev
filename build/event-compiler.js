// event-compiler.js
// A function that finds compiles global events

var Browserify = require("browserify");

function findGlobalEvents(mapid) {
	var preppedEvents = {};
	
	for (var pi = 0; pi < EVENT_DIRS.length; pi++) {
		if (!fs.existsSync(EVENT_DIRS[pi])) continue;
		
		var dirListing = fs.readdirSync(EVENT_DIRS[pi]);
		for (var di = 0; di < dirListing.length; di++) {
			var file = dirListing[di];
			if (!fs.existsSync(EVENT_DIRS[pi] + file + "/base.js")) continue;
			console.log("[Event] Found event:", file, ">", MAP_DIRS[pi]+file+"/base.js");
			
			if (!fs.existsSync(EVENT_DIRS[pi] + file + "/"+mapid+".js")) continue;
			console.log("[Event] Found event for map:", file, ">", MAP_DIRS[pi]+file+"/"+mapid+".js");
			
			//TODO browserify this event
		}
	}
}
module.exports = findGlobalEvents;


function browserifyEvent(filename) {
	var bundler = new Browserify();
	bundler.add(filename);
	bundler.bundle(function(err, buf){
		
	});
}
