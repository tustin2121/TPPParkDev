// Kenya.pokemon/base.js
// The base actor class for our beloved Kenya the Groudon

var Actor = require("tpp-actor");

//$ PackConfig
{ "sprites" : [ "base.png"] }
//$!
module.exports = {
	id: "Kenya.pokemon",
	sprite: "base.png",
	sprite_format: "kenya_base",
	scale: 2,
	
	name: "Kenya",
	infodex: "game.heartgold.pokemon.kenya",
	
	getSpriteFormat : function(format) {
		if (format == "kenya_base") {
			return {
				width: 64, height: 64, flip:false,
				frames: {
					"u0": null, "u1": [1, 0], "u2": [1, 1],
					"d0": null, "d1": [0, 0], "d2": [1, 0],
					"l0": null, "l1": [2, 0], "l2": [3, 0],
					"r0": null, "r1": [2, 1], "r2": [3, 1],
					
					"sp0": [0, 2], "sp1": [0, 3],
					"e0": [1, 2], "e1": [2, 2], "e2": [2, 3], 
					"e3": [3, 2], "e4": [3, 3], "e5": [1, 3],
				},
				anims: {
					"stand": new SpriteAnimation({ singleFrame: true, }, [
						{ u: "sp0", d: "d2", l: "l1", r: "r1", trans: true, pause: true, },
					]),
					"walk": new SpriteAnimation({ frameLength: 5, keepFrame: true, }, [
						{ u: "u1", d: "d1", l: "l1", r: "r1", trans: true, },
						{ u: "u2", d: "d2", l: "l2", r: "r2", loopTo: 0, },
					]),
					"shufflePapers": new SpriteAnimation({ frameLength: 5, singleDir: "u" }, [
						{ u: "sp0", trans: true, },
						{ u: "sp1", loopTo: 0, },
					]),
					"eatLetter": new SpriteAnimation({ frameLength: 5, singleDir: "r" }, [
						{ r: "e0", },
						{ r: "e1", },
						{ r: "e2", },
						{ r: "e3", trans: true, },
						{ r: "e4", loopTo: 3, },
					]),
					"eatLetterEnd": new SpriteAnimation({ frameLength: 5, singleDir: "r" }, [
						{ r: "e4", },
						{ r: "e3", },
						{ r: "e4", },
						{ r: "e5", },
						{ r: "e0", trans: true, },
					]),
				}
			};
			
		} else if (format == "kenya_swim") {
			Actor.getSpriteFormat("hg_pokecol-64x32");
		}
	}
};
