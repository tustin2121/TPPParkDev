// player-character.js
// Defines the concrete code for a Player Character in the world

var Actor = require("tpp-actor");
var inherits = require("inherits");
var extend = require("extend");

/**
 */
function PlayerChar(){
	Actor.call(this, {}, {});
}
inherits(PlayerChar, Actor);
extend(PlayerChar.prototype, {
	
	reset : function() {
		this.location.set(0, 0, 0);
	},
	
	warpAway : function(animType) {
		
	},
	
	warpTo : function(warpdef) {
		this.location.set(warpdef.loc.x, warpdef.loc.y, warpdef.layer);
		//TODO warpdef.anim
	},
	
});
