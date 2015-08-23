// Pioxys.member/base.js
// Defines the base event for myself in the park

var Actor = require("tpp-actor");

//$ PackConfig
{ "sprites" : [ "Pioxys_Sprite_DNA.png"] }
//$!
module.exports = {
	id: "Pioxys.member",
	sprite: "Pioxys_Sprite_DNA.png",
	sprite_format: {
		"Pioxys_Sprite_DNA.png" : "hg_pokecol-32",
		"base.png" : "hg_vertmix-32",
	},
	
	name: "Pioxys",
	infodex: "meta.community.pioxys",
	
	sprite_creator: "Deadinsky66",
};