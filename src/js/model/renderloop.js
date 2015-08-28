// renderloop.js
// The module that handles all the common code to render and do game ticks on a map

var extend = require("extend");
var raf = require("raf");
var controller = require("tpp-controller");

module.exports = {
	start : function(opts) {
		// Set the canvas's attributes, because those 
		// ACTUALLY determine how big the rendering area is.
		if (!opts._disableThree) {
			var canvas = $("#gamescreen");
			canvas.attr("width", parseInt(canvas.css("width")));
			canvas.attr("height", parseInt(canvas.css("height")));
			
			opts = extend({
				clearColor : 0x000000,
				ticksPerSecond : 30,
			}, opts);
			
			window.threeRenderer = new THREE.WebGLRenderer({
				antialias : true,
				canvas : document.getElementById("gamescreen") 
			});
			threeRenderer.setClearColorHex( opts.clearColor );
			threeRenderer.autoClear = false;
			
			threeRenderer.shadowMapEnabled = true;
			threeRenderer.shadowMapType = THREE.PCFShadowMap;
			
			_renderHandle = raf(renderLoop);
		}
		
		if (!opts_disableGameLoop) {
			initGameLoop(30);
		}
		
	},
	
	pause : function() {
		paused = true;
		// _renderHandle = null;
	},
	unpause : function() {
		paused = false;
		// _renderHandle = raf(renderLoop);
	},
};


var _renderHandle; 
function renderLoop() {
	threeRenderer.clear();
	
	if (window.currentMap && currentMap.scene && currentMap.camera) {
		//Render with the map's active camera on its active scene
		threeRenderer.render(currentMap.scene, currentMap.camera);
	}
	
	if (UI.scene && UI.camera) {
		//Render the UI with the UI camera and its scene
		threeRenderer.clear(false, true, false); //Clear depth buffer
		threeRenderer.render(UI.scene, UI.camera);
	}
	
	if (_renderHandle)
		_renderHandle = raf(renderLoop);
}

var paused = false;
function initGameLoop(ticksPerSec) {
	var _rate = 1000 / ticksPerSec;
	
	var accum = 0;
	var now = 0;
	var last = null;
	var dt = 0;
	var wholeTick;
	
	setInterval(timerTick, 0);
	
	function timerTick() {
		if (paused) {
			last = Date.now();
			accum = 0;
			return;
		}
		
		now = Date.now();
		dt = now - (last || now);
		last = now;
		accum += dt;
		if (accum < _rate) return;
		wholeTick = ((accum / _rate)|0);
		if (wholeTick <= 0) return;
		
		var delta = wholeTick / ticksPerSec;
		if (window.currentMap && currentMap.logicLoop)
			currentMap.logicLoop(delta);
		if (window.UI && UI.logicLoop)
			UI.logicLoop(delta);
		
		if (window.controller && controller._tick)
			controller._tick(delta);
		if (window.SoundManager && SoundManager._tick)
			SoundManager._tick(delta);
		
		wholeTick *= _rate;
		accum -= wholeTick;
	}
}