// Tustin2121.contributor/iCasino.js
// Defines the event for Tustin in Napoleon's casino

var base = require("./base.js")
var Actor = require("tpp-actor");
var FaceDirection = require("tpp-behavior").FaceDirection;
var TalkingBehav  = require("tpp-behavior").Talking;

add(new Actor(base, {
	location: [40, 7], //"rand",
	onEvents: {
		interacted: function() {
			var self = this;
			// $("#statusbar").html("This is "+this.name+"! ("+this.id+")<br/>This sprite was created by "+this.sprite_creator+"!");
			
			self.behaviorStack.push(new TalkingBehav({
				dialog: [ 
					"Tustin2121: Hey, welcome to Napoleon's preview dance party!",
					"I'm not really one to dance, or, you know, go to parties in the first place.",
					"But I founded Surldab City, so it's kind of required that I attend.",
				],
				dialog_type: "text",
				owner: self,
			}));
		},
	},
	
	behaviorStack: [new FaceDirection(1, 0)],
	shouldAppear: function() { return true; },
}));