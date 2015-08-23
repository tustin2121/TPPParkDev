// actor.js
// Defines the actor event used throughout the park

var Event = require("tpp-event");
var inherits = require("inherits");
var extend = require("extend");

var CharacterSprite = require("tpp-spritemodel").CharacterSprite;
var SpriteGlowMaterial = require("tpp-spritemodel").SpriteGlowMaterial;
var getSpriteFormat = require("tpp-actor-animations").getSpriteFormat;

var GLOBAL_SCALEUP = 1.65;
var EVENT_PLANE_NORMAL = new THREE.Vector3(0, 1, 0);
/**
 * An actor is any event representing a person, pokemon, or other entity that
 * may move around in the world or face a direction. Actors may have different
 * behaviors, some common ones predefined in this file.
 */
function Actor(base, opts) {
	Event.call(this, base, opts);
	
	this.on("tick", this._actorTick);
	this.on("interacted", this._doBehavior_interact);
	this.on("bumped", this._doBehavior_bump);
	this.on("cant-move", this._actorBump);
	this.facing = this.facing || new THREE.Vector3(0, 0, 1);
	
	this._initBehaviorStack();
	
	if (this.schedule) {
		this.schedule = ActorScheduler.createSchedule(this.id, this.schedule);
	}
}
inherits(Actor, Event);
extend(Actor.prototype, {
	sprite: null,
	sprite_format: null,
	
	isLocal: false,
	shadow : true,
	
	//////////////// Property Setters /////////////////
	scale: 1,
	scale_shadow: 1,
	offset_sprite_x: 0, 
	offset_sprite_y: 0.3,
	
	setScale : function(scale) {
		this.scale = scale;
		scale *= GLOBAL_SCALEUP;
		this.avatar_sprite.scale.set(scale, scale, scale);
		this._avatar_shadowcaster.scale.set(
			this.scale_shadow * scale,
			this.scale_shadow * scale,
			this.scale_shadow * scale
		);
	},
	
	setShadowScale : function(scale) {
		this.scale_shadow = scale;
		// scale *= GLOBAL_SCALEUP;
		this._avatar_shadowcaster.scale.set(
			this.scale * scale,
			this.scale * scale,
			this.scale * scale
		);
	},
	
	/////////////////////// Avatar //////////////////////
	avatar_node : null,
	avatar_sprite : null,
	avatar_format : null,
	avatar_tex : null,
	_avatar_shadowcaster : null,
	
	getAvatar : function(map, gc){ 
		if (this.avatar_node) return this.avatar_node;
		
		var node = this.avatar_node = new THREE.Object3D();
		
		node.add(this._avatar_createSprite(map, gc));
		node.add(this._avatar_createShadowCaster(map, gc));
		// if (this.glow_color) {
		// 	node.add(this._avatar_createGlowCaster(map, gc));
		// }
		
		return node;
		
	},
	
	getTalkingAnchor : function() {
		return this._avatar_shadowcaster.localToWorld(
			this._avatar_shadowcaster.position.clone()
		);
	},
	
	_avatar_createGlowCaster: function(map, gc) {
		var mat = new SpriteGlowMaterial({
			color: this.glow_color,
		});
		gc.collect(mat);
		
		var geom = new THREE.SphereGeometry(0.8, 21, 10);
		gc.collect(geom);
		
		var mesh = new THREE.Mesh(geom, mat);
		mesh.position.set(0, 0.5, 0);
		
		// self.setScale(self.scale_shadow);
		// mesh.scale.set(
		// 	this.scale_shadow * this.scale, 
		// 	this.scale_shadow * this.scale, 
		// 	this.scale_shadow * this.scale
		// );
		return this._avatar_glowcaster = mesh;
	},
	
	_avatar_createShadowCaster: function(map, gc) {
		var mat = new THREE.MeshBasicMaterial();
		mat.visible = false; //The object won't render, but the shadow still will
		gc.collect(mat);
		
		var geom = new THREE.SphereGeometry(0.3, 7, 3);
		gc.collect(geom);
		
		var mesh = new THREE.Mesh(geom, mat);
		mesh.castShadow = true;
		mesh.position.set(0, 0.5, 0);
		
		// self.setScale(self.scale_shadow);
		mesh.scale.set(
			this.scale_shadow * this.scale, 
			this.scale_shadow * this.scale, 
			this.scale_shadow * this.scale
		);
		return this._avatar_shadowcaster = mesh;
	},
	
	_avatar_createSprite : function(map, gc) {
		var self = this;
		// var img = new Image();
		var texture = self.avatar_tex = new THREE.Texture(DEF_SPRITE_IMG);
		gc.collect(texture);
		
		// Note: not using "this.getSpriteFormat", because the defailt sprite
		// format should not be overidden.
		var spformat = getSpriteFormat(DEF_SPRITE_FORMAT);
		
		this.__onLoadSprite(DEF_SPRITE_IMG, spformat, texture);
		// img.src = DEF_SPRITE;
		
		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.NearestFilter;
		texture.repeat = new THREE.Vector2(0.25, 0.25);
		texture.offset = new THREE.Vector2(0, 0);
		texture.wrapS = THREE.MirroredRepeatWrapping;
		texture.wrapT = THREE.MirroredRepeatWrapping;
		texture.generateMipmaps = false; //Mipmaps generate undesirable transparency artifacts
		//TODO MirroredRepeatWrapping, and just use a negative x uv value, to flip a sprite
		
		self.avatar_format = spformat;
		
		// var mat /*= self.avatar_mat*/ = new THREE.SpriteMaterial({
		// 	map: texture,
		// 	color: 0xFFFFFF,
		// 	transparent: true,
		// });
		
		currentMap.markLoading("ACTOR_"+self.id);
		this._avatar_loadSprite(map, texture);
		
		//var sprite = self.avatar_sprite = new THREE.Sprite(mat);
		var sprite = self.avatar_sprite = new CharacterSprite({
			map: texture,
			color: 0xFFFFFF,
			offset: new THREE.Vector3(this.offset_sprite_x, this.offset_sprite_y, 0),//0.22),
			gc: gc,
		});
		//self.setScale(self.scale);
		sprite.scale.set(
			self.scale * GLOBAL_SCALEUP, 
			self.scale * GLOBAL_SCALEUP, 
			self.scale * GLOBAL_SCALEUP
		);
		
		return sprite;
	},
	
	_avatar_loadSprite : function(map, texture) {
		var self = this;
		map.loadSprite((this.isLocal)? "_local":self.id, self.sprite, function(err, url){
			if (err) {
				console.error("ERROR LOADING SPRITE: ", err);
				return;
			}
			
			var img = new Image();
			var format = self.sprite_format;
			if ($.isPlainObject(format)) {
				format = self.sprite_format[self.sprite];
			}
			if (typeof format == "function") {
				format = self.sprite_format(self.sprite);
			}
			if (typeof format != "string") {
				console.error("INVALID SPRITE FORMAT! 'sprite_format' must be a string, an object, or a "+
					"function that returns a string! To provide a custom format, override "+
					"getSpriteFormat on the actor instance!");
				format = DEF_SPRITE_FORMAT;
			}
			
			self.__onLoadSprite(img, self.getSpriteFormat(format), texture);
			img.src = url;
		});
	},
	
	__onLoadSprite : function(img, format, texture) {
		var self = this;
		var f = function() {
			texture.image = img;
			
			self.avatar_format = format;
			texture.repeat.set(
				self.avatar_format.width / img.naturalWidth, 
				self.avatar_format.height / img.naturalHeight);
			texture.needsUpdate = true;
			
			self.avatar_sprite.width = self.avatar_format.width;
			self.avatar_sprite.height = self.avatar_format.height;
			
			// self.showAnimationFrame("d0");
			self.playAnimation("stand");
			currentMap.markLoadFinished("ACTOR_"+self.id);
			
			img.removeEventListener("load", f);
			img.removeEventListener("load", e);
		}
		var e = function() {
			console.error("Error while loading texture!", img.src);
			texture.needsUpdate = true; //update the missing texture pre-loaded
			currentMap.markLoadFinished("ACTOR_"+self.id);
			
			img.removeEventListener("load", f);
			img.removeEventListener("load", e);
		}
		img.on("load", f);
		img.on("error", e);
	},
	
	// Override this function to provide a custom sprite format
	getSpriteFormat : function(format) {
		return getSpriteFormat(format);
	},
	
	// Override this function to allow the actor to respond to random spawn locations
	spawnLocationSet: function() {},
	
	/////////////////// Animation //////////////////////
	_animationState : null,
	facing : null,
	animationSpeed: 1, //default animation speed
	
	_initAnimationState : function() {
		if (!this._animationState)
			this._animationState = {
				currAnim : null, // Animation object
				currFrame : null, // Currently displayed sprite frame name
				nextAnim : null, // Animation object in queue
				
				stopNextTransition: false, //Stop at the next transition frame, to short-stop the "Bump" animation
			};
		return this._animationState;
	},
	
	getDirectionFacing : function() {
		if (!currentMap || !currentMap.camera) return "d";
		
		var dirvector = this.facing.clone();
		dirvector.applyQuaternion( currentMap.camera.quaternion );
		dirvector.projectOnPlane(EVENT_PLANE_NORMAL).normalize();
		
		var x = dirvector.x, y = dirvector.z;
		// console.log("DIRFACING:", x, y);
		if (Math.abs(x) > Math.abs(y)) { //Direction vector is pointing along x axis
			if (x > 0) return "l";
			else return "r";
		} else { //Direction vector is pointing along y axis
			if (y > 0) return "d";
			else return "u";
		}
		return "d";
	},
	
	showAnimationFrame : function(frame) {
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
		
		var u = def[0] * this.avatar_tex.repeat.x;
		var v = 1 - ((def[1]+1) * this.avatar_tex.repeat.y);
		//For some reason, offsets are from the BOTTOM left?!
		
		if (flip && this.avatar_format.flip) {
			u = 0 - (def[0]-1) * this.avatar_tex.repeat.x; //TODO test
		}
		
		this.avatar_tex.offset.set(u, v); 
		this.avatar_tex.needsUpdate = true;
	},
	
	playAnimation : function(animName, opts) {
		var state = this._initAnimationState();
		if (!opts) opts = {};
		
		var anim = this.avatar_format.anims[animName];
		if (!anim) {
			console.warn("ERROR", this.id, ": Animation name doesn't exist:", animName);
			return;
		}
		anim.parent = this;
		state.nextAnim = anim;
		anim.speed = (opts.speed == undefined)? this.animationSpeed : opts.speed;
		state.stopNextTransition = opts.stopNextTransition || false;
	},
	
	resumeAnimation: function() {
		var state = this._initAnimationState();
		
		if (state.currAnim)
			state.currAnim.resume();
	},
	
	stopAnimation : function() {
		var state = this._initAnimationState();
		
		// state.running = false;
		// state.queue = null;
		// state.stopFrame = null;
		this.emit("anim-end", state.animName);
	},
	
	showEmote: function(emote, timeout) {
		var e = this.__currEmote;
		if (!e) 
			e = this.__currEmote = UI.getEmoteBubble();
		
		e.setType(emote);
		e.height = this.avatar_sprite.height;
		if (timeout) {
			e.setTimeout(timeout);
		}
		
		this.avatar_sprite.add(e);
		e.show();
	},
	
	hideEmote: function() {
		var e = this.__currEmote;
		e.hide(function(){
			e.release();
		});
		this.__currEmote = null;
	},
	
	_tick_doAnimation: function(delta) {
		var state = this._animationState;
		var CA = state.currAnim;
		if (!CA) CA = state.currAnim = state.nextAnim;
		if (!CA) return;
		
		CA.advance(delta);
		
		if (state.nextAnim && CA.canTransition()) {
			//Switch animations
			CA.reset();
			CA = state.currAnim = state.nextAnim;
			state.nextAnim = null;
			
			// this.emit("anim-end", null); //TODO provide anim name
			
			if (state.stopNextTransition) {
				this.playAnimation("stand");
			}
		}
		
		var dir = this.getDirectionFacing();
		var frame = CA.getFrameToDisplay(dir);
		if (frame != state.currFrame) {
			this.showAnimationFrame(frame);
		}
		
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
				jumping : false,
				// dir: "d",
				
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
	
	faceInteractor : function(vector) {
		this.facing = vector.clone().negate();
	},
	
	faceDir : function(x, y) {
		this.facing.set(-x, 0, y);
	},
	
	moveTo : function(x, y, layer, opts) { //bypass Walkmask Check
		if ($.isPlainObject(layer) && opts === undefined) {
			opts = layer; layer = undefined;
		}
		if (opts === undefined) opts = {};
		
		var state = this._initPathingState();
		var src = this.location;
		layer = (layer == undefined)? this.location.z : layer;
		
		this.facing.set(src.x-x, 0, y-src.y);
		
		var walkmask = currentMap.canWalkBetween(src.x, src.y, x, y);
		if (opts.bypass !== undefined) walkmask = opts.bypass;
		if (!walkmask) {
			this.emit("cant-move", src.x, src.y, x, y);
			currentMap.dispatch(x, y, "bumped", this.facing);
			return;
		}
		if ((walkmask & 0x10) == 0x10) { // Check NoNPC tiles
			if (this.isNPC()) {
				this.emit("cant-move", src.x, src.y, x, y);
				currentMap.dispatch(x, y, "bumped", this.facing);
				return;
			}
		}
		if ((walkmask & 0x8) == 0x8) {
			// Transition now to another layer
			var t = currentMap.getLayerTransition(x, y, this.location.z);
			// console.log("Layer Transition: ", t);
			this.emit("change-layer", this.location.z, t.layer);
			x = t.x; y = t.y; layer = t.layer;
		}
		
		
		var animopts = {};
		state.midpointOffset.set(0, 0, 0);
		state.srcLocC.set(src);
		state.srcLoc3.set(currentMap.get3DTileLocation(src));
		state.destLocC.set(x, y, layer);
		state.destLoc3.set(currentMap.get3DTileLocation(x, y, layer));
		state.delta = 0;
		state.speed = opts.speed || 1;
		state.moving = true;
		animopts.speed = opts.speed || 1;
		
		if ((walkmask & 0x2) === 0x2) {
			state.midpointOffset.setY( ((state.srcLoc3.y - state.destLoc3.y) / 2) + 0.6);
			state.jumping = true;
			//enforce a jumping speed of based on height. The below should be 1 with a default step of 0.5
			state.speed = 1;//((state.srcLoc3.y - state.destLoc3.y)) * 0.5 + 0.75; 
			SoundManager.playSound("walk_jump");
			animopts.speed = 1.5;
		}
		
		this.playAnimation("walk", animopts);
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
			
			if (state.jumping) {
				//TODO particle effects
				SoundManager.playSound("walk_jump_land");
				state.jumping = false;
			}
			
			var next = state.queue.shift();
			if (!next) {
				state.delta = 0;
				state.moving = false;
				// this.stopAnimation();
				this.playAnimation("stand");
			} else {
				this.moveTo(next.x, next.y, next.z);
			}
		}
	},
	
	
	//////////////////////// Behaviors /////////////////////////
	behaviorStack : null,
	
	_initBehaviorStack : function() {
		if (!this.behaviorStack)
			this.behaviorStack = [];
	},
	
	_tick_doBehavior : function(delta) {
		var behav = this.behaviorStack.top;
		if (!behav || !behav._tick) return;
		if (!behav.owner) behav.owner = this;
		behav._tick(this, delta);
	},
	
	_doBehavior_interact : function(fromDir) {
		var behav = this.behaviorStack.top;
		if (!behav || !behav._interact) return;
		behav._interact(this, fromDir);
	},
	
	_doBehavior_bump : function(fromDir) {
		var behav = this.behaviorStack.top;
		if (!behav || !behav._bump) return;
		behav._bump(this, fromDir);
	},
	
	////////////////////////////////////////////////////////////
	
	shouldAppear: function(mapid) {
		if (this.schedule) {
			var timestamp = ActorScheduler.getTimestamp();
			var should = this.schedule[timestamp] == mapid;
			if (!should) console.log("Actor", this.id, "should NOT appear according to scheduler... ", this.schedule[timestamp]);
			return should;
		}
		return true; //no schedule, always appear
	},
	
	schedule: null,
	
	///////////////////// Private Methods //////////////////////
	
	canWalkOn : function(){ return false; },
	isNPC : function(){ return true; },
	
	_normalizeLocation : function() {
		if (this.location == "rand") {
			//Place this actor in a designated random location
			this.location = currentMap.getRandomNPCSpawnPoint();
			// console.log("spawn-location-set", this.id, this.location);
			this.spawnLocationSet(); //This isn't an event (though it should be) because events aren't yet registered
			return;
		}
		
		var num = Event.prototype._normalizeLocation.call(this);
		if (num != 1 || !this.location)
			throw new Error("Actors can only be in one place at a time! Number of locations: "+num);
	},
	
	_actorTick : function(delta) {
		// Do animation
		if (this._animationState) 
			this._tick_doAnimation(delta);
		
		// Do movement
		if (this._pathingState && this._pathingState.moving)
			this._tick_doMovement(delta);
		
		// Do behavior
		if (this.behaviorStack.length)
			this._tick_doBehavior(delta);
	},
	
	// _actorInteractFace : function(vector) {
	// 	this.facing = vector.clone().negate();
	// },
	
	_actorBump : function(srcx, srcy, x, y, reason) {
		// console.warn(this.id, ": Cannot walk to location", "("+x+","+y+")");
	},
	
});
module.exports = Actor;



function getDirFromLoc(x1, y1, x2, y2) {
	return new THREE.Vector3(x2-x1, 0, y2-y1);
	// var dx = x2 - x1;
	// var dy = y2 - y1;
	// if (Math.abs(dx) > Math.abs(dy)) {
	// 	if (dx > 0) { return "r"; }
	// 	else if (dx < 0) { return "l"; }
	// } else {
	// 	if (dy > 0) { return "d"; }
	// 	else if (dy < 0) { return "u"; }
	// }
	// return "d";
}

