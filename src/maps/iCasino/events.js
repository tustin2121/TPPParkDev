// iCasino/events.js
// 

var Event = require("tpp-event");
var Sign = require("tpp-sign");
var Warp = require("tpp-warp");
var CameraTrigger = require("tpp-cameratrigger");

////////////////////////// Model Modifications ///////////////////////////
$(function() {
	var ModelMods = require("tpp-model-mods");
	
	ModelMods.renderDepthFix.name = ["ElevatorGlass"];
	
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
