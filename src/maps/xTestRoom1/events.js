// xTestRoom1/events.js

//$ PackConfig
{
	"sprites" : [
		"textures/star.png"
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
	
	particlesPerSecond: 1,
	particleDeathAge: 5,
	newParticle: function(p) {
		p.position.set(0, 0, 0);
		p.velocity.set(0, 0.5, 0);
	},
}));


add(new ParticleEvent({
	id: "PARTICLE_Test2",
	location: [37, 21],
	boundingSize: 5,
	
	sprite: "star.png",
	
	particlesPerSecond: 400,
	particleDeathAge: 1.8,
	newParticle: function(p, rnd) {
		p.position.set( rnd(0, 0.1), 0, rnd(0, 0.1) );
		
		var vx = rnd(0, 1), vy = rnd(0, 1);
		var vn = Math.sqrt(vx*vx + vy*vy);
		var vl = 1.6;
		p.velocity.set(vx*vl/vn, rnd(8, 0.5), vy*vl/vn );
		
		p.acceleration.set(0, -10, 0);
		
		p.size = 0.2;
	},
}));