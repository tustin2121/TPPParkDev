// LikeAZubat.member/base.js
// Defines the base event for myself in the park

var Actor = require("tpp-actor");

//$ PackConfig
{ "sprites" : [ "base.png", "zubat.png" ] }
//$!
module.exports = {
	id: "LikeAZubat.member",
	sprite: "zubat.png",
	sprite_format: {
		"zubat.png" : "hg_pokecol-32",
		"base.png" : "hg_vertmix-32",
	},
	
	name: "Like_a_Zubat",
	infodex: "meta.community.likeazubat",
	
	sprite_creator: "Like_a_Zubat",
	
	getSpriteFormat : function(format) {
		var f = Actor.prototype.getSpriteFormat(format);
		
		if (format == "hg_pokecol-32") {
			f.anims["stand"] = f.anims["_flap_stand"];
			f.anims["stand"].options.frameLength = 4;
		}
		return f;
	},
};