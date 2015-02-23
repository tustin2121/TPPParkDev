// camera-trigger.js
// A trigger that changes the camera to another angle or definition

var Event = require("tpp-event");
var Trigger = require("tpp-trigger");
var inherits = require("inherits");
var extend = require("extend");

/**
 * A trigger is a tile that, when stepped upon, will trigger some event.
 * The most common event tiggered is a warping to another map, for which
 * the subclass Warp is designed for.
 *
 * Triggers may take up more than one space.
 */
function CameraTrigger(base, opts) {
	Event.call(this, base, opts);
	
	this.on("entered-tile", this.onTriggerEnter);
	this.on("leaving-tile", this.onTriggerLeave);
}
inherits(CameraTrigger, Trigger);
extend(CameraTrigger.prototype, {
	cameraId: undefined, //Camera to be triggered when stepping on this event
	nCameraId: undefined, //Cameras to be triggered when stepping off this event in a direction
	wCameraId: undefined,
	sCameraId: undefined,
	eCameraId: undefined,
	
	onTriggerEnter : function(dir) {
		if (this.cameraId !== undefined) {
			currentMap.changeCamera(this.cameraId);
		}
	},
	onTriggerLeave : function(dir) {
		var d = this.divideFacing(dir);
		if (this[d+"CameraId"] !== undefined) {
			currentMap.changeCamera(this[d+"CameraId"]);
		}
	},
});
module.exports = CameraTrigger;
