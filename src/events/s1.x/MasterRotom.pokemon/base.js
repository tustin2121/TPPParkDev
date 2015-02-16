// MasterRotom.pokemon/base.js
// 

//$ PackConfig
{ "sprites" : [ "base.png" ] }
//$!
module.exports = {
	id: "MasterRotom.pokemon",
	sprite: "base.png",
	sprite_format: "hg_pokecol-32",
	
	name: "Master Rotom",
	infodex: "game.x.pokemon.masterrotom",
	
	sprite_creator: "Carlotta4th",
	
	getSpriteFormat : function(format) {
		var f = require("tpp-actor").prototype.getSpriteFormat(format);
		
		if (format == "hg_pokecol-32") {
			f.anims["stand"] = f.anims["_flap_stand"];
			f.anims["stand"].options.frameLength = 6;
		}
		return f;
	},
};