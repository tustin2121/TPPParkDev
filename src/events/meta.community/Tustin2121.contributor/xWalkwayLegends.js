// Tustin2121.contributor/xWalkwayLegends.js
// Defining my event in the Walkway of Legends, for when the player first enters the park

var base = require("./base.js")

var Event = require("tpp-event");
var Actor = require("tpp-actor");
var Trigger = require("tpp-trigger");
var Behavior = require("tpp-behavior");
var FaceDirection = require("tpp-behavior").FaceDirection;
var TalkingBehav  = require("tpp-behavior").Talking;

// if ()

var tustin;

add(tustin = new Actor(base, {
	location: [5, 33],
	
	onEvents: {
		interacted: function() {
			var self = this;
			// $("#statusbar").html("This is "+this.name+"! ("+this.id+")<br/>This sprite was created by "+this.sprite_creator+"!");
			
			self.behaviorStack.push(new TalkingBehav({
				dialog: [ 
					"Tustin2121: Just a heads up. Walking up stairs may cause the following symptoms:",
					"Nasuea, death, memory loss, rashes, cancer, multiple stab wounds, addiction...",
					"...rabies, increased test scores, sprained ankle, hepatitis, diabetes, boredom...",
					"...that new car smell, using sugar pills as a placebo to cure headaches...",
					"...standing in place, headaches, and most commonly being possessed by Satan...",
					"...which causes either Eldrich voices to possess you or massive seizures.",
					"They're practically indistinguishable! Anyways, use the stairs with caution.",
				],
				dialog_type: "text",
				owner: self,
			}));
		},
	},
	
	behaviorStack: [new FaceDirection(-1, 0)],
}));


var bhAlerted = new Behavior({
	interact: function(me) {
		UI.showTextBox("dialog", [
			"<Hello>",
		]);
	},
	
	tick: function(me, delta) {
		me.faceDir(player.x, player.y);
	},
});



add(new Trigger({
	location: [7, 39], //on the warp point
	onTriggerEnter: function() {
		currentMap.eventList["Quilava.pokemon"].emit("message", "player-entered")
		
		//tustin.facing.set(0, 0, 1);
		tustin.showEmote("!", 3);
		tustin.behaviorStack.push(bhAlerted);
	},
}));

add(new Trigger({
	location: [5, 33, 5, 1], //on the warp point
	onTriggerEnter: function() {
		
	},
}));