// casino.js

//var THREE = require("three");
//var $ = require("jquery");
//var zip = zip.js

var raf = require("raf");

require("../polyfill.js");
var Map = require("../map");
var renderLoop = require("../model/renderloop");

require("../globals");

var warp = require("tpp-warp");

window.ac = {
	Context: null,
	FilterNode: null,
	AnalyzerNode: null,
	AnalyzerCanvas: null,
	
	_songOffset: 0,
	_loopStart: 0,
	_loopEnd: 0,
	
	getBeatCount: function() {
		if (!this.Context) return 0;
		var x = (this.Context.currentTime - this._loopStart - this._songOffset);
		return x / this.BEAT_SPEED;
	},
	getSteadyJump: function(x) {
		if (!this.Context) return 0;
		if (!x) x = (this.Context.currentTime - this._loopStart - this._songOffset);
		return Math.abs( Math.sin(x * Math.PI/this.BEAT_SPEED) );
	},
/*	getSectionJump: function(x) {
		var spdMul = this.getSongLoopBeatSpeedMul();
		if (!x) x = this.getSongLoopTime();
		
		if (spdMul < 1.0) {
			
			
			
			return Math.abs( Math.sin(x * Math.PI/this.BEAT_SPEED) );
			
		} else {
			return this.getSteadyJump(x);
		}
	}, //*/
	
	getSongLoopTime: function() {
		if (!this.Context) return 0;
		// We can attempt to calculate where in the loop the song is.
		return ((this.Context.currentTime - this._loopStart - this._songOffset) 
					% (this._loopEnd - this._loopStart)) + this._loopStart;
	},
	
	BEAT_SPEED : 60/154.8, //speed of the beat in the casino music, 155 BPM
	BEAT_TABLE : [
		{ spd: 0.00,  until:  0.000, section: "ramp" },
		{ spd: 0.00,  until:  3.570, section: "ramp" },
		{ spd: 0.50,  until:  5.085, section: "beats1" },
		{ spd: 1.00,  until: 12.645, section: "bumps" },
		{ spd: 0.25,  until: 17.450, section: "whirl" },
		{ spd: 1.00,  until: 18.972, section: "whirlHigh" },
		{ spd: 1.00,  until: 31.389, section: "verse" },
		{ spd: 0.125, until: 43.589, section: "slowVerse" },
		{ spd: 0.50,  until: 45.329, section: "bridge" },
		{ spd: 1.00,  until: 61.092, section: "chorus" },
		{ spd: 0.00,  until: 63.939, section: "beats2" },
		{ spd: 0.50,  until: 65.492, section: "bumps2" },
		{ spd: 1.00,  until: 73.011, section: "verse2" },
		{ spd: 0.25,  until: 76.335, section: "whirl" },
		{ spd: 0.50,  until: 77.868, section: "whirlHigh" },
		{ spd: 1.00,  until: 99.000, section: "verse" },
	],
	getSongLoopBeatSpeedMul: function() {
		if (!this.Context) return 0;
		var time = this.getSongLoopTime();
		
		for (var i = 0; i < this.BEAT_TABLE.length; i++) {
			if (time > this.BEAT_TABLE[i].until) continue;
			return this.BEAT_TABLE[i].spd;
		}
		return 1.0;
	},
	getSongLoopBeatSection: function() {
		if (!this.Context) return "?";
		var time = this.getSongLoopTime();
		
		for (var i = 0; i < this.BEAT_TABLE.length; i++) {
			if (time > this.BEAT_TABLE[i].until) continue;
			return this.BEAT_TABLE[i].section;
		}
		return "?";
	},
};

//On Ready
$(function(){
	
	MapManager.transitionTo("iCasino", 0);
	
	renderLoop.start({
		clearColor: 0x000000,
		ticksPerSecond : 30,
	});
	
	ac.AnalyzerCanvas = $("#musicscreen").attr({
		"width" : "100%",
		"height": "150px",
	})[0];
	drawWaveforms(true);
});

DEBUG.updateFns = [];
DEBUG.soundAnalyzer = true;
DEBUG.setupAdditionalAudioFilters = function(id, audioCtx, finalNode){
	if (id != "m_gamecorner") return finalNode;
	
	ac.Context = audioCtx;
	
	ac.FilterNode = audioCtx.createBiquadFilter();
	ac.FilterNode.type = "lowpass";
	ac.FilterNode.frequency.value = audioCtx.sampleRate; //min: 40, max: sampleRate
	ac.FilterNode.Q.value = 0;
	finalNode.connect(ac.FilterNode);
	
	return ac.FilterNode;
};
DEBUG.runOnMapReady = function(){
	var map = currentMap;
	var oldlogic = map.logicLoop;
	map.logicLoop = function(delta){
		for (var i = 0; i < DEBUG.updateFns.length; i++) {
			if (!DEBUG.updateFns[i]) continue;
			if (!DEBUG.updateFns[i].update) continue;
			DEBUG.updateFns[i].update();
		}
		$("#statusbar").text(
			"Song Section: "+ ac.getSongLoopBeatSection()
		);
		oldlogic.call(map, delta);
	};
}; 

SoundManager.on("DEBUG-AnalyserCreated", function(id, analyser){
	if (id != "m_gamecorner") return;
	ac.AnalyzerNode = analyser;
});

SoundManager.on("load_music", function(id){
	var minfo = SoundManager.music[id];
	ac._loopStart = minfo.loopStart;
	ac._loopEnd = minfo.loopEnd;
	
	currentMap.queueForMapStart(function(){
		SoundManager.playMusic("m_gamecorner");
		ac._songOffset = ac.Context.currentTime;
	});
});


///////////////////////////////////////////////////////////////////////////////////////////

var _rafHandle;
var COLOR_WHEEL_TIME = 8.0;
function drawWaveforms(forceDraw) {
	if (!_rafHandle && forceDraw !== true) return; //stop the draw loop
	
	// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
	var dataArray;
	try {
		if (!ac.AnalyzerNode || !ac.AnalyzerCanvas) return;
		
		if (!dataArray) {
			dataArray = new Uint8Array(ac.AnalyzerNode.fftSize);
		}
		var canvasCtx = ac.AnalyzerCanvas.getContext("2d");
		
		var WIDTH = $(ac.AnalyzerCanvas).innerWidth();
		var HEIGHT = $(ac.AnalyzerCanvas).innerHeight();
		
		if (WIDTH != ac.AnalyzerCanvas.width || HEIGHT != ac.AnalyzerCanvas.height)
		{
			ac.AnalyzerCanvas.width = WIDTH;
			ac.AnalyzerCanvas.height = HEIGHT;
		}
		// canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
		
		ac.AnalyzerNode.getByteTimeDomainData(dataArray);
		canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.04)'; //'#000000';
		canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
		
		canvasCtx.lineWidth = 1;
		canvasCtx.strokeStyle = 'hsl('+Math.floor(ac.Context.currentTime*(360.0/COLOR_WHEEL_TIME))+', 100%, 50%)'; //'#FFFFFF';
		canvasCtx.beginPath();
		
		var sliceWidth = WIDTH * 1.0 / dataArray.length;
		var x = 0;
		for(var i = 0; i < dataArray.length; i++) {
			var v = dataArray[i] / 128.0;
			var y = v * HEIGHT/2;

			if(i === 0) {
				canvasCtx.moveTo(x, y);
			} else {
				canvasCtx.lineTo(x, y);
			}

			x += sliceWidth;
		}
		canvasCtx.lineTo(WIDTH, HEIGHT/2);
		canvasCtx.stroke();
	} finally {
		_rafHandle = raf(drawWaveforms);
	}
}
ac.drawWaveforms = drawWaveforms;

ac.stopWaveforms = function(){ _rafHandle = null; };
