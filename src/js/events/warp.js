// warp.js
// Defines a warp tile used throughout the park.

var Event = require("tpp-event");
var inherits = require("inherits");
var extend = require("extend");

/**
 * A warp is an event that, when walked upon, will take the player to another map or
 * area within the same map. Different types of warps exist, ranging from the standard
 * door warp to the teleport warp. Warps can be told to activate upon stepping upon them
 * or activate upon stepping off a certain direction.
 */
function Warp(base, opts) {
	Event.call(this, base, opts);
	
	this.on("entered-tile", this._entered_tile);
}
inherits(Warp, Event);
extend(Warp.prototype, {
	sound: "exit_walk",
	
	_entered_tile : function(dir) {
		SoundManager.playSound(this.sound);
	},
});