// trigger.js
// Defines a trigger tile(s) used throughout the park

var Event = require("tpp-event");
var inherits = require("inherits");
var extend = require("extend");

/**
 * A trigger is a tile that, when stepped upon, will trigger some event.
 * The most common event tiggered is a warping to another map, for which
 * the subclass Warp is designed for.
 *
 * Triggers may take up more than one space.
 */
function Trigger(base, opts) {
	Event.call(this, base, opts);

	this.on("entering-tile", this.onEntering);	
	this.on("entered-tile", this.onEntered);
	this.on("leaving-tile", this.onLeaving);
	this.on("left-tile", this.onLeft);
}
inherits(Trigger, Event);
extend(Trigger.prototype, {
	//convience functions
	onLeaveToNorth: null,
	onLeaveToSouth: null,
	onLeaveToEast: null,
	onLeaveToWest: null,
	
	onEntering : function(dir) {},
	onLeft : function(dir) {},
	
	onEntered : function(dir) {
		if (typeof this.onTriggerEnter == "function")
			this.onTriggerEnter(); //backwards compatibility to rename
	},
	onLeaving : function(dir) {
		if (typeof this.onTriggerLeave == "function")
			this.onTriggerLeave(); //backwards compatibility to rename
		
		var d = this.divideFacing(dir);
		switch (d) {
			case "n": if (typeof this.onLeaveToNorth == "function") this.onLeaveToNorth(); break;
			case "s": if (typeof this.onLeaveToSouth == "function") this.onLeaveToSouth(); break;
			case "e": if (typeof this.onLeaveToEast == "function") this.onLeaveToEast(); break;
			case "w": if (typeof this.onLeaveToWest == "function") this.onLeaveToWest(); break;
		}
	},
});
module.exports = Trigger;
