// Burrito.pokemon/base.js
// 

var Actor = require("tpp-actor");
var SpriteAnimation = require("tpp-actor-animations").SpriteAnimation;

//$ PackConfig
{ "sprites" : [ "base.png", "reading.png" ] }
//$!
module.exports = {
	id: "Burrito.pokemon",
	sprite: "base.png",
	sprite_format: {
		"base.png" : "hg_pokecol-32",
		"reading.png": "burrito_reading",
	},
	
	name: "Burrito",
	infodex: "game.crystal.pokemon.burrito",
	
	sprite_creator: "Carlotta4th",
	
	getSpriteFormat : function(format) {
		if (format == "burrito_reading") {
			return {
				width: 32, height: 32, flip:false,
				frames: {
					"idle0": 	[0, 0], 
					"idle1": 	[0, 1],
					"idle2": 	[0, 2],
					"close0": 	[0, 3],
					"close1": 	[0, 4],
					"talk": 	[0, 5],
					"open0": 	[0, 6],
					"open1": 	[0, 7],
				},
				anims: {
					"stand": new SpriteAnimation({ singleDir: "d", frameLength: 5, }, [
						{ d: "idle0", trans: true, },
						{ d: "idle1", trans: true, },
						{ d: "idle2", trans: true, },
						{ d: "idle1", trans: true, loopTo: 0, },
					]),
					"speak": new SpriteAnimation({ singleDir: "d", frameLength: 5, }, [
						{ d: "close0", },
						{ d: "close1", },
						{ d: "talk",  pause: true, },
						{ d: "open0", },
						{ d: "open1", trans: true, },
					]),
				},
			};
		} else {
			return Actor.prototype.getSpriteFormat("hg_pokecol-32x32");
		}
	},
};