// Katie.pokemon/base.js
// 

//$ PackConfig
{ "sprites" : [ "base.png" ] }
//$!
module.exports = {
	id: "Katie.pokemon",
	sprite: "base.png",
	sprite_format: "hg_pokecol-32",
	
	name: "Katie",
	infodex: "game.crystal.pokemon.katie",
	
	sprite_creator: "Carlotta4th",
	
	getSpriteFormat : function(format) {
		var f = Actor.prototype.getSpriteFormat(format);
		
		if (format == "hg_pokecol-32") {
			f.anims["stand"] = f.anims["_flap_stand"];
			f.anims["stand"].options.frameLength = 8;
		}
		return f;
	},
};