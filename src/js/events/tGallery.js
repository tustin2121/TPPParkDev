// tGallery.js
// Defines the base event that actors have in the tGallery test map.

var inherits = require("inherits");
var extend = require("extend");

var Actor = require("tpp-actor");
var MeanderBehav = new require("tpp-behavior").Meander;
var TalkingBehav = new require("tpp-behavior").Talking;

function ActorGala(base, ext) {
	ext = extend({
		location: "rand",
		onEvents: {
			interacted: function() {
				var self = this;
				$("#statusbar").html("This is "+this.name+"! ("+this.id+")");
				var dlog = self.dialog || [
					""+this.name+" waves at you in greeting before continuing to meander about the Gallery."
				];
				
				UI.showTextBox(self.dialog_type, dlog, { complete: function(){
					self.behaviorStack.pop();
				}});
				self.behaviorStack.push(TalkingBehav);
			},
		},
		
		dialog_type: "text",
		dialog: null,
		
		behaviorStack: [new MeanderBehav()],
		
		shouldAppear: function() { return true; },
		
	}, ext);
	Actor.call(this, base, ext);
}
inherits(ActorGala, Actor);


module.exports = ActorGala;