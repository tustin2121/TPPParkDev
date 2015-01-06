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
	sprite_format: null,
	
	avatar_mat : null,
	avatar_sprite : null,
	avatar_format : null,
	
	getAvatar : function(map){ 
		var self = this;
		var img = new Image();
		__onLoad(img, DEF_SPRITE_FORMAT);
		img.src = DEF_SPRITE;
		
		var texture = new THREE.Texture(img);
		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.NearestFilter;
		texture.repeat = new THREE.Vector2(0.25, 0.25);
		texture.offset = new THREE.Vector2(0, 0);
		texture.generateMipmaps = false;
		//TODO MirroredRepeatWrapping, and just use a negative x uv value, to flip a sprite
		
		this.avatar_format = getSpriteFormat(DEF_SPRITE_FORMAT);
		var mat = this.avatar_mat = new THREE.SpriteMaterial({
			map: texture,
			color: 0xFFFFFF,
			transparent: true,
		});
		
		map.loadSprite(this.id, this.sprite, function(err, url){
			if (err) {
				console.error("ERROR LOADING SPRITE: ", err);
				return;
			}
			
			__onLoad(img, self.sprite_format);
			img.src = url;
		});
		
		var sprite = this.avatar_sprite = new THREE.Sprite(mat);
		sprite.scale.set(1.5, 1.5, 1.5);
		
		return sprite;
		
		function __onLoad(img, format) {
			var f = function() {
				texture.image = img;
				texture.needsUpdate = true;
				
				self.avatar_format = getSpriteFormat(format);
				img.removeEventListener("load", f);
			}
			img.on("load", f);
		}
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
		case "pt_horzrow": 
			return { 
				width: size[0], height: size[1], flip: false,
				dirs: {
					"u0": [1, 0], "u1": [1, 1], "u2": [1, 2],
					"d0": [0, 0], "d1": [0, 1], "d2": [0, 2],
					"l0": [2, 0], "l1": [2, 1], "l2": [2, 2],
					"r0": [3, 0], "r1": [3, 1], "r2": [3, 2],
				}
			};
		case "pt_vertcol": 
			return { 
				width: size[0], height: size[1], flip: false,
				dirs: {
					"u0": [0, 1], "u1": [1, 1], "u2": [2, 1],
					"d0": [0, 0], "d1": [1, 0], "d2": [2, 0],
					"l0": [0, 2], "l1": [1, 2], "l2": [2, 2],
					"r0": [0, 3], "r1": [1, 3], "r2": [2, 3],
				}
			};
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
