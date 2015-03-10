// event_slotmachine.js
// 

var Event = require("tpp-event");
var Controller = require("tpp-controller");

var NUM_SYMBOLS = 6;
var UV_X = 1;
var UV_Y = 1/8;
var SYMBOLS_PER_REEL = 30;
DEBUG.SPINSPEED = 360/SYMBOLS_PER_REEL * 0.3 * (Math.PI / 180);

var STATE_OFF = 0;
var STATE_IDLE = 1;
var STATE_SPINNING = 2;
var STATE_PAYOUT = 3;

var gameState = 0;

var reels = [];

function randomizeReels() {
	for (var r = 0; r < reels.length; r++) {
		var uvs = reels[r].geometry.faceVertexUvs[0];
		for (var i = 0; i < SYMBOLS_PER_REEL; i++) {
			var symbol = Math.floor(Math.random() * NUM_SYMBOLS);
			reels[r].symbols[i] = symbol;
			
			uvs[i*2+0][0].set(UV_X * 1, UV_Y * (symbol+1));
			uvs[i*2+0][1].set(UV_X * 0, UV_Y * (symbol+1));
			uvs[i*2+0][2].set(UV_X * 1, UV_Y * (symbol+0));
			uvs[i*2+1][0].set(UV_X * 0, UV_Y * (symbol+1));
			uvs[i*2+1][1].set(UV_X * 0, UV_Y * (symbol+0));
			uvs[i*2+1][2].set(UV_X * 1, UV_Y * (symbol+0));
			
		}
		reels[r].geometry.uvsNeedUpdate = true;
	}
}

function beginGame() {
	Controller.pushInputContext("casinoReels");
	currentMap.changeCamera("reels");
	
	for (var i = 0; i < reels.length; i++) {
		reels[i].rotation.x = 0;
	}
	randomizeReels();
	gameState = STATE_IDLE;
}

function endGame() {
	gameState = STATE_OFF;
	Controller.popInputContext("casinoReels");
	currentMap.changeCamera("0");
}

function tick_insertCoin() {
	if (Controller.isDown("Cancel", "casinoReels")) { endGame(); return; }
	
	if (Controller.isDown("Up", "casinoReels")) {
		gameState = STATE_SPINNING;
		reels[0].stopped = false;
		reels[1].stopped = false;
		reels[2].stopped = false;
	}
}

function tick_spinReels() {
	if (Controller.isDown("Cancel", "casinoReels")) { endGame(); return; }
	
	var stopnum = 0;
	for (var i = 0; i < reels.length; i++) {
		if (reels[i].stopped) { stopnum++; continue; }
		reels[i].rotation.x += DEBUG.SPINSPEED;
	}
	
	if (stopnum == reels.length) {
		gameState = STATE_PAYOUT;
		return;
	}
	
	if (Controller.isDown("Left", "casinoReels")) {
		reels[0].stopped = true;
	}
	if (Controller.isDown("Down", "casinoReels")) {
		reels[1].stopped = true;
	}
	if (Controller.isDown("Right", "casinoReels")) {
		reels[2].stopped = true;
	}
	
}

function tick_payout() {
	if (Controller.isDown("Cancel", "casinoReels")) { 
		//TODO End payout immedeately
	}
	
	gameState = STATE_IDLE;
}


module.exports = new Event({
	id: "GAME_Reels",
	location: [0, 0],
	
	getAvatar: function(map) {
		var nodes = [
			map.mapmodel.getObjectByName("Reel0"),
			map.mapmodel.getObjectByName("Reel1"),
			map.mapmodel.getObjectByName("Reel2")
		]
		
		for (var i = 0; i < 3; i++) {
			var node = nodes[i];
			if (!node.children[0]) continue;
			if (!node.children[0].geometry) continue;
			var reel = node.children[0];
			var geom = reel.geometry;
			
			// Center the geometry
			reel.position.set(geom.boundingSphere.center);
			geom.center();
			geom.computeBoundingSphere();
			
			reels[i] = reel;
			reels[i].symbols = new Array(NUM_SYMBOLS);
			reels[i].stopped = true;
		}
		
		randomizeReels();
		
		return null;
	},
	
	onEvents: {
		interacted: beginGame,
		tick: function() {
			switch (gameState) {
				case STATE_IDLE: tick_insertCoin(); break;
				case STATE_SPINNING: tick_spinReels(); break;
				case STATE_PAYOUT: tick_payout(); break;
			}
		},
	},
	
	_reels: reels,
});