// WheatGrain.contributor/xTestRoom1.js

var base = require("./base.js")
var Actor = require("tpp-actor");

var LookBehav = require("tpp-behavior").LookAround;

add(new Actor(base, {
	location: [24, 22],
	onEvents: {
		interacted : function() {
			console.log("Interacted WheatGrain");
		},
	},
	
	behaviorStack: [new LookBehav()],
}));