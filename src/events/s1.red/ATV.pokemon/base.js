// ATV.pokemon/base.js
// Defines the base event for ATV

var Actor = require("tpp-actor");
var SpriteAnimation = require("tpp-actor-animations").SpriteAnimation;

//$ PackConfig
{ "sprites" : [ "base.png" ] }
//$!

module.exports = {
	id: "ATV.pokemon",
	sprite: "base.png",
	sprite_format: "hg_poke_horzcol-32",
	
	name: "ATV",
	infodex: "game.red.pokemon.atv",
	
	getSpriteFormat : function(format) {
		var f = Actor.prototype.getSpriteFormat(format);
		
		$.extend(f.frames, {
			"d3": [0, 2], "u3": [1, 2], "l3": [2, 2], "r3": [3, 2],
		});
		
		f.anims["stand"] = new SpriteAnimation({ }, [
			{ u: "u2", d: "d2", l: "l2", r: "r2", frameLength: 15, trans: true, },
			{ u: "u3", d: "d3", l: "l3", r: "r3", frameLength:  7, trans: true, loopTo: 0, },
		]);
		
		return f;
	},
};