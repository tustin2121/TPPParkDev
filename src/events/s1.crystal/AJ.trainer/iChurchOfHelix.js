// AJ.trainer/iChurchOfHelix.js
// Defines AJ's event for the "Church of Helix" map

// //$ PackConfig
// { "sprites" : [ "church.png" ] }
// //$!

var base = require("./base.js")
var Actor = require("tpp-actor");

add(new Actor(base, {
	location: [8, 7],
	onEvents: {
		interacted : function() {
			console.log("INTERACTED!");
		},
	},
}));

