// Tustin2121.contributor/xTestRoom1.js

var base = require("./base.js")
var Actor = require("tpp-actor");

var MeanderBehav = require("tpp-behavior").Meander;

add(new Actor(base, {
	location: [29, 18],
	onEvents: {
		interacted : function() {
			console.log("Interacted Tustin");
		},
	},
	
	shouldAppear : function(mapid) { return true; },
	
	behaviorStack: [new MeanderBehav()],
}));