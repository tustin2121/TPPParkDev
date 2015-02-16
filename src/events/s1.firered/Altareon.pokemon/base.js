// Altareon.pokemon/base.js
// 

//$ PackConfig
{ "sprites" : [ "base.png" ] }
//$!
module.exports = {
	id: "Altareon.pokemon",
	sprite: "base.png",
	sprite_format: "hg_pokecol-32",
	
	name: "Altareon",
	infodex: "game.firered.pokemon.altareon",
	
	sprite_creator: "Carlotta4th",
	
	getSpriteFormat : function(format) {
		var f = require("tpp-actor").prototype.getSpriteFormat(format);
		
		if (format == "hg_pokecol-32") {
			f.anims["stand"] = f.anims["_flap_stand"];
			f.anims["stand"].options.frameLength = 12;
		}
		return f;
	},
};