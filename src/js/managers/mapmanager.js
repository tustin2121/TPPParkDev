// mapmanager.js
//

var inherits = require("inherits");
var extend = require("extend");
var EventEmitter = require("events").EventEmitter;

function MapManager() {
	
}
inherits(MapManager, EventEmitter);
extend(MapManager.prototype, {
	nextMap: null,
	
	transitionTo : function(mapid, warpindex) {
		UI.fadeOut();
		
		if (this.id == mapid) {
			// No need to download the next map
			
		} else {
			var nmap = this.nextMap = new Map(mapid);
			nmap.download();
		}
		
		
	},
});
