// xTestRoom1/events.js

//$ PackConfig
{
	"sprites" : [
		"textures/star.png",
		"textures/waterdroplet.png",
		"textures/waterdroplets.png",
		"textures/smoke.png"
	] 
}
//$!

var Event = require("tpp-event");
var Sign = require("tpp-sign");
var Warp = require("tpp-warp");
var CameraTrigger = require("tpp-cameratrigger");
var ParticleEvent = require("tpp-particle");

add(new CameraTrigger({
	id: "CAMERA_toEast",
	locations: [9, 1, 1, 8],
	eCameraId: "toEast",
	wCameraId: "0",
}));

add(new CameraTrigger({
	id: "CAMERA_toWest",
	locations: [24, 1, 1, 8],
	wCameraId: "toWest",
	eCameraId: "0",
}));

add(new CameraTrigger({
	id: "CAMERA_toNorth",
	locations: [1, 16, 8, 1],
	nCameraId: "toNorth",
	sCameraId: "0",
}));

add(new CameraTrigger({
	id: "CAMERA_toSouth",
	locations: [1, 9, 8, 1],
	sCameraId: "toSouth",
	nCameraId: "0",
}));


add(new ParticleEvent({
	id: "PARTICLE_Test",
	location: [25, 17],
	
	sprite: "star.png",
	
	opacityTween: ParticleEvent.makeTween( [9, 10], [1, 0] ),
	
	particlesPerSecond: 1,
	particleDeathAge: 10,
	newParticle: function(p) {
		p.position.set(0, 0, 0);
		p.velocity.set(0, 0.5, 0);
		
		p.opacityTween = this.opacityTween;
	},
}));


add(new ParticleEvent({
	id: "PARTICLE_Test2",
	location: [37, 21],
	boundingSize: 5,
	killingFloor: -0.6,
	
	running: true,
	
	sprite: "waterdroplets.png",
	
	type: 0,
	_ring: 0,
	colorLTween: ParticleEvent.makeTween( [0, 1], [.6, .8] ),
	sizeTween: ParticleEvent.makeTween( [0, 1], [0.2, 0.5] ),
	
	particlesPerSecond: 400,
	particleDeathAge: 1.8,
	newParticle: function(p, rnd) {
		switch (this.type) {
			case 0: {
				p.position.set( rnd(0, 0.1), rnd(0, 0.3), rnd(0, 0.1) );
				p.acceleration.set(0, -10, 0);
		
				var vx = rnd(0, 1), vy = rnd(0, 1);
				var vn = Math.sqrt(vx*vx + vy*vy);
				var vl = 1.6;
				p.velocity.set(vx*vl/vn, rnd(8, 0.5), vy*vl/vn );
			} break;
			
			case 1: {
				var NUM_STREAMS = 16;
				var RADIUS_ADJ = 3.5;
				var VEL_ADJ = 0.6;
				this._ring = (this._ring+1) % NUM_STREAMS;
				
				var x = Math.sin((2*Math.PI) * (this._ring/NUM_STREAMS)) * RADIUS_ADJ;
				var y = Math.cos((2*Math.PI) * (this._ring/NUM_STREAMS)) * RADIUS_ADJ;
				
				p.position.set( rnd(x, 0.1), rnd(0, 0.1), rnd(y, 0.1) );
				p.acceleration.set(0, -10, 0);
		
				p.velocity.set(rnd(-x*VEL_ADJ, 0.2), rnd(8, 0.5), rnd(-y*VEL_ADJ, 0.2) );
			} break;
			
			case 2: {
				p.position.set( rnd(0, 0.3), rnd(0, 0.3), rnd(0, 0.1) );
				p.acceleration.set(0, -10, 0);
				
				var angle = rnd(0, -Math.PI * 0.75)
				var vx = Math.sin(angle) * 5;
				var vy = Math.cos(angle) * 9;
				p.velocity.set(vx, vy, rnd(0, 0.5) );
			} break;
		}
		
		p.size = rnd(0.4, 0.05);
		p.sizeTween = this.sizeTween;
		p.angle = Math.random() * 360;
		p.angleVelocity = (Math.random() - 0.5) * 15;
		
		p.color.setHSL(0.60, 1.0, rnd(0.8, 0.05));
		p.colorLTween = this.colorLTween;
		p.opacity = 0.8;
	},
}));


add(new ParticleEvent({
	id: "PARTICLE_CampFireTest",
	location: [29, 12],
	
	sprite: "smoke.png",
	
	sizeTween: ParticleEvent.makeTween( [0, 0.3, 1.2], [0.2, 1.2, 0.01] ),
	opacityTween: ParticleEvent.makeTween( [0.9, 1.5], [1, .5] ),
	
	colorHTween: ParticleEvent.makeTween( [0.5, 1], [.02, .05] ),
	colorLTween: ParticleEvent.makeTween( [0.5, 1], [.5, 0] ),
	
	blendStyle : THREE.AdditiveBlending,
	particlesPerSecond: 60,
	particleDeathAge: 1.5,
	newParticle: function(p, rnd) {
		p.position.set( rnd(0, 0.3), rnd(-0.2, 0.2), rnd(0, 0.3) );

		p.velocity.set(rnd(0, 0.6), 1.2, rnd(0, 0.6) );
		
		p.sizeTween = this.sizeTween;
		p.angle = Math.random() * 360;
		p.angleVelocity = (Math.random() - 0.5) * 15;
		
		p.color.setHSL(0.02, 1.0, 0.5);
		p.colorHTween = this.colorHTween;
		p.colorLTween = this.colorLTween;
		
		p.opacityTween = this.opacityTween;
	},
}));