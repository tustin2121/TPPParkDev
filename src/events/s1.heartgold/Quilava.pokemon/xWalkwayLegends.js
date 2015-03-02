// Quilava.pokemon/xWalkwayLegends.js
// Defining my event in the Walkway of Legends, for when the player first enters the park

var base = require("./base.js")

var Event = require("tpp-event");
var Actor = require("tpp-actor");

var quil;

add(quil = new Actor(base, {
	location: [6, 33],
	facing: new THREE.Vector3(-1, 0, 0),
	
	onEvents: {
		// Recieve cross-event messages from Tustin
		message: function(mid) {
			switch (mid) {
				case "player-entered": {
					quil.facing.set(0, 0, 1);
					
					setTimeout(function(){
						quil.facing.set(-1, 0, 0);
					}, 1000);
					
					setTimeout(function(){
						//Walk Quil away from Tustin
					}, 2000);
				} break;
				
				
			}
		}
	},
}));