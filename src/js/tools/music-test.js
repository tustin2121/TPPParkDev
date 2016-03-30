// music-test.js
// Where music loops can be tested!

var extend = require("extend");
var raf = require("raf");

require("../polyfill.js");
window.THREE = {
	Mesh: function(){},
	Object3D: function(){},
	Material: function(){},
	ShaderMaterial: function(){},
	BasicMaterial: function(){},
	Matrix4: function(){},
	Geometry: function(){},
	Vector3: function(){},
	Vector2: function(){},
	Face3: function(){},
	Texture: function(){},
	Color: function(){},
	Scene: function(){},
};

window.DEBUG = {
	soundAnalyzer: true,
};

var renderLoop = require("../model/renderloop");

// require("../globals");
window.SoundManager = require("../managers/soundmanager");
window.gameState = require("../gamestate");

var analyzers = {};

// On Ready
$(function(){
	
	renderLoop.start({
		_disableThree: true,
		ticksPerSecond : 20,
	});
	
	$("#loadbtn").on("click", function(){
		loadSong($("#idin").val());
		$("#loadbtn").blur();
	});
	
	var datalist = $("<datalist id='knownSongs'>");
	for (var id in KNOWN_SONGS) {
		datalist.append($("<option>").text(id));
	}
	$("#idin").after(datalist);
	
	drawWaveforms();
});

SoundManager.on("DEBUG-AnalyserCreated", function(id, da) {
	analyzers[id] = extend({a: da}, analyzers[id]);
});

SoundManager.on("load_music", function(id){
	var playPause = $("<button>")
		.addClass("playpause")
		.text("Play/Pause")
		.on("click", function(){
			SoundManager.toggleMusic(id);
		});
	
	analyzers[id] = extend({}, analyzers[id]);
	var canvas = analyzers[id].c;
	if (!canvas) {
		canvas = analyzers[id].c = 
		$("<canvas>")
			.attr({ height: 58, width: 150 })[0];
	}
	
	$("<tr>")
		.addClass("songRow")
		.attr("name", id)
		.append("<td><h2>"+id+"</h2></td>")
		.append($("<td>").append(canvas).css({"text-align": "center"}))
		.append($("<td>").append(playPause).css({"text-align": "right"}))
		.appendTo("#audiotable");
});

SoundManager.on("unloaded-music", function(id){
	$("#audiotable .songRow[name="+id+"]").remove();
});


function loadSong(id) {
	SoundManager.loadMusic(id, 
		extend({
			url: BASEURL+"/tools/music/"+id+".mp3",
		}, KNOWN_SONGS[id])
	);
}

var _rafHandle;
function drawWaveforms() {
	// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
	var dataArray;
	for (var id in analyzers) {
		if (!analyzers[id].a || !analyzers[id].c) continue;
		
		if (!dataArray) {
			dataArray = new Uint8Array(analyzers[id].a.fftSize);
		}
		var canvasCtx = analyzers[id].c.getContext("2d");
		var WIDTH = analyzers[id].c.width;
		var HEIGHT = analyzers[id].c.height;
		
		// canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
		
		analyzers[id].a.getByteTimeDomainData(dataArray);
		canvasCtx.fillStyle = '#000000';
		canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
		
		canvasCtx.lineWidth = 1;
		canvasCtx.strokeStyle = '#FFFFFF';
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
	}
	
	_rafHandle = raf(drawWaveforms);
}


var KNOWN_SONGS = {
	"go_gotcha":		{ "loopStart": 26.855,"loopEnd": 55.309 },
	"go_encounter":		{ "loopStart": 0.440, "loopEnd": 39.970 },
	"go_title":			{}, //No loop points
	"go_welcome":		{ "loopStart": 0.073, "loopEnd": 27.471 },
	"go_evolution":		{ },//"loopStart": 21.007,"loopEnd": 27.900 }, //Looping is horrible
	"go_walk":			{ "loopStart": 33.613,"loopEnd": 141.792 },
	"m_welcomexy":		{ "loopStart": 5.374, "loopEnd": 41.354 },
	"m_spearpillar":	{ "loopStart": 2.492, "loopEnd": 43.884 },
	"m_gallery": 		{ "loopStart": 0.773, "loopEnd": 89.554 },
	"m_welcome_pt":		{ "loopStart": 2.450, "loopEnd": 66.500 },
	"m_researchlab":	{ "loopStart": 2.450, "loopEnd": 66.500 },
	"m_gamecorner":		{ "loopStart": 18.61, "loopEnd": 79.010 },
	"m_casino_win":		{ "loopStart": 3.160, "loopEnd": 15.167 },
	"m_casino_win2":	{ "loopStart": 1.516, "loopEnd": 12.185 },
};