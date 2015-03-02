// eSouthSurldab/events.js
// Events for South Surldab

//$ PackConfig
{
	"sprites" : [
		"../../events/_spriteRepo/builder.png",
		"textures/waterdroplets.png"
	] 
}
//$!

var Actor = require("tpp-actor");
var Trigger = require("tpp-trigger");
var Warp = require("tpp-warp");
var Event = require("tpp-event");
// var CameraTrigger = require("tpp-cameratrigger");
var AnimEvent = require("tpp-animevent");

var fountainRunning = !!DEBUG._fountainRuns;

////////////////////////// Model Modifications ///////////////////////////
$(function() {
	var ModelMods = require("tpp-model-mods");
	
	ModelMods.trees.prefix = "Tree";
	ModelMods.renderDepthFix.name = ["BasketballCourt"];
	
	if (fountainRunning) {
		ModelMods.hide.prefix = "FountainStill";
	} else {
		ModelMods.hide.prefix = "FountainFlow";
	}
	
	ModelMods.modify();
});

///////////////////////////// Construction ///////////////////////////////

var barrierGeom; //Geometry for the saw horse barrier blocking unconstructed exits.


//////////////////////////////// Warps ////////////////////////////////////

add(new Warp({ //warp 00
	id: "EXIT_walkwayLegends",
	locations: [56, 61, 3, 2],
	exit_to: { map: "xWalkwayLegends", warp: 0 },
}));

add(new Warp({ //01
	id: "EXIT_stadiumPathway",
	locations: [111, 25, 1, 3],
	exit_to: { map: "eStadiumPath", warp: 0 },
}));

add(new Warp({ //02
	id: "EXIT_gatorPlains",
	locations: [3, 25, 1, 3],
	exit_to: { map: "eGatorPlains", warp: 0 },
}));

add(new Warp({ //03
	id: "EXIT_northLeft",
	locations: [40, 2, 3, 1],
	exit_to: { map: "eNorthSurldab", warp: 0x01 },
}));

add(new Warp({ //04
	id: "EXIT_northRight",
	locations: [72, 2, 3, 2],
	exit_to: { map: "eNorthSurldab", warp: 0x02 },
}));



add(new Warp({ //10
	id: "EXIT_church",
	locations: [57, 21],
	exit_to: { map: "iChurchOfHelix", warp: 0 },
}));

add(new Warp({ //11
	id: "EXIT_pokemart",
	locations: [34, 40],
	exit_to: { map: "iPokeMart", warp: 0 },
}));

add(new Warp({ //12
	id: "EXIT_pokecenter",
	locations: [79, 40],
	exit_to: { map: "iPokeCenter", warp: 0 },
}));

add(new Warp({ //13
	id: "EXIT_casinoSouth",
	locations: [99, 24],
	exit_to: { map: "iCasino", warp: 1 },
}));

add(new Warp({ //14
	id: "EXIT_casinoSouth",
	locations: [93, 15],
	exit_to: { map: "iCasino", warp: 0 },
}));

add(new Warp({ //15
	id: "EXIT_crystalFlats",
	locations: [10, 34],
	exit_to: { map: "iCrystalFlats", warp: 0 },
}));

add(new Warp({ //16
	id: "EXIT_burrito",
	locations: [19, 56],
	exit_to: { map: "iBurritoEmporium", warp: 0 },
}));

add(new Warp({ //17
	id: "EXIT_postOffice_person",
	locations: [66, 22],
	exit_to: { map: "iPostOffice", warp: 0 },
}));

add(new Warp({ //18
	id: "EXIT_postOffice_kenya",
	locations: [71, 16, 1, 2],
	exit_to: { map: "iPostOffice", warp: 1 },
}));
add(new Trigger({ //18
	id: "EXIT_postOffice_kenyaTrigger",
	locations: [70, 16, 1, 2],
	//TODO trigger Kenya to exit this map
}));

add(new Warp({ //19
	id: "EXIT_hallOfFame",
	locations: [49, 22],
	exit_to: { map: "iHallOfFame", warp: 0 },
}));


//////////////////////////// Central Plaza ///////////////////////////////
var centralPlazaCamera = "0";
var fountainEffect;

if (fountainRunning) {
	add(new AnimEvent.Water({
		speed: -0.05,
		named_regex: /^FountainFlow/i,
	}));
	
	add(fountainEffect = new ParticleEvent({
		id: "PARTICLE_Fountain",
		location: [47, 42],
		boundingSize: 5,
		killingFloor: -0.6,
		
		running: false,
		
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
} else {
	add(new AnimEvent.SineRipple({
		named_regex: /^FountainStill/i,
	}));
	
	fountainEffect = {};
}

add(new Trigger({
	locations: [57, 49],
	onEntering: function() {
		//Cinematic warping-in camera should be activated by the warp here
		fountainEffect.running = true
	},
	onEntered: function() {
		currentMap.changeCamera(centralPlazaCamera);
	},
}));
add(new Trigger({
	locations: [56, 29, 3, 1],
	onEntered: function() {
		currentMap.changeCamera("0");
		fountainEffect.running = false;
	},
	onLeaveToSouth: function() {
		currentMap.changeCamera(centralPlazaCamera);
		fountainEffect.running = true;	
	},
}));
add(new Trigger({
	locations: [44, 41, 1, 3],
	onEntered: function() {
		currentMap.changeCamera("0");
		fountainEffect.running = false;
	},
	onLeaveToEast: function() {
		currentMap.changeCamera(centralPlazaCamera);
		fountainEffect.running = true;	
	},
}));
add(new Trigger({
	locations: [56, 55, 3, 1],
	onEntered: function() {
		currentMap.changeCamera("0");
		fountainEffect.running = false;
	},
	onLeaveToNorth: function() {
		currentMap.changeCamera(centralPlazaCamera);
		fountainEffect.running = true;	
	},
}));
add(new Trigger({
	locations: [70, 41, 1, 3],
	onEntered: function() {
		currentMap.changeCamera("0");
		fountainEffect.running = false;
	},
	onLeaveToWest: function() {
		currentMap.changeCamera(centralPlazaCamera);
		fountainEffect.running = true;	
	},
}));





add(new AnimEvent({
	id: "ANIM_MartSignSpin",
	location: [38, 40],
	getAvatar : function(map) {
		var node = map.mapmodel.getObjectByName("PokeMartSign");
		
		if (!node.children[0]) return;
		if (!node.children[0].geometry) return;
		var center = node.children[0].geometry.boundingSphere.center;
		
		var parent = new THREE.Object3D();
		parent.position.set(center);
		
		node.parent.add(parent);
		parent.add(node);
		//node.position.set(center.negate());
		node.traverse(function(obj){
			if (!obj.geometry) return;
			obj.geometry.center(obj.geometry);
			obj.geometry.computeBoundingSphere();
		})
		
		this.sign_node = parent;
		
		return null;
	},
	onTick : function(delta) {
		this.sign_node.rotateY(delta * 0.05);
	},
}))

