// EnderShaman.contributor/xTestRoom1.js

var base = require("./base.js")
var Actor = require("tpp-actor");

var LookBehav = require("tpp-behavior").LookAround;

add(new Actor(base, {
	location: [22, 18],
	onEvents: {
		interacted : function() {
			console.log("Interacted EnderShaman");
		},
	},
	
	behaviorStack: [new LookBehav()],
}));