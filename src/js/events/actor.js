// actor.js
// Defines the actor event used throughout the park

var Event = require("tpp-event");
var inherits = require("inherits");
var extend = require("extend");

var GLOBAL_SCALEUP = 1.5;

/**
 * An actor is any event representing a person, pokemon, or other entity that
 * may move around in the world or face a direction. Actors may have different
 * behaviors, some common ones predefined in this file.
 */
function Actor(base, opts) {
	Event.call(this, base, opts);
	
	this.on("tick", this._actorTick);
}
inherits(Actor, Event);
extend(Actor.prototype, {
	sprite: null,
	sprite_format: null,
	scale: 1,
	
	// avatar_mat : null,
	avatar_sprite : null,
	avatar_format : null,
	avatar_tex : null,
	
	_animationState : null,
	
	getAvatar : function(map){ 
		if (this.avatar_sprite) return this.avatar_sprite;
		
		var self = this;
		var img = new Image();
		__onLoad(img, DEF_SPRITE_FORMAT);
		img.src = DEF_SPRITE;
		
		var texture = this.avatar_tex = new THREE.Texture(img);
		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.NearestFilter;
		texture.repeat = new THREE.Vector2(0.25, 0.25);
		texture.offset = new THREE.Vector2(0, 0);
		texture.wrapS = THREE.MirroredRepeatWrapping;
		texture.wrapT = THREE.MirroredRepeatWrapping;
		texture.generateMipmaps = false;
		//TODO MirroredRepeatWrapping, and just use a negative x uv value, to flip a sprite
		
		this.avatar_format = getSpriteFormat(DEF_SPRITE_FORMAT);
		
		var mat /*= this.avatar_mat*/ = new THREE.SpriteMaterial({
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
		this.setScale(this.scale);
		
		return sprite;
		
		function __onLoad(img, format) {
			var f = function() {
				texture.image = img;
				
				self.avatar_format = getSpriteFormat(format);
				texture.repeat.set(self.avatar_format.repeat, self.avatar_format.repeat);

				texture.needsUpdate = true;
				
				self.setAnimationFrame("d0");
				img.removeEventListener("load", f);
			}
			img.on("load", f);
		}
	},
	
	
	
	setScale : function(scale) {
		this.scale = scale;
		scale *= GLOBAL_SCALEUP;
		this.avatar_sprite.scale.set(scale, scale, scale);
	},
	
	setAnimationFrame : function(frame) {
		var def = this.avatar_format.frames[frame];
		if (!def) {
			console.warn("ERROR ", this.id, ": Animation frame doesn't exist:", frame);
			return;
		}
		
		var flip = false;
		if (typeof def == "string") { //redirect
			def = this.avatar_format.frames[def];
			flip = true;
		}
		
		var u = def[0] * this.avatar_format.repeat;
		var v = 1 - ((def[1]+1) * this.avatar_format.repeat);
		//For some reason, offsets are from the BOTTOM left?!
		
		if (flip && this.avatar_format.flip) {
			u = 0 - (def[0]-1) * this.avatar_format.repeat; //TODO test
		}
		
		this.avatar_tex.offset.set(u, v); 
		this.avatar_tex.needsUpdate = true;
	},
	
	playAnimation : function(animName, loop) {
		if (!this._animationState) this._animationState = {};
		
		if (animName == null) {
			this._animationState.running = false;
			this._animationState.queue = null;
			return;
		}
		
		var anim = this.avatar_format.anims[animName];
		if (!anim) {
			console.warn("ERROR ", this.id, ": Animation name doesn't exist:", animName);
			return;
		}
		
		var state = this._animationState;
		state.loop = (loop === undefined)? true : loop;
		if (anim.length == 1) {
			//If there's only 1 anim
			state.running = false;
			state.queue = null;
			this.setAnimationFrame(anim[0]);
		} else {
			state.running = true;
			state.queue = anim;
			state.currFrame = 1;
			state.waitTime = 0;
			this.setAnimationFrame(anim[0]);
		}
	},
	
	pathTo : function(x, y) {
		
	},
	
	moveTo : function(x, y) {
	},
	
	
	
	_normalizeLocation : function() {
		var num = Event.prototype._normalizeLocation.call(this);
		if (num != 1 || !this.location)
			throw new Error("Actors can only be in one place at a time! Number of locations: "+num);
	},
	
	_actorTick : function(delta) {
		// Do animation
		if (this._animationState && this._animationState.running) 
			__doAnimation.call(this);
		
		return;
		
		function __doAnimation() {
			var state = this._animationState;
			if (state.waitTime > 0) {
				state.waitTime--;
				return;
			}
			state.currFrame++;
			if (state.loop)
				state.currFrame = state.currFrame % state.queue.length;
			else if (state.currFrame >= state.queue.length) {
				state.running = false;
				state.queue = null;
				return;
			}
			var frame = state.queue[state.currFrame];
			
			switch (typeof frame) {
				case "string":
					this.setAnimationFrame(frame);
					break;
				case "number":
					state.waitTime = frame;
					break;
			}
		}
	},
	
});
module.exports = Actor;




function getSpriteFormat(str) {
	var format = str.split("-");
	var name = format[0];
	var size = format[1].split("x");
	size[1] = size[1] || size[0];
	
	var base = {
		width: size[0], height: size[1], flip: false, repeat: 0.25,
		frames: {
			"u3": "u0", "d3": "d0", "l3": "l0", "r3": "r0",
		},
		anims: {
			"stand_u": ["u0"],  "walk_u": ["u1", 5, "u3", 5, "u2", 5, "u3", 5 ],
			"stand_d": ["d0"],  "walk_d": ["d1", 5, "d3", 5, "d2", 5, "d3", 5 ],
			"stand_l": ["l0"],  "walk_l": ["l1", 5, "l3", 5, "l2", 5, "l3", 5 ],
			"stand_r": ["r0"],  "walk_r": ["r1", 5, "r3", 5, "r2", 5, "r3", 5 ],
		},
	};
	
	switch (name) {
		case "pt_horzrow": 
			return extend(true, base, { 
				frames: {
					"u0": [1, 0], "u1": [1, 1], "u2": [1, 2],
					"d0": [0, 0], "d1": [0, 1], "d2": [0, 2],
					"l0": [2, 0], "l1": [2, 1], "l2": [2, 2],
					"r0": [3, 0], "r1": [3, 1], "r2": [3, 2],
				},
				anims: {},
			});
		case "pt_vertcol": 
			return extend(true, base, { 
				frames: {
					"u0": [0, 1], "u1": [1, 1], "u2": [2, 1],
					"d0": [0, 0], "d1": [1, 0], "d2": [2, 0],
					"l0": [0, 2], "l1": [1, 2], "l2": [2, 2],
					"r0": [0, 3], "r1": [1, 3], "r2": [2, 3],
				},
				anims: {},
			});
		case "hg_vertmix": 
			return extend(true, base, { 
				frames: {
					"u0": [0, 0], "u1": [1, 3], "u2": [2, 0],
					"d0": [2, 1], "d1": [2, 2], "d2": [2, 3],
					"l0": [0, 2], "l1": [0, 1], "l2": [0, 3],
					"r0": [1, 0], "r1": [1, 1], "r2": [1, 2],
				},
				anims: {},
			});
		case "hg_pokerow":
			return extend(true, base, { 
				frames: { // pointers to another image indicates that image should be flipped, if flip=true
					"u0": null, "u1": [0, 0], "u2": [1, 0],
					"d0": null, "d1": [0, 1], "d2": [1, 1],
					"l0": null, "l1": [0, 2], "l2": [1, 2],
					"r0": null, "r1": [0, 3], "r2": [1, 3],
				},
				anims: {},
			});
		case "hg_pokeflip":
			return extend(true, base, { 
				frames: { // pointers to another image indicates that image should be flipped, if flip=true
					"u0": null, "u1": [0, 0], "u2": [1, 0],
					"d0": null, "d1": [0, 1], "d2": [1, 1],
					"l0": null, "l1": [0, 2], "l2": [1, 2],
					"r0": null, "r1": "l1",   "r2": "l2",
				},
				anims: {},
			});
		case "bw_vertrow":
			return extend(true, base, { 
				frames: {
					"u0": [0, 0], "u1": [1, 0], "u2": [2, 0],
					"d0": [0, 1], "d1": [1, 1], "d2": [2, 1],
					"l0": [0, 2], "l1": [1, 2], "l2": [2, 2],
					"r0": [0, 3], "r1": [1, 3], "r2": [2, 3],
				},
				anims: {},
			});
		case "bw_horzflip":
			return extend(true, base, { 
				frames: { // pointers to another image indicates that image should be flipped, if flip=true
					"u0": [0, 0], "u1": [1, 0], "u2": "u1",
					"d0": [2, 0], "d1": [3, 0], "d2": "d1",
					"l0": [0, 1], "l1": [1, 1], "l2": [2, 1],
					"r0": "l0",   "r1": "l1",   "r2": "l2",
				},
				anims: {},
			});
	}
}
