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
		//TODO warpdef.anim
		
		currentMap.queueForMapStart(function(){
			var animName = null;
			var x = self.location.x;
			var y = self.location.y;
			var layer = self.location.z;
			var z_off = 0;
			var dir = null;
			
			switch(warpdef.anim) { //Warp animation
				case 0: break; // Appear
				case 1: y++; animName = "walk_u"; dir = "u"; break; // Walk up
				case 2: y--; animName = "walk_d"; dir = "d"; break; // Walk down
				case 3: x--; animName = "walk_l"; dir = "l"; break; // Walk left
				case 4: x++; animName = "walk_r"; dir = "r"; break; // Walk down
				case 5: z_off = 10; animName = "warp_in"; dir = "d"; break; // Warp in
			}
			
			var src = self.location;
			var state = self._initPathingState();
			
			state.dir = dir;
			state.srcLocC.set(x, y, layer);
			state.srcLoc3.set(currentMap.get3DTileLocation(x, y, layer));
			state.destLocC.set(src);
			state.destLoc3.set(currentMap.get3DTileLocation(src)).z += z_off;
			state.delta = 0;
			state.moving = true;
			
			self.playAnimation(animName);
			
			//self.avatar_node.position.set( currentMap.get3DTileLocation(self.location) );
		});
	},
	
	
	controlCharacter : function(delta) {
		var y = ((controller.isDown("Up"))? -1:0) + ((controller.isDown("Down"))? 1:0);
		var x = ((controller.isDown("Left"))? -1:0) + ((controller.isDown("Right"))? 1:0);
		
		if ((y || x) && !this._initPathingState().moving) {
			this.moveTo(this.location.x+x, this.location.y+y);
		}
	},
	
	
	////////////////////////////////////////////////////////////////////////
	
	_avatar_loadSprite : function(map, texture) {
		var url = gameState.playerSprite;
		var res = /^([^\[]+)\[([^\]]+)\].png$/.exec(url);
		
		var name = res[1];
		var format = res[2];
		
		var img = new Image();
		this.__onLoadSprite(img, format, texture);
		img.src = url;
	},
	
	// Neuter the location normilization for this kind of event
	_normalizeLocation : function() {},
	
});
module.exports = PlayerChar;
