// xWalkwayLegends/events.js

var Event = require("tpp-event");
var Sign = require("tpp-sign");
var Warp = require("tpp-warp");
var CameraTrigger = require("tpp-cameratrigger");

var seawater = [];
var shipfoam;

$(function(){
	var ch = currentMap.mapmodel.children;
	for (var i = 0; i < ch.length; i++) {
		//Check if the model is a statue model
		if (ch[i].name.indexOf("ST-") == 0) {
			// For each model in the statue group, apply the following things
			for (var j = 0; j < ch[i].children.length; j++) {
				var mesh = ch[i].children[j];
				if (!(mesh instanceof THREE.Mesh)) continue;
				
				mesh.geometry.mergeVertices();
				mesh.geometry.computeFaceNormals();
				mesh.geometry.computeVertexNormals();
				
				mesh.geometry.normalsNeedUpdate = true;
				
				mesh.material.shininess = 0.01;
				
				mesh.material.map.magFilter = THREE.LinearFilter;
				mesh.material.map.minFilter = THREE.LinearFilter;
				mesh.material.map.needsUpdate = true;
				
				mesh.shading = THREE.SmoothShading;
			}
			
		}
		
		if (ch[i].name == "InsideDoorGlow") {
			for (var j = 0; j < ch[i].children.length; j++) {
				var mesh = ch[i].children[j];
				if (!(mesh instanceof THREE.Mesh)) continue;
				
				mesh.renderDepth = -100;
			}
		}
		
		if (ch[i].name == "Sea") {
			for (var j = 0; j < ch[i].children.length; j++) {
				var mesh = ch[i].children[j];
				if (!(mesh instanceof THREE.Mesh)) continue;
				
				seawater.push(mesh.material.map);
			}
		}
		if (ch[i].name == "Ship.Foam") {
			for (var j = 0; j < ch[i].children.length; j++) {
				var mesh = ch[i].children[j];
				if (!(mesh instanceof THREE.Mesh)) continue;
				
				shipfoam = mesh.material.map;
			}
		}
	}
	
});

/////////////////////////////// Warps ///////////////////////////

add(new Warp({
	id: "EXIT_Surldab",
	locations: [5, 10, 5, 1],
	exit_to: { map: "eSouthSurldab", warp: 0x00, }
}));

add(new Warp({
	id: "PORTAL_FrontDoorInward",
	locations: [6, 40, 3, 1],
	exit_to: { warp: 0x02, }
}));

add(new Warp({
	id: "PORTAL_FrontDoorOutward",
	locations: [29, 15, 3, 1],
	exit_to: { warp: 0x01, }
}));

add(new Warp({
	id: "PORTAL_SideDoor",
	locations: [20, 52],
	exit_to: { warp: 0x04, }
}));

add(new CameraTrigger({
	id: "CAMERA_side",
	locations: [21, 39],
	cameraId: "side",
	wCameraId: "0",
}));

///////////////////////////// Descriptions /////////////////////////

add(new Sign({
	id: "Statue_Helix",
	locations: [3, 17],
	signType: 0,
	text: "Lord Helix<br/>God of Anarchy",
}));

add(new Sign({
	id: "Statue_BirdJesus",
	locations: [11, 17],
	signType: 0,
	text: "Bird Jesus<br/>Messiah of the Helix",
}));

add(new Sign({
	id: "Statue_Zapdos",
	locations: [3, 25],
	signType: 0,
	text: "John the Zaptist<br/>The Archangel",
}));

add(new Sign({
	id: "Statue_ATV",
	locations: [11, 25],
	signType: 0,
	text: "ATV<br/>The Dragon Slayer",
}));

add(new Sign({
	id: "Statue_Fonz",
	locations: [3, 33],
	signType: 0,
	text: "The Fonz<br/>A King",
}));

add(new Sign({
	id: "Statue_Lapras",
	locations: [11, 33],
	signType: 0,
	text: "Air Jordan<br/>The Fresh Prince",
}));

////////////////////////////// Effects //////////////////////////////////

add(new Event({
	id: "SeawaterDrift",
	locations: [0, 0],
	onEvents: {
		tick: function(delta) {
			for (var i = 0; i < seawater.length; i++) {
				var off = seawater[i].offset.x;
				off += delta * 0.02;
				seawater[i].offset.set(off, off * 1.2);
				seawater[i].needsUpdate = true;
			}
			
			shipfoam.offset.x += delta * 0.02;
			shipfoam.needsUpdate = true;
		}
	}
}));
