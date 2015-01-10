// actor.js
// Defines the actor event used throughout the park

var Event = require("tpp-event");
var inherits = require("inherits");
var extend = require("extend");

var GLOBAL_SCALEUP = 1.5;
var EVENT_PLANE_NORMAL = new THREE.Vector3(0, 1, 0);
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
	
	shadow : true,
	
	//////////////// Property Setters /////////////////
	scale: 1,
	
	setScale : function(scale) {
		this.scale = scale;
		scale *= GLOBAL_SCALEUP;
		this.avatar_sprite.scale.set(scale, scale, scale);
	},
	
	/////////////////////// Avatar //////////////////////
	avatar_node : null,
	avatar_sprite : null,
	avatar_format : null,
	avatar_tex : null,
	
	getAvatar : function(map){ 
		if (this.avatar_node) return this.avatar_node;
		
		var node = this.avatar_node = new THREE.Object3D();
		
		node.add(this._avatar_createSprite(map));
		node.add(this._avatar_createShadowCaster());
		
		return node;
		
	},
	
	_avatar_createShadowCaster: function() {
		var mat = new THREE.MeshBasicMaterial();
		mat.visible = false; //The object won't render, but the shadow still will
		
		var geom = new THREE.SphereGeometry(0.3, 7, 3);
		
		var mesh = new THREE.Mesh(geom, mat);
		//mesh.visible = false; //?
		mesh.castShadow = true;
		mesh.position.set(0, 0.5, 0);
		return mesh;
	},
	
	_avatar_createSprite : function(map) {
		var self = this;
		var img = new Image();
		var texture = self.avatar_tex = new THREE.Texture(img);
		
		this.__onLoadSprite(img, DEF_SPRITE_FORMAT, texture);
		img.src = DEF_SPRITE;
		
		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.NearestFilter;
		texture.repeat = new THREE.Vector2(0.25, 0.25);
		texture.offset = new THREE.Vector2(0, 0);
		texture.wrapS = THREE.MirroredRepeatWrapping;
		texture.wrapT = THREE.MirroredRepeatWrapping;
		texture.generateMipmaps = false;
		//TODO MirroredRepeatWrapping, and just use a negative x uv value, to flip a sprite
		
		self.avatar_format = getSpriteFormat(DEF_SPRITE_FORMAT);
		
		var mat /*= self.avatar_mat*/ = new THREE.SpriteMaterial({
			map: texture,
			color: 0xFFFFFF,
			transparent: true,
		});
		
		currentMap.markLoading();
		this._avatar_loadSprite(map, texture);
		
		var sprite = self.avatar_sprite = new THREE.Sprite(mat);
		self.setScale(self.scale);
		
		return sprite;
	},
	
	_avatar_loadSprite : function(map, texture) {
		var self = this;
		map.loadSprite(self.id, self.sprite, function(err, url){
			if (err) {
				console.error("ERROR LOADING SPRITE: ", err);
				return;
			}
			
			var img = new Image();
			self.__onLoadSprite(img, self.sprite_format, texture);
			img.src = url;
		});
	},
	
	__onLoadSprite : function(img, format, texture) {
		var self = this;
		var f = function() {
			texture.image = img;
			
			self.avatar_format = getSpriteFormat(format);
			texture.repeat.set(self.avatar_format.repeat, self.avatar_format.repeat);

			texture.needsUpdate = true;
			
			self.setAnimationFrame("d0");
			img.removeEventListener("load", f);
			currentMap.markLoadFinished();
		}
		img.on("load", f);
	},
	
	/////////////////// Animation //////////////////////
	_animationState : null,
	facing : new THREE.Vector2(0, 0, -1),
	
	_initAnimationState : function() {
		if (!this._animationState)
			this._animationState = {
				waitTime : 0,
				running : false,
				queue : null,
				animName : null,
				currFrame : 0,
				frameName : null,
				
				stopFrame : null,
				stopNextAnim : null,
				
				loop : true,
				speed : 1,
			};
		return this._animationState;
	},
	
	getDirectionFacing : function() {
		var dirvector = this.facing.clone();
		dirvector.applyMatrix4( currentMap.camera.matrixWorldInverse );
		dirvector.projectOnPlane(EVENT_PLANE_NORMAL).normalize();
		
		var x = dirvector.x, y = dirvector.z;
		if (x > y) { //Direction vector is pointing along x axis
			if (x > 0) return "r";
			else return "l";
		} else { //Direction vector is pointing along y axis
			if (y > 0) return "d";
			else return "u";
		}
		return "d";
	},
	
	setAnimationFrame : function(frame) {
		var state = this._initAnimationState();
		
		var def = this.avatar_format.frames[frame];
		if (!def) {
			console.warn("ERROR ", this.id, ": Animation frame doesn't exist:", frame);
			return;
		}
		state.frameName = frame;
		
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
			this.stopAnimation();
			return;
		}
		
		if (animName == state.animName) {
			//If we're already running this animation, continue it
			state.stopFrame = null;
			state.stopNextAnim = null;
			return;
		}
		
		var anim = this.avatar_format.anims[animName];
		if (!anim) {
			console.warn("ERROR ", this.id, ": Animation name doesn't exist:", animName);
			return;
		}
		
		state.animName = animName;
		state.loop = (opts.loop === undefined)? true : opts.loop;
		state.speed = (opts.speed === undefined)? 1 : opts.speed;
		state.stopFrame = null;
		state.stopNextAnim = null;
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
	
	stopAnimationOnFrame : function(frames, nextAnim) {
		var state = this._initAnimationState();
		if (!$.isArray(frames)) frames = [frames];
		
		if (!state.queue) {
			console.error("ERROR ", this.id, ": No animation is running to be stopped.");
			return;
		}
		OUTERLOOP:
		for (var i = 0; i < state.queue.length; i++) {
			for (var j = 0; j < frames.length; j++) {
				if (state.queue[i] == frames[j]) { state.stopFrame = frames; break OUTERLOOP; }
			}
		}
		if (!state.stopFrame) {
			console.error("ERROR ", this.id, ": Given frames [", frames, "] do not exist in animation:", state.animName);
			return;
		}
		state.stopNextAnim = nextAnim;
	},
	
	stopAnimation : function() {
		var state = this._initAnimationState();
		
		state.running = false;
		state.queue = null;
		state.stopFrame = null;
		this.emit("anim-end", state.animName);
	},
	
	_tick_doAnimation: function(delta) {
		var state = this._animationState;
		
		if (state.stopFrame) {
			for (var i = 0; i < state.stopFrame.length; i++){
				if(state.frameName == state.stopFrame[i]) {
					if (state.stopNextAnim) {
						this.emit("anim-end", state.animName);
						this.playAnimation(state.stopNextAnim);
						return;
					} else {
						this.stopAnimation();
						return;
					}
				}
			}
		}
		
		if (state.waitTime > 0) {
			state.waitTime -= (state.speed * (delta * CONFIG.speed.animation));
			return;
		}
		state.currFrame++;
		if (state.loop)
			state.currFrame = state.currFrame % state.queue.length;
		else if (state.currFrame >= state.queue.length) {
			this.stopAnimation();
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
		
		return;
		
	},
	
	/////////////////// Movement and Pathing //////////////////////
	_pathingState : null,
	
	_initPathingState : function() {
		if (!this._pathingState)
			this._pathingState = {
				queue: [],
				moving: false,
				speed: 1,
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
		
		console.error(this.id, ": Pathing has not been implemented yet!");
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
		layer = (layer == undefined)? this.location.z : layer;
		
		state.dir = getDirFromLoc(src.x, src.y, x, y);
		
		var walkmask = currentMap.canWalkBetween(src.x, src.y, x, y);
		if (!walkmask) {
			console.warn(this.id, ": Cannot walk to location", "("+x+","+y+")");
			this.emit("bumped", getDirFromLoc(x, y, src.x, src.y));
			this.playAnimation("bump_"+state.dir, { loop: false });
			return;
		}
		if ((walkmask & 0x8) == 0x8) {
			// Transition now to another layer
			var t = currentMap.getLayerTransition(x, y, this.location.z);
			console.log("Layer Transition: ", t);
			x = t.x; y = t.y; layer = t.layer;
		}
		
		var animopts = {};
		state.midpointOffset.set(0, 0, 0);
		state.srcLocC.set(src);
		state.srcLoc3.set(currentMap.get3DTileLocation(src));
		state.destLocC.set(x, y, layer);
		state.destLoc3.set(currentMap.get3DTileLocation(x, y, layer));
		state.delta = 0;
		state.speed = 1;
		state.moving = true;
		
		if ((walkmask & 0x2) === 0x2) {
			state.midpointOffset.setY(0.6);
			animopts.speed = 1.5;
		}
		
		this.playAnimation("walk_"+state.dir, animopts);
		this.emit("moving", state.srcLocC.x, state.srcLocC.y, state.destLocC.x, state.destLocC.y);
	},
	
	_tick_doMovement : function(delta) {
		var state = this._initPathingState();
		
		state.delta += state.speed * (delta * CONFIG.speed.pathing);
		var alpha = Math.clamp(state.delta);
		var beta = Math.sin(alpha * Math.PI);
		this.avatar_node.position.set( 
			//Lerp between src and dest (built in lerp() is destructive, and seems badly done)
			state.srcLoc3.x + ((state.destLoc3.x - state.srcLoc3.x) * alpha) + (state.midpointOffset.x * beta),
			state.srcLoc3.y + ((state.destLoc3.y - state.srcLoc3.y) * alpha) + (state.midpointOffset.y * beta),
			state.srcLoc3.z + ((state.destLoc3.z - state.srcLoc3.z) * alpha) + (state.midpointOffset.z * beta)
		);
		
		if (state.delta > 1) {
			this.emit("moved", state.srcLocC.x, state.srcLocC.y, state.destLocC.x, state.destLocC.y);
			this.location.set( state.destLocC );
			
			var next = state.queue.shift();
			if (!next) {
				state.delta = 0;
				state.moving = false;
				this.stopAnimationOnFrame([state.dir+"0", state.dir+"3"], "stand_"+state.dir)
				// this.playAnimation("stand_"+state.dir);
			} else {
				this.moveTo(next.x, next.y, next.z);
			}
		}
	},
	
	
	///////////////////// Private Methods //////////////////////
	
	canWalkOn : function(){ return false; },
	
	_normalizeLocation : function() {
		var num = Event.prototype._normalizeLocation.call(this);
		if (num != 1 || !this.location)
			throw new Error("Actors can only be in one place at a time! Number of locations: "+num);
	},
	
	_actorTick : function(delta) {
		// Do animation
		if (this._animationState && this._animationState.running) 
			this._tick_doAnimation(delta);
		
		// Do movement
		if (this._pathingState && this._pathingState.moving)
			this._tick_doMovement(delta);
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
			"stand" : { "u": ["u0"], "d": ["d0"], "l": ["l0"], "r": ["r0"], },
			"walk" : {
				"u": ["u1", 5, "u3", 5, "u2", 5, "u3", 5 ],
				"d": ["d1", 5, "d3", 5, "d2", 5, "d3", 5 ],
				"l": ["l1", 5, "l3", 5, "l2", 5, "l3", 5 ],
				"r": ["r1", 5, "r3", 5, "r2", 5, "r3", 5 ],
			},
			"bump" : {
				"u": ["u1", 10, "u0", 10, "u2", 10, "u0", 10 ],
				"d": ["d1", 10, "d0", 10, "d2", 10, "d0", 10 ],
				"l": ["l1", 10, "l0", 10, "l2", 10, "l0", 10 ],
				"r": ["r1", 10, "r0", 10, "r2", 10, "r0", 10 ],
			},
			"warp_away": ["d0", 15, "l0", 14, "u0", 13, "r0", 12, "d0", 10, "l0", 8, "u0", 6, "r0", 4, "d0", 2, "l0", "u0", "r0", "d0", "l0", "u0", "r0", "d0", "l0", "u0", "r0", "d0", "l0", "u0", "r0"],
			"warping_r": ["d0", "r0", "u0", "l0"], "warping_l": ["d0", "l0", "u0", "r0"], 
			"warp_in": ["d0", "r0", "u0", "l0", "d0", "r0", "u0", "l0", "d0", "r0", "u0", "l0", "d0", "r0", "u0", 2, "l0", 4, "d0", 6, "r0", 8, "u0", 10, "l0", 12, "d0", 13, "r0", 14, "u0", 15, "l0", 16],
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
