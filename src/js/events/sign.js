// sign.js
// Defines a common Sign event

var Event = require("tpp-event");
var inherits = require("inherits");
var extend = require("extend");

/**
 * A sign is a tile which the player can read information. The sign can be facing any
 * direction (default, down) and can only be read in that direction (configurable)
 */
function Sign(base, opts) {
	Event.call(this, base, opts);
	
	this.on("interacted", this.onInteract);
}
inherits(Sign, Event);
extend(Sign.prototype, {
	frame_type: "text",
	text: "[There is nothing written on this sign!]",
	
	signType: 1, //0 = provided by map geometry (no model), >0 = provide model
	
	facing: new THREE.Vector3(0, 0, 1), //down
	readOnlyFacing: true,
	
	onInteract : function(from) {
		if (this.readOnlyFacing) {
			var f = from.clone().negate();
			if (f.x != this.facing.x || f.y != this.facing.y)
				return; //don't show box if not looking at the sign
		}
		UI.showTextBox(this.frame_type, this.text, { owner: this });
	},
	
	/** If the sign is provided by the map geometry, the map provides the collision as well. */
	canWalkOn : function(){ return this.signType != 0; },
	
	/**  */
	getAvatar : function(map, gc){ 
		if (this.signType == 0) return null;
		
		//TODO
		
		return null; 
	},
	
});
module.exports = Sign;


