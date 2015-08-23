// Quilava.trainer/iCasino.js
// Defines the event for Quilava in Napoleon's casino

var base = require("./base.js")
var Actor = require("tpp-actor");
var FaceDirection = require("tpp-behavior").FaceDirection;
var TalkingBehav  = require("tpp-behavior").Talking;

add(new Actor(base, {
	location: [41, 7], //"rand",
	onEvents: {
		interacted: function() {
			var self = this;
			// $("#statusbar").html("This is "+this.name+"! ("+this.id+")<br/>This sprite was created by "+this.sprite_creator+"!");
			
			self.behaviorStack.push(new TalkingBehav({
				dialog: [ 
					function(){ self.showEmote("...", 3) }, 
					"The Quilava stares you down, as if it is daring you to make a wrong move.", 
					"Tustin: Quilava, be nice.",
				],
				dialog_type: "text",
				owner: self,
			}));
		},
	},
	
	behaviorStack: [new FaceDirection(-1, 0)],
	shouldAppear: function() { return true; },
}));
