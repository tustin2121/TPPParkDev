// behavior.js
// Defines the based classes for Actor's behaviors

var extend = require("extend");
var inherits = require("inherits");

/** 
 * A Behavior is a script that an actor is following, whether that
 * be walking along a path or around a circle, or following a more
 * complex script of events. Behaviors can be pushed and popped off
 * an actor's stack, and the topmost one will be passed certain events
 * that the actor recieves.
 */

function Behavior(opts) {
	extend(this, opts);
}
extend(Behavior.prototype, {
	faceOnInteract: true,
	talkBehav: null,
	owner: null,
	
	tick : null,
	bump : null,
	interact : function(me, from_dir){
		if (this.talkBehav) {
			me.behaviorStack.push(this.talkBehav);
		}
	},
	
	_tick : function(me, delta) {
		if (this.tick)
			this.tick(me, delta);
	},
	_interact : function(me, from_dir) {
		//TODO do standard stuff here
		if (this.faceOnInteract)
			me.faceInteractor(from_dir);
		
		if (this.interact)
			this.interact(me, from_dir);
	},
	_bump : function(me, from_dir) {
		if (this.bump)
			this.bump(me, from_dir);
	},
});
module.exports = Behavior;


/////////// Common Behaviors ///////////

function Talking(opts) {
	Behavior.call(this, opts);
}
inherits(Talking, Behavior);
extend(Talking.prototype, {
	dialog: null,
	dialog_type: "dialog",
	animation: null,
	owner: null,
	__ui_fired: false,
	
	// reset: function() { this.__ui_fired = false; },
	
	tick: function(me, delta) {
		var self = this;
		if (!this.__ui_fired) {
			UI.showTextBox(this.dialog_type, this.dialog, {
				owner: this.owner,
				complete: function() {
					me.behaviorStack.pop();
					if (this.animation) {
						me.playAnimation("stand", { stopNextTransition: true, });
						me.resumeAnimation();
					}
					self.__ui_fired = false;
				},
			});
			if (this.animation) {
				me.playAnimation(this.animation);
			}
			me.playAnimation()
			this.__ui_fired = true;
		}
	},
});
module.exports.Talking = Talking;



function FaceDirection(x, y, opts) {
	Behavior.call(this, opts);
	this.dir_x = x;
	this.dir_y = y;
}
inherits(FaceDirection, Behavior);
extend(FaceDirection.prototype, {
	dir_x: 0,
	dir_y: 1,
	
	tick: function(me, delta) {
		me.faceDir(this.dir_x, this.dir_y);
	},
});
module.exports.FaceDirection = FaceDirection;



function LookAround(opts) {
	Behavior.call(this, opts);
}
inherits(LookAround, Behavior);
extend(LookAround.prototype, {
	waitTime : 0,
	tick: function(me, delta) {
		if (this.waitTime > 0) {
			this.waitTime -= delta;
			return;
		}
		
		switch( Math.floor(Math.random()*4) ) {
			case 0: me.facing.set( 1,0, 0); break;
			case 1: me.facing.set(-1,0, 0); break;
			case 2: me.facing.set( 0,0, 1); break;
			case 3: me.facing.set( 0,0,-1); break;
		}
		this.waitTime += (Math.random() * 3) + 3;
	},
});
module.exports.LookAround = LookAround;



function Meander(opts) {
	Behavior.call(this, opts);
}
inherits(Meander, Behavior);
extend(Meander.prototype, {
	waitTime : 0,
	tick: function(me, delta) {
		if (this.waitTime > 0) {
			this.waitTime -= delta;
			return;
		}
		
		switch( Math.floor(Math.random()*8) ) {
			case 0: me.facing.set( 1,0, 0); break;
			case 1: me.facing.set(-1,0, 0); break;
			case 2: me.facing.set( 0,0, 1); break;
			case 3: me.facing.set( 0,0,-1); break;
			case 4: me.moveDir("d"); break;
			case 5: me.moveDir("u"); break;
			case 6: me.moveDir("l"); break;
			case 7: me.moveDir("r"); break;
		}
		this.waitTime += (Math.random() * 3) + 3;
	},
});
module.exports.Meander = Meander;

