// Red.trainer/base.js
// Defines the base event for Red

//$ PackConfig
{ "sprites" : [ "base.png" ] }
//$!

module.exports = {
	id: "Red.trainer",
	sprite: "base.png",
	sprite_format: "hg_vertmix-32",
	
	name: "Red",
	infodex: "game.red.trainer.red",
	
	schedule: {
		"0000": "iChurchOfHelix", //midnight to 10am
		"1000": null, //TODO
		"2200": "iChurchOfHelix", //10pm to midnight
	},
};