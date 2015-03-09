// iCasino/events.js
// 

var Event = require("tpp-event");
var Sign = require("tpp-sign");
var Warp = require("tpp-warp");
var CameraTrigger = require("tpp-cameratrigger");


////////////////////////////////// Warps /////////////////////////////////////

add(new Warp({
	id: "EXIT_SurldabW",
	locations: [10, 30, 2, 1],
	exit_to: { map: "eSouthSurldab", warp: 0x14 },
}));

add(new Warp({
	id: "EXIT_SurldabS",
	locations: [43, 10, 1, 2],
	exit_to: { map: "eSouthSurldab", warp: 0x13 },
}));

////////////////////////////////// Camera //////////////////////////////////////

add(new CameraTrigger({
	id: "CAMERA_lobbyEntrance",
	locations: [30, 26, 1, 3],
	eCameraId: "lobby",
	wCameraId: "0",
}));

add(new CameraTrigger({
	id: "CAMERA_lobbyHallway",
	locations: [31, 2, 1, 2],
	eCameraId: "lobby",
	wCameraId: "hallway",
}));

add(new CameraTrigger({
	id: "CAMERA_elevatorRight",
	locations: [21, 2, 1, 2],
	wCameraId: "0",
	cameraId: "hallway",
}));

add(new CameraTrigger({
	id: "CAMERA_elevatorLeft",
	locations: [10, 2, 1, 2],
	eCameraId: "0",
	cameraId: "hallway",
}));

add(new CameraTrigger({
	id: "CAMERA_elevatorLeft",
	locations: [2, 4, 2, 1],
	cameraId: "0",
	nCameraId: "hallway",
}));




/////////////////////////////// Reel Minigame /////////////////////////////////

add(require("./event_slotmachine.js"));
