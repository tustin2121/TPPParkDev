// chatot.js
// Defines the script for the Chat Simulation Tester

require("../polyfill.js");

var renderLoop = require("../model/renderloop");

require("../globals");

// On Ready
$(function(){
	
	renderLoop.start({
		_disableThree: true,
		ticksPerSecond : 20,
	});
	
});