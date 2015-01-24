// tGallery.js file

var base = require("./base.js")
var Actor = require("tpp-actor");

var MeanderBehav = require("tpp-behavior").Meander;

add(new Actor(base, {
	location: "rand",
	onEvents: {
		interacted : function() {
			$("#statusbar").html("This is "+this.name+"! ("+this.id+")");
		},
	},
	
	behaviorStack: [new MeanderBehav()],
}));