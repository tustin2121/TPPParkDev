// Tustin2121.contributor/xWalkwayLegends.js
// Defining my event in the Walkway of Legends, for when the player first enters the park

var base = require("./base.js")

var Event = require("tpp-event");
var Actor = require("tpp-actor");
var Trigger = require("tpp-trigger");

// if ()

var tustin;

add(tustin = new Actor(base, {
	location: [5, 33],
	facing: new THREE.Vector3(1, 0, 0),
}));

add(new Trigger({
	location: [7, 39], //on the warp point
	onTriggerEnter: function() {
		currentMap.eventList["Quilava.pokemon"].emit("message", "player-entered")
		
		tustin.facing.set(0, 0, 1);
		tustin.showEmote("!", 20);
	},
}));
