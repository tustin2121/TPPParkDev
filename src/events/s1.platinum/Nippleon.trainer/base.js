// Nippleon.trainer/base.js
// Defines the base event for Nippleon

//$ PackConfig
{ "sprites" : [ "base.png", "bike.png", "tuxedo.png" ] }
//$!

module.exports = {
	id: "Nippleon.trainer",
	sprite: "base.png",
	sprite_format: {
		"base.png": "pt_vertcol-32",
		"bike.png" : "pt_vertcol-32",
		"tuxedo.png": "pt_vertcol-32",
	},
	
	name: "Napoleon",
	infodex: "game.platinum.trainer.nippleon",
	
	sprite_creator: "Nintendo",
};