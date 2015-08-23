// Nippleon.trainer/iCasino.js
// Defines the event for Nippleon in his casino

var base = require("./base.js")
var Actor = require("tpp-actor");
var FaceDirection = require("tpp-behavior").FaceDirection;
var TalkingBehav  = require("tpp-behavior").Talking;

add(new Actor(base, {
	location: [16, 7], //"rand",
	onEvents: {
		interacted: function(from) {
			var self = this;
			if (this.divideFacing(from) == "n") return; //ignore talking from below the glass
			// $("#statusbar").html("This is "+this.name+"! ("+this.id+")<br/>This sprite was created by "+this.sprite_creator+"!");
			
			self.behaviorStack.push(new TalkingBehav({
				dialog: [
					"Napoleon: Are you enjoying the party? I do apologize for the mess outside.",
					"Yes, I own this casino. After the champion that beat me outlawed gambling in Sinnoh, I came here to Surldab with my winnings.",
					"I helped fund most of Surldab City's construction, as well as my hotel and casino's. They're still building the upper floors.",
					"I hope the rest of this preview party is to your liking.",
				],
				dialog_type: "text",
				owner: self,
			}));
		},
	},
	
	behaviorStack: [new FaceDirection(0, 1)],
	shouldAppear: function() { return true; },
}));
