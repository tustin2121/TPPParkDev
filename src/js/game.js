// game.js

//var THREE = require("three");
//var $ = require("jquery");
//var zip = zip.js

require("./polyfill.js");
var Map = require("./map");
var raf = require("raf");

window.currentMap = null;

//On Ready
$(function(){
	
	window.threeRenderer = new THREE.WebGLRenderer({ canvas: document.getElementById("gamescreen") });
	threeRenderer.setClearColorHex( 0xFF0000 );
	
	currentMap = new Map("iChurchOfHelix");
	currentMap.load();
	
	_renderHandle = raf(renderLoop);
	initGameLoop(30);
});

var _renderHandle; 
function renderLoop() {
	if (currentMap && currentMap.scene && currentMap.camera) {
		//Render with the map's active camera on its active scene
		threeRenderer.render(currentMap.scene, currentMap.camera);
	}
	
	if (_renderHandle)
		_renderHandle = raf(renderLoop);
}

var paused = false;
function initGameLoop(ticksPerSec) {
	_rate = 1000 / ticksPerSec;
	
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
		wholeTick *= _rate;
		
		if (currentMap.logicLoop)
			currentMap.logicLoop(wholeTick);
		accum -= wholeTick;
	}
}