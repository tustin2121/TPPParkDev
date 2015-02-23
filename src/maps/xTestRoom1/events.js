// xTestRoom1/events.js

var Event = require("tpp-event");
var Sign = require("tpp-sign");
var Warp = require("tpp-warp");
var CameraTrigger = require("tpp-cameratrigger");

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