// actor.js
// Defines the actor event used throughout the park

var Event = require("tpp-event");
var inherits = require("inherits");
var extend = require("extend");

/**
 * An actor is any event representing a person, pokemon, or other entity that
 * may move around in the world or face a direction. Actors may have different
 * behaviors, some common ones predefined in this file.
 */
function Actor(base, opts) {
	Event.call(this, base, opts);
}
inherits(Actor, Event);
extend(Actor.prototype, {
	sprite: null,
	format: null,
	
	avatar_mat : null,
	avatar_sprite : null,
	
	getAvatar : function(map){ 
		var img = new Image();
		img.src = DEF_SPRITE;
		
		var mat = this.avatar_mat = new THREE.SpriteMaterial({
			map: img,
			color: 0xFFFFFF,
			uvScale: new THREE.Vector2(0.25, 0.25),
			uvOffset: new THREE.Vector2(0, 0),
			transparent: true,
		});
		
		
		
		var sprite = this.avatar_sprite = new THREE.Sprite(mat);
		
	},
	
	
	
	_normalizeLocation : function() {
		var num = Event.prototype._normalizeLocation.call(this);
		if (num != 1 || !this.location)
			throw new Error("Actors can only be in one place at a time! Number of locations: "+num);
	},
	
	
});
module.exports = Actor;




function getSpriteFormat(str) {
	var format = str.split("-");
	var name = format[0];
	var size = format[1].split("x");
	size[1] = size[1] || size[0];
	
	switch (name) {
		case "hg_vertmix": 
			return { 
				width: size[0], height: size[1], flip: false,
				dirs: {
					"u0": [0, 0], "u1": [1, 3], "u2": [2, 0],
					"d0": [2, 1], "d1": [2, 2], "d2": [2, 3],
					"l0": [0, 2], "l1": [0, 1], "l2": [0, 3],
					"r0": [1, 0], "r1": [1, 1], "r2": [1, 2],
				}
			};
		case "hg_pokerow":
			return { 
				width: size[0], height: size[1], flip: false, 
				dirs: { // pointers to another image indicates that image should be flipped, if flip=true
					"u0": null, "u1": [0, 0], "u2": [1, 0],
					"d0": null, "d1": [0, 1], "d2": [1, 1],
					"l0": null, "l1": [0, 2], "l2": [1, 2],
					"r0": null, "r1": [0, 3], "r2": [1, 3],
				}
			};
		case "hg_pokeflip":
			return { 
				width: size[0], height: size[1], flip: true,
				dirs: { // pointers to another image indicates that image should be flipped, if flip=true
					"u0": null, "u1": [0, 0], "u2": [1, 0],
					"d0": null, "d1": [0, 1], "d2": [1, 1],
					"l0": null, "l1": [0, 2], "l2": [1, 2],
					"r0": null, "r1": "l1",   "r2": "l2",
				}
			};
		case "bw_vertrow":
			return { 
				width: size[0], height: size[1], flip: false,
				dirs: {
					"u0": [0, 0], "u1": [1, 0], "u2": [2, 0],
					"d0": [0, 1], "d1": [1, 1], "d2": [2, 1],
					"l0": [0, 2], "l1": [1, 2], "l2": [2, 2],
					"r0": [0, 3], "r1": [1, 3], "r2": [2, 3],
				}
			};
		case "bw_horzflip":
			return { 
				width: size[0], height: size[1], flip: true,
				dirs: { // pointers to another image indicates that image should be flipped, if flip=true
					"u0": [0, 0], "u1": [1, 0], "u2": "u1",
					"d0": [2, 0], "d1": [3, 0], "d2": "d1",
					"l0": [0, 1], "l1": [1, 1], "l2": [2, 1],
					"r0": "l0",   "r1": "l1",   "r2": "l2",
				}
			};
	}
}
