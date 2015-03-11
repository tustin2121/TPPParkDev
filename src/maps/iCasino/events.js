// iCasino/events.js
// 

var Event = require("tpp-event");
var Sign = require("tpp-sign");
var Warp = require("tpp-warp");
var CameraTrigger = require("tpp-cameratrigger");

///////////////////////////////// Lights /////////////////////////////////////

$(function(){
	var node = new THREE.Object3D();
	node.name = "Dance Lighting Rig";
	
	{ //Red Light
		var light = new THREE.SpotLight(0xFF2222);
		light.name = "Red Light";
		light.position.set(10, 5, 10);
		light.target.position.set(2, -2, 8);
		light.intensity = 1.1;
		light.exponent = 0;
		light.angle = 20 * (Math.PI/180);
		node.add(light);
		node.add(light.target);
		
		var helper = new THREE.SpotLightHelper(light);
		DEBUG.updateFns.push(helper);
		node.add(helper);
	}
	{ //Green Light
		var light = new THREE.SpotLight(0x22FF22);
		light.name = "Green Light";
		light.position.set(2, 5, 2);
		light.target.position.set(10, -2, 5);
		light.intensity = 1.1;
		light.exponent = 0;
		light.angle = 20 * (Math.PI/180);
		node.add(light);
		node.add(light.target);
		
		var helper = new THREE.SpotLightHelper(light);
		DEBUG.updateFns.push(helper);
		node.add(helper);
	}
	{ //Blue Light
		var light = new THREE.SpotLight(0x2222FF);
		light.name = "Blue Light";
		light.position.set(-1, 5, 9);
		light.target.position.set(5, -2, 0);
		light.intensity = 1.1;
		light.exponent = 0;
		light.angle = 20 * (Math.PI/180);
		node.add(light);
		node.add(light.target);
		
		var helper = new THREE.SpotLightHelper(light);
		DEBUG.updateFns.push(helper);
		node.add(helper);
	}
	{ //Card Table Light
		var light = new THREE.SpotLight(0xFFFFFF);
		light.name = "Card Table Light";
		light.position.set(-9, 5, -1);
		light.target.position.set(-10, -2, 5);
		light.intensity = 0.9;
		light.exponent = 0;
		light.angle = 20 * (Math.PI/180);
		node.add(light);
		node.add(light.target);
		
		var helper = new THREE.SpotLightHelper(light);
		DEBUG.updateFns.push(helper);
		node.add(helper);
	}
	
	{ //Lobby Light
		var light = new THREE.SpotLight(0xFFFFFF);
		light.name = "Lobby Light";
		light.position.set(23, 4, -3);
		light.target.position.set(20, 0, -3);
		light.intensity = 1;
		light.exponent = 3;
		light.distance = 20;
		light.angle = 45 * (Math.PI/180);
		node.add(light);
		node.add(light.target);
		
		var helper = new THREE.SpotLightHelper(light);
		DEBUG.updateFns.push(helper);
		node.add(helper);
	}
	
	currentMap.scene.add(node);
	
	// For some reason, adding the lights here means its not added to *every* materal
	// So we need to refresh all materials.
	setTimeout(function(){
		var ch = currentMap.mapmodel.children;
		for (var i = 0; i < ch.length; i++) {
			for (var j = 0; j < ch[i].children.length; j++) {
				var m = ch[i].children[j].material;
				m.needsUpdate = true;
			}
		}
	}, 100);
});

////////////////////////// Model Modifications ///////////////////////////
$(function() {
	var ModelMods = require("tpp-model-mods");
	
	ModelMods.renderDepthFix.name = ["ElevatorGlass"];
	// ModelMods.refreshMaterials.all = true;
	
	ModelMods.modify();
});

////////////////////////////////// Warps /////////////////////////////////////

add(new Warp({
	id: "EXIT_SurldabW",
	locations: [10, 33, 2, 1],
	exit_to: { map: "eSouthSurldab", warp: 0x14 },
}));

add(new Warp({
	id: "EXIT_SurldabS",
	locations: [43, 13, 1, 2],
	exit_to: { map: "eSouthSurldab", warp: 0x13 },
}));

////////////////////////////////// Camera //////////////////////////////////////

add(new CameraTrigger({
	id: "CAMERA_lobbyEntrance",
	locations: [30, 29, 1, 3],
	eCameraId: "lobby",
	wCameraId: "0",
}));

add(new CameraTrigger({
	id: "CAMERA_lobbyHallway",
	locations: [29, 5, 1, 2],
	eCameraId: "lobby",
	wCameraId: "hallway",
}));

// add(new CameraTrigger({
// 	id: "CAMERA_elevatorRight",
// 	locations: [21, 5, 1, 2],
// 	wCameraId: "0",
// 	cameraId: "hallway",
// }));

// add(new CameraTrigger({
// 	id: "CAMERA_elevatorLeft",
// 	locations: [10, 5, 1, 2],
// 	eCameraId: "0",
// 	cameraId: "hallway",
// }));

add(new CameraTrigger({
	id: "CAMERA_gameRoomElevator",
	locations: [2, 7, 2, 1],
	cameraId: "0",
	nCameraId: "hallway",
}));




/////////////////////////////// Reel Minigame /////////////////////////////////

var reelgame;
add(reelgame = require("./event_slotmachine.js"));

add(new Event({
	id: "Reels1",
	locations: [13, 19],
	onEvents: {
		interacted: function() { reelgame.emit("interacted"); },
	},
}))
