// player-character.js
// Defines the concrete code for a Player Character in the world

var Actor = require("tpp-actor");
var controller = require("tpp-controller");
var inherits = require("inherits");
var extend = require("extend");

/**
 */
function PlayerChar(){
	Actor.call(this, {}, {});
	
	this.on("tick", this.controlCharacter);
	this.on("cant-move", this.animateBump);
}
inherits(PlayerChar, Actor);
extend(PlayerChar.prototype, {
	id : "PLAYERCHAR",
	location : new THREE.Vector3(),
	
	sprite: null,
	
	reset : function() {
		this.location.set(0, 0, 0);
	},
	
	warpAway : function(animType) {
		console.warn("warpAway is not yet implemented!");
	},
	
	warpTo : function(warpdef) {
		var self = this;
		this.location.set(warpdef.loc[0], warpdef.loc[1], warpdef.layer);
		
		if (!warpdef.anim)
			controller.pushInputContext("cutscene");
		//TODO warpdef.anim
		
		setTimeout(function(){
			switch(Number(warpdef.anim)) { //Warp animation
				case 1: self.avatar_node.position.z += 1; break; // Walk up
				case 2: self.avatar_node.position.z -= 1; break; // Walk down
				case 3: self.avatar_node.position.x -= 1; break; // Walk left
				case 4: self.avatar_node.position.x += 1; break; // Walk down
				case 5: self.avatar_node.position.y += 15; break; // Warp in
			}
		}, 0);
		
		currentMap.queueForMapStart(function(){
			console.log("WARP DEF", warpdef);
			var animName = null;
			var x = self.location.x;
			var y = self.location.y;
			var layer = self.location.z;
			var y_off = 0;
			var mspd = 1, aspd = 1; //movement speed, animation speed
			var animEndEvent = "anim-end";
			
			switch(Number(warpdef.anim)) { //Warp animation
				case 0: break; // Appear
				case 1: y++; animName = "walk"; mspd = 0.35; aspd = 0.35; break; // Walk up
				case 2: y--; animName = "walk"; mspd = 0.35; aspd = 0.35; break; // Walk down
				case 3: x--; animName = "walk"; mspd = 0.35; aspd = 0.35; break; // Walk left
				case 4: x++; animName = "walk"; mspd = 0.35; aspd = 0.35; break; // Walk down
				case 5: // Warp in
					animName = "warp_in"; 
					y_off = 15; animEndEvent = "moved";
					mspd = 0.25; aspd = 1; 
					break; 
				default: 
					console.warn("ILLEGAL WARP ANIMATION:", warpdef.anim);
			}
			
			var src = self.location;
			var state = self._initPathingState();
			
			if (src.x-x || y-src.y) 
				self.facing.set(x-src.x, 0, src.y-y);
			else
				self.facing.set(0, 0, 1);
			
			state.srcLocC.set(x, y, layer);
			state.srcLoc3.set(currentMap.get3DTileLocation(x, y, layer)).y += y_off;
			state.destLocC.set(src);
			state.destLoc3.set(currentMap.get3DTileLocation(src));
			state.delta = 0;
			state.moving = true;
			state.speed = mspd;
			
			self.playAnimation(animName, { speed: aspd });
			self.once(animEndEvent, function(animationName){
				console.log("Pop!");
				controller.popInputContext("cutscene");
			});
			//self.avatar_node.position.set( currentMap.get3DTileLocation(self.location) );
		});
	},
	
	controlTimeout: 0.0,
	controlCharacter : function(delta) {
		var y = ((controller.isDown("Up", "game"))? -1:0) + ((controller.isDown("Down", "game"))? 1:0);
		var x = ((controller.isDown("Left", "game"))? -1:0) + ((controller.isDown("Right", "game"))? 1:0);
		
		if (controller.isDown("Interact", "game") && !this._initPathingState().moving) {
			currentMap.dispatch(
				this.location.x - this.facing.x, this.location.y + this.facing.z, 
				"interacted", this.facing);
		}
		
		if ((y || x) && !(x && y)) { //one, but not both
			if (this.controlTimeout < 1) {
				this.controlTimeout += CONFIG.timeout.walkControl * delta;
				
				if (!this._initPathingState().moving) {
					this.faceDir(x, y);
				}
			} else {
				if (!this._initPathingState().moving) {
					this.moveTo(this.location.x+x, this.location.y+y);
				}
			}
		} else {
			if (this.controlTimeout > 0)
				this.controlTimeout -= CONFIG.timeout.walkControl * delta;
		}
		
	},
	
	animateBump : function(srcx, srcy, x, y, reason) {
		// console.warn(this.id, ": Cannot walk to location", "("+x+","+y+")");
		this.playAnimation("bump", { stopNextTransition: true });
	},
	
	
	////////////////////////////////////////////////////////////////////////
	isNPC : function(){ return false; },
	
	_avatar_loadSprite : function(map, texture) {
		var url = BASEURL+"/img/pcs/"+ gameState.playerSprite;
		var res = /^([^\[]+)\[([^\]]+)\].png$/.exec(url);
		
		var name = res[1];
		var format = res[2];
		
		var img = new Image();
		format = this.getSpriteFormat(format);
		this.__onLoadSprite(img, format, texture);
		img.src = url;
	},
	
	// Neuter the location normilization for this kind of event
	_normalizeLocation : function() {},
	
});
module.exports = PlayerChar;
