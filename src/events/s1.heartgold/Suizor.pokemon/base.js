// Suizor.pokemon/base.js
// 

//$ PackConfig
{ "sprites" : [ "base.png" ] }
//$!
module.exports = {
	id: "Suizor.pokemon",
	sprite: "base.png",
	sprite_format: "hg_pokecol-32",
	
	name: "Suizor",
	infodex: "game.heartgold.pokemon.suizor",
	
	sprite_creator: "Carlotta4th",
	
	getSpriteFormat : function(format) {
		var f = require("tpp-actor").prototype.getSpriteFormat(format);
		
		if (format == "hg_pokecol-32") {
			f.anims["stand"] = f.anims["_flap_stand"];
			f.anims["stand"].options.frameLength = 16;
		}
		return f;
	},
};