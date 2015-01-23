// LikeASubat.contributor/xTestRoom1.js

var base = require("./base.js")
var Actor = require("tpp-actor");

var LookBehav = require("tpp-behavior").LookAround;

add(new Actor(base, {
	location: [29, 22],
	sprite: "zubat.png",
	
	onEvents: {
		interacted : function() {
			// this.behviorStack.push(null);
			console.log("Interacted Zubat");
			// this.behviorStack.pop();
		},
	},
	
	behaviorStack: [new LookBehav()],
}));