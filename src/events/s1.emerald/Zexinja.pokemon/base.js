// Zexinja.pokemon/base.js
// Defines the base event for myself in the park

var Actor = require("tpp-actor");

//$ PackConfig
{ "sprites" : [ "base.png" ] }
//$!
module.exports = {
	id: "Zexinja.pokemon",
	sprite: "base.png",
	sprite_format: "hg_pokecol-32",
	
	name: "Zexinja",
	infodex: "game.emerald.pokemon.zexinja",
	
	getSpriteFormat : function(format) {
		var f = Actor.prototype.getSpriteFormat(format);
		
		if (format == "hg_pokecol-32") {
			f.anims["stand"] = f.anims["_flap_stand"];
			f.anims["stand"].options.frameLength = 10;
		}
		return f;
	},
};