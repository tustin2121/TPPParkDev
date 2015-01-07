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
	
	//////////////// Property Setters /////////////////
	scale: 1,
	
	setScale : function(scale) {
		this.scale = scale;
		scale *= GLOBAL_SCALEUP;
		this.avatar_sprite.scale.set(scale, scale, scale);
	},
	
	/////////////////////// Avatar //////////////////////
	// avatar_mat : null,
	avatar_sprite : null,
	avatar_format : null,
	avatar_tex : null,
	
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
	
	/////////////////// Animation //////////////////////
	_animationState : null,
	
	_initAnimationState : function() {
		if (!this._animationState)
			this._animationState = {
				waitTime : 0,
				running : false,
				queue : null,
				
				loop : true,
				speed : 1,
			};
		return this._animationState;
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
	
	playAnimation : function(animName, opts) {
		var state = this._initAnimationState();
		if (!opts) opts = {};
		
		if (animName == null) {
			state.running = false;
			state.queue = null;
			return;
		}
		
		var anim = this.avatar_format.anims[animName];
		if (!anim) {
			console.warn("ERROR ", this.id, ": Animation name doesn't exist:", animName);
			return;
		}
		
		state.loop = (opts.loop === undefined)? true : opts.loop;
		state.speed = (opts.speed === undefined)? 1 : opts.speed;
		if (anim.length == 1) {
			//If there's only 1 anim
			state.running = false;
			state.queue = null;
			this.setAnimationFrame(anim[0]);
		} else {
			state.running = true;
			state.queue = anim;
			state.waitTime = (typeof anim[1] == "number")? anim[1] : 0;
			state.currFrame = (this.waitTime > 0)? 2 : 1;
			// this._tick_doAnimation();
			this.setAnimationFrame(anim[0]);
		}
	},
	
	_tick_doAnimation: function() {
		var state = this._animationState;
		if (state.waitTime > 0) {
			state.waitTime -= state.speed;
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
	},
	
	/////////////////// Movement and Pathing //////////////////////
	_pathingState : null,
	
	_initPathingState : function() {
		if (!this._pathingState)
			this._pathingState = {
				queue: [],
				moving: false,
				speed: 16,
				delta: 0, //the delta from src to dest
				dir: "d",
				
				destLocC: new THREE.Vector3().set(this.location), //collision map location
				destLoc3: new THREE.Vector3(), //world space location
				srcLocC: new THREE.Vector3().set(this.location),
				srcLoc3: new THREE.Vector3(),
				midpointOffset: new THREE.Vector3(),
			};
		return this._pathingState;
	},
	
	pathTo : function(x, y) {
		var state = this._initPathingState();
		
		
	},
	
	clearPathing : function() {
		var state = this._initPathingState();
		state.queue.length = 0;
	},
	
	moveDir : function(dir) {
		var x = this.location.x;
		var y = this.location.y;
		var z = this.location.z;
		switch (dir) {
			case "d": case "down":	y += 1; break;
			case "u": case "up":	y -= 1; break;
			case "l": case "left":	x -= 1; break;
			case "r": case "right":	x += 1; break;
		}
		this.moveTo(x, y, z);
	},
	
	moveTo : function(x, y, layer) {
		var state = this._initPathingState();
		var src = this.location;
		
		state.dir = getDirFromLoc(src.x, src.y, x, y);
		
		if (!currentMap.canWalkBetween(src.x, src.y, x, y)) {
			console.warn(this.id, ": Cannot walk to location", "("+x+","+y+")");
			this.emit("bumped", getDirFromLoc(x, y, src.x, src.y));
			this.playAnimation("bump_"+state.dir, { loop: false });
			return;
		}
		//TODO Transition now to another layer
		
		state.srcLocC.set(src);
		state.srcLoc3.set(currentMap.get3DTileLocation(src));
		state.destLocC.set(x, y, layer);
		state.destLoc3.set(currentMap.get3DTileLocation(x, y, layer));
		state.delta = 0;
		state.moving = true;
		
		this.playAnimation("walk_"+state.dir);
		this.emit("moving", state.srcLocC.x, state.srcLocC.y, state.destLocC.x, state.destLocC.y);
	},
	
	_tick_doMovement : function() {
		var state = this._initPathingState();
		
		state.delta += 1/state.speed;
		var alpha = Math.clamp(state.delta);
		this.avatar_sprite.position.set( 
			//Lerp between src and dest (built in lerp() is destructive, and seems badly done)
			state.srcLoc3.x + ((state.destLoc3.x - state.srcLoc3.x) * alpha),
			state.srcLoc3.y + ((state.destLoc3.y - state.srcLoc3.y) * alpha),
			state.srcLoc3.z + ((state.destLoc3.z - state.srcLoc3.z) * alpha)
		);
		
		if (state.delta > 1) {
			this.emit("moved", state.srcLocC.x, state.srcLocC.y, state.destLocC.x, state.destLocC.y);
			this.location.set( state.destLocC );
			
			var next = state.queue.shift();
			if (!next) {
				state.delta = 0;
				state.moving = false;
				this.playAnimation("stand_"+state.dir);
			} else {
				this.moveTo(next.x, next.y, next.z);
			}
		}
	},
	
	
	///////////////////// Private Methods //////////////////////
	
	_normalizeLocation : function() {
		var num = Event.prototype._normalizeLocation.call(this);
		if (num != 1 || !this.location)
			throw new Error("Actors can only be in one place at a time! Number of locations: "+num);
	},
	
	_actorTick : function(delta) {
		// Do animation
		if (this._animationState && this._animationState.running) 
			this._tick_doAnimation();
		
		// Do movement
		if (this._pathingState && this._pathingState.moving)
			this._tick_doMovement();
	},
	
});
module.exports = Actor;



function getDirFromLoc(x1, y1, x2, y2) {
	var dx = x2 - x1;
	var dy = y2 - y1;
	if (Math.abs(dx) > Math.abs(dy)) {
		if (dx > 0) { return "r"; }
		else if (dx < 0) { return "l"; }
	} else {
		if (dy > 0) { return "d"; }
		else if (dy < 0) { return "u"; }
	}
	return "d";
}


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
			"stand_u": ["u0"],  "walk_u": ["u1", 5, "u3", 5, "u2", 5, "u3", 5 ], "bump_u": ["u1", 10, "u0"],
			"stand_d": ["d0"],  "walk_d": ["d1", 5, "d3", 5, "d2", 5, "d3", 5 ], "bump_d": ["d1", 10, "d0"],
			"stand_l": ["l0"],  "walk_l": ["l1", 5, "l3", 5, "l2", 5, "l3", 5 ], "bump_l": ["l1", 10, "l0"],
			"stand_r": ["r0"],  "walk_r": ["r1", 5, "r3", 5, "r2", 5, "r3", 5 ], "bump_r": ["r1", 10, "r0"],
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
