// warp.js
// Defines a warp tile used throughout the park.

var Trigger = require("tpp-trigger");
var inherits = require("inherits");
var extend = require("extend");

/**
 * A warp is an event that, when walked upon, will take the player to another map or
 * area within the same map. Different types of warps exist, ranging from the standard
 * door warp to the teleport warp. Warps can be told to activate upon stepping upon them
 * or activate upon stepping off a certain direction.
 */
function Warp(base, opts) {
	Trigger.call(this, base, opts);
	
}
inherits(Warp, Trigger);
extend(Warp.prototype, {
	sound: "exit_walk",
	exit_to: null,
	
	onTriggerEnter : function(dir) {
		SoundManager.playSound(this.sound);
		if (!this.exit_to) return;
		MapManager.transitionTo(this.exit_to.map, this.exit_to.warp);
	},
});
module.exports = Warp;