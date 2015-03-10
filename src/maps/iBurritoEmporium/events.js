// iBurritoEmporium/events.js
//

var Event = require("tpp-event");
var Warp = require("tpp-warp");

var inherits = require("inherits");
var extend = require("extend");

//////////////// Fixing Transparency Problems ////////////////

(function(){
	// Setup glass railings
	var railing = currentMap.mapmodel.getChildByName("2ndRailing");
	for (var i = 0; i < railing.children.length; i++) {
		railing.children[i].renderDepth = -50;
	}
	
	// Setup the godrays
	var rays = currentMap.mapmodel.getChildByName("Godrays");
	for (var i = 0; i < rays.children.length; i++) {
		rays.children[i].renderDepth = -100;
		rays.children[i].material.blending = THREE.AdditiveBlending;
		rays.children[i].material.depthWrite = false;
	}
	
	// Hide rope gates by putting them under the floor
	var ropeGate;
	for (var i = 1; i <= 3; i++) {
		ropeGate = currentMap.mapmodel.getChildByName("2ndLineRope"+i);
		ropeGate.position.y = -1.1;
	}
	
	
	
	// var mat = new THREE.Matrix4().makeTranslation(0, -5/2, -5/2); //for some reason, this is doubled?!
	
	// for (var i = 0; i < railing.children.length; i++) {
	// 	var geom = railing.children[i].geometry;
	// 	geom.applyMatrix(mat);
		
	// 	geom.verticesNeedUpdate = true;
	// 	geom.computeBoundingBox();
	// 	geom.computeBoundingSphere();
		
	// 	railing.children[i].position.z = 5;
	// 	railing.children[i].position.y = 5;
	// }
	
})();


/////////////////////// Warps ///////////////////////////

add(new Warp({
	id: "EXIT_Surldab",
	locations: [10, 33],
	exit_to: { map: "eSouthSurldab", warp: 0x10 },
}));


///////////////////////// Upstairs ///////////////////////////

var upperFloors = [];
(function(){
	var ch = currentMap.mapmodel.children;
	for (var i = 0; i < ch.length; i++) {
		//Check if the model is of the 2nd floor, and collect them
		if (ch[i].name.indexOf("2nd") == 0) {
			upperFloors.push(ch[i]);
			ch[i].visible = false;
		}
	}
})();

add(new Event({
	id: "ShowUpstairs",
	locations: [35, 9, 1, 2],
	onEvents: {
		"entering-tile" : function(from) {
			for (var i = 0; i < upperFloors.length; i++) {
				upperFloors[i].visible = true;
			}
		},
	},
}));

add(new Event({
	id: "HideUpstairs",
	locations: [16, 11, 1, 2],
	onEvents: {
		"entering-tile" : function(from) {
			for (var i = 0; i < upperFloors.length; i++) {
				upperFloors[i].visible = false;
			}
		},
	},
}));


////////////////////////// Shelves ///////////////////////////
// var secretShelf = null;

function divideFacing(dirvector) {
	var x = dirvector.x, y = dirvector.z;
	// console.log("DIRFACING:", x, y);
	if (Math.abs(x) > Math.abs(y)) { //Direction vector is pointing along x axis
		if (x > 0) return "w";
		else return "e";
	} else { //Direction vector is pointing along y axis
		if (y > 0) return "s";
		else return "n";
	}
	return "s";
}

function Shelf(opts) {
	extend(this, opts);
	this.on("interacted", this._interact);
}
inherits(Shelf, Event);
extend(Shelf.prototype, {
	north: null,
	south: null,
	east: null,
	west: null,
	
	_interact: function(fromDir) {
		switch (divideFacing(fromDir)) {
			case "n": __process(this.north); return;
			case "s": __process(this.south); return;
			case "e": __process(this.east); return;
			case "w": __process(this.west); return;
		}
		
		function __process(obj) {
			if (typeof obj == "function") {
				obj.call(this);
			} else if ($.isArray(obj)) {
				//TODO UI Menu
			}
		}
	},
});



add(new Warp({
	id: "OpenSecretDoor",
	locations: [23, 3],
	exit_to: null,//{ map: "", warp: 0 },
	
	secretShelf: null,
	_speed: 0.8,
	_alpha: 0,
	isOpen: false,
	
	getAvatar : function(map) {
		this.secretShelf = currentMap.mapmodel.getChildByName("2ndSecretShelves");
		
		return null;
	},
	
	canWalkOn: function(){ return this.isOpen && this._alpha < 0.2; },
	
	onEvents: {
		interacted : function(from) {
			this.isOpen = !this.isOpen;
		},
		tick: function(delta) {
			if (!this.secretShelf) return;
			
			if (!this.isOpen && this._alpha < 1) {
				this._alpha = Math.clamp(this._alpha + (delta * this._speed));
			} else if (this.isOpen && this._alpha > 0) {
				this._alpha = Math.clamp(this._alpha - (delta * this._speed));
			}
			
			this.secretShelf.position.y = (Math.cos(this._alpha * Math.PI) * 0.5 + 0.5) * -1.46;
		},
	},
}));
