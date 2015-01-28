// tGallery.js file

var base = require("./base.js")
var Actor = require("tpp-actor");

var MeanderBehav = require("tpp-behavior").Meander;
var TalkingBehav = new require("tpp-behavior").Talking;

add(new Actor(base, {
	location: "rand",
	onEvents: {
		interacted : function() {
			var self = this;
			$("#statusbar").html("This is "+this.name+"! ("+this.id+")");
			UI.showTextBox("dialog", [
				"Hello! I'm Tustin2121!",
				"This is a test of the emergency dialog system. This is <em>only</em> a test.",
				"If this were real, I would be <em><b>running around screaming with my hair on fire right now!!!</b></em>",
				"But since I'm not, here is some <hlt>very important text</hlt> for your perusal.",
				"That is all."
			], { owner: self, complete : function() {
				self.behaviorStack.pop();
			} });
			self.behaviorStack.push(TalkingBehav);
		},
	},
	
	behaviorStack: [new MeanderBehav()],
}));