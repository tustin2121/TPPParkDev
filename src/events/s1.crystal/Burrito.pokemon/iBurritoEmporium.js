// iBurritoEmporium.js file

var base = require("./base.js");
var Actor = require("tpp-actor");

var Behavior = require("tpp-behavior");
var TalkingBehav = require("tpp-behavior").Talking;


var tb = new TalkingBehav({
	animation: "speak",
	dialog_type: "dialog",
	dialog: [
		function(){ this.showEmote(":D", 18); },
		"Hey, welcome to the Fanfiction Emporium. Feel free to look around!",
		//"",
	],
});


add(new Actor(base, {
	sprite: "reading.png",
	location: [9, 31],
	
	behaviorStack: [
		new Behavior({
			faceOnInteract: false,
			talkBehav: tb,
			
			interact: function(me, from_dir) {
				me.behaviorStack.push(this.talkBehav);
			},
		}),
	],
	
}));