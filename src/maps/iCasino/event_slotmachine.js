// event_slotmachine.js
// 

var Event = require("tpp-event");
var Controller = require("tpp-controller");

var NUM_SYMBOLS = 6;
var UV_X = 1;
var UV_Y = 1/8;
var SYMBOLS_PER_REEL = 30;
DEBUG.SPINSPEED = 360/SYMBOLS_PER_REEL * 48 * (Math.PI / 180);
var SLIP_LIMIT = 4;

var STATE_OFF = 0;
var STATE_IDLE = 1;
var STATE_SPINNING = 2;
var STATE_PAYOUT = 3;

var SYM_BONUS1 = 0; // 7 symbol
var SYM_BONUS2 = 1; // G symbol
var SYM_NORM1  = 2; // Moonstone
var SYM_NORM2  = 3; // Pikachu
var SYM_NORM3  = 4; // Pokeberries
var SYM_REPLAY = 5; // Replay
//Extra symbol 1 = 6
//Extra symbol 2 = 6

function rotationToIndex(rot) { return ( Math.floor((rot * (180/Math.PI)) / (SYMBOLS_PER_REEL/360)) ) % SYMBOLS_PER_REEL; }
function indexToRotation(sym) { return ( sym * (360/SYMBOLS_PER_REEL) * (Math.PI/180) ) % (2*Math.PI); }

var gameState = 0;

var reels = [];

function randomizeReels() {
	for (var r = 0; r < reels.length; r++) {
		var uvs = reels[r].geometry.faceVertexUvs[0];
		var lastSym = -1;
		for (var i = 0; i < SYMBOLS_PER_REEL; i++) {
			var symbol = Math.floor(Math.random() * NUM_SYMBOLS);
			if (symbol == lastSym) { //don't dup a symbol we just generated
				symbol = (symbol + 1) % NUM_SYMBOLS;
			}
			lastSym = symbol;
			// var symbol = Math.min(i, 7);
			reels[r].symbols[i] = symbol;
			
			uvs[i*2+0][0].set(UV_X * 0, UV_Y * (symbol+0));
			uvs[i*2+0][1].set(UV_X * 1, UV_Y * (symbol+0));
			uvs[i*2+0][2].set(UV_X * 0, UV_Y * (symbol+1));
			uvs[i*2+1][0].set(UV_X * 1, UV_Y * (symbol+0));
			uvs[i*2+1][1].set(UV_X * 1, UV_Y * (symbol+1));
			uvs[i*2+1][2].set(UV_X * 0, UV_Y * (symbol+1));
			
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

function tick_spinReels(delta) {
	if (Controller.isDown("Cancel", "casinoReels")) { endGame(); return; }
	
	var stopnum = 0;
	for (var i = 0; i < reels.length; i++) {
		if (reels[i].stopped) { 
			if (reels[i].rotation.x < reels[i].stoppingPosition) {
				var distTo = reels[i].stoppingPosition - reels[i].rotation.x;
				if (distTo < 0.01) {
					reels[i].rotation.x = reels[i].stoppingPosition;
				} else {
					reels[i].rotation.x += Math.min(distTo / 2, DEBUG.SPINSPEED * delta);
				}
			} else {
				stopnum++;
			}
		} else {
			reels[i].rotation.x += DEBUG.SPINSPEED * delta;
		}
	}
	
	if (stopnum == reels.length) {
		gameState = STATE_PAYOUT;
		return;
	}
	
	if (Controller.isDown("Left", "casinoReels")) {
		_calculateReelStopDistance(0);
	}
	if (Controller.isDown("Down", "casinoReels")) {
		_calculateReelStopDistance(1);
	}
	if (Controller.isDown("Right", "casinoReels")) {
		_calculateReelStopDistance(2);
	}
	return;
	
	function _calculateReelStopDistance(num) {
		var reel = reels[num];
		if (reel.stopped) return;
		reel.stopped = true;
		reel.rotation.x %= (2 * Math.PI);
		
		var realPos = reel.rotation.x + (DEBUG.SPINSPEED * 1); //where it'll be next second
		var stopSym = rotationToIndex(realPos);
		var stopPos = indexToRotation(stopSym);
		reel.stoppingPosition = stopPos;
		console.log(num, "=>", realPos, stopSym, stopPos, reel.symbols[stopSym]);
		
		if (stopnum == 2) { //If we're stopping the third reel, calculate slipping
			// First, gather the symbols coming up
			var nextSym = [];
			for (var i = -1; i < SLIP_LIMIT; i++) {
				nextSym.push(reel.symbols[(stopSym+i)%SYMBOLS_PER_REEL]);
			}
			//Note, -1 above to gather the symbol for the bottom row too
			
			// next, gather the current symbols for potential match calculation
			var grid = [
				-1, -1, -1,
				-1, -1, -1,
				-1, -1, -1,
			];
			
			if (num != 0) {
				var s = getSymbolsOnReel(0);
				grid[0] = s[0]; grid[3] = s[1]; grid[6] = s[2];
			}
			if (num != 1) {
				var s = getSymbolsOnReel(1);
				grid[1] = s[0]; grid[4] = s[1]; grid[7] = s[2];
			}
			if (num != 2) {
				var s = getSymbolsOnReel(2);
				grid[2] = s[0]; grid[5] = s[1]; grid[8] = s[2];
			}
			
			var slipBenefits = __calcReelSlip(grid, nextSym);
			
			//right now it'll slip to the highest payout
			//TODO calculate the odds of slipping past that
			var highestSlip = 0;
			var highestSlipValue = 0;
			for (var i = 0; i < nextSym.length; i++) {
				if (slipBenefits[i] > highestSlipValue) {
					highestSlip = i-1; //-1 to account for above use of -1
					highestSlipValue = slipBenefits[i];
				}
			}
			
			reel.stoppingPosition = indexToRotation(stopSym + highestSlip);
			console.log("SLIP =>", stopSym + highestSlip, reel.stoppingPosition, reel.symbols[stopSym + highestSlip]);
		}
		
		// Sanity check
		reel.stoppingPosition %= (2 * Math.PI);
		
		// Account for wrap around
		if (reel.stoppingPosition < reel.rotation.x) {
			reel.stoppingPosition += 2 * Math.PI;
		}
	}
}

function __calcReelSlip(grid, next) {
	var canMatch = [];
	var gridM = [];
	
	for (var i = 0; i < next.length; i++) {
		// Fill in the modified grid 
		gridM.length = 0;
		for (var g = 0; g < grid.length; g++) {
			gridM[g] = grid[g];
			if (gridM[g] == -1) {
				gridM[g] = next[i];
			}
		}
		
		// Run this potential through the match calculator
		var m = __calcMatches(grid);
		
		// If there are potential matches, record them
		if (m.length) {
			var payout = __getPayout(m);
			if (payout.replay) payout.payout += 5; //we don't care about replays this step
			canMatch[i] = payout.payout;
		}
	}
	
	return canMatch;
}

/** Takes a matches array straight from __calcMatches */
function __getPayout(matches) {
	var payout = 0;
	var replay = false;
	
	for (var i = 0; i < matches.length; i++) {
		switch (matches[i].symbol) {
			case SYM_REPLAY: replay = true; break;
			case SYM_NORM1:  payout += 15; break;
			case SYM_NORM2:  payout += 10; break;
			case SYM_NORM3:  payout += 2; break;
			case SYM_BONUS1: payout += 100; break;
			case SYM_BONUS2: payout += 100; break;
		}
	}
	
	return { payout: payout, replay: replay };
}

function __calcMatches(grid) {
	var matches = [];
	
	// X X X  <-- Testing Top Row
	// 0 0 0
	// 0 0 0
	if (grid[0] == grid[1] && grid[1] == grid[2]) 
		matches.push({ row: "tr", symbol: grid[1] });

	// 0 0 0
	// X X X  <-- Testing Middle Row
	// 0 0 0
	if (grid[3] == grid[4] && grid[4] == grid[5]) 
		matches.push({ row: "mr", symbol: grid[4] });
	
	// 0 0 0
	// 0 0 0
	// X X X  <-- Testing Bottom Row
	if (grid[6] == grid[7] && grid[7] == grid[8]) 
		matches.push({ row: "br", symbol: grid[7] });
	
	// 0 0 X  <-- Testing Forward Diagonal
	// 0 X 0
	// X 0 0
	if (grid[6] == grid[4] && grid[4] == grid[2]) 
		matches.push({ row: "fd", symbol: grid[4] });
	
	// X 0 0
	// 0 X 0
	// 0 0 X  <-- Testing Backward Diagonal
	if (grid[0] == grid[4] && grid[4] == grid[8]) 
		matches.push({ row: "bd", symbol: grid[4] });
	
	return matches;
}

function getSymbolsOnReel(num) {
	var reel = reels[num];
	
	var realPos = reel.rotation.x;
	var currSym = rotationToIndex(realPos);
	
	return [
		reel.symbols[(currSym + 1)%SYMBOLS_PER_REEL],
		reel.symbols[(currSym + 0)%SYMBOLS_PER_REEL],
		reel.symbols[(currSym - 1)%SYMBOLS_PER_REEL],
	];
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
			reels[i].symbols = new Array(SYMBOLS_PER_REEL);
			reels[i].stopped = true;
		}
		
		// randomizeReels();
		
		return null;
	},
	
	onEvents: {
		interacted: beginGame,
		tick: function(delta) {
			switch (gameState) {
				case STATE_IDLE: tick_insertCoin(delta); break;
				case STATE_SPINNING: tick_spinReels(delta); break;
				case STATE_PAYOUT: tick_payout(delta); break;
			}
		},
	},
	
	_reels: reels,
	
	_tapReel: function(loc) {
		var stopPos = indexToRotation(loc);
		reels[0].rotation.x = stopPos;
		console.log(loc, "=>", indexToRotation(loc), reels[0].symbols[loc]);
	}
});