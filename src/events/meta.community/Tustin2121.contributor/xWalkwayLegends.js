// Tustin2121.contributor/xWalkwayLegends.js
// Defining my event in the Walkway of Legends, for when the player first enters the park

var base = require("./base.js")

var Event = require("tpp-event");
var Actor = require("tpp-actor");
var Trigger = require("tpp-trigger");
var Behavior = require("tpp-behavior");

// if ()

var tustin;

add(tustin = new Actor(base, {
	location: [5, 33],
	facing: new THREE.Vector3(1, 0, 0),
	
	behaviorStack: [],
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