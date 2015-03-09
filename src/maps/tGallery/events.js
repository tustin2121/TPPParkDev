// tGallery/events.js

var Event = require("tpp-event");
var Sign = require("tpp-sign");
var Warp = require("tpp-warp");

add(new Warp({
	id: "EXIT_Ledge",
	locations: [2, 12],
	exit_to: { map: "xInfiniteLedge", warp: 0x00, }
}));

add(new Warp({
	id: "EXIT_Dungeon",
	locations: [18, 18],
	exit_to: { map: "doritodungeon", warp: 0x00, } //invalid map id
}));


add(new Sign({
	id: "SIGN_Ledge",
	locations: [2, 16],
	read: false,
	canWalkOn : function(){ return this.read; },
	
	signType: 0,
	text: [
		"Odd, there seems to be something written on the wall here:",
		'"Often time we see things that aren\'t really there, and that can lead us to unreal locations..."',
		function(){ this.read = true; },
		'"-- The Trick Master"',
	],
}));