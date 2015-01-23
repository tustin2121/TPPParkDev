// tGallery.js file

var base = require("./base.js")
var Actor = require("tpp-actor");

var MeanderBehav = require("tpp-behavior").Meander;

add(new Actor(base, {
	location: "rand",
	onEvents: {
		interacted : function() {
			console.log("Interacted Tustin");
		},
	},
	
	behaviorStack: [new MeanderBehav()],
}));