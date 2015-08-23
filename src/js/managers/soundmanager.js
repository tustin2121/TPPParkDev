// soundmanager.js
// Defines the Sound Manager

var inherits = require("inherits");
var extend = require("extend");
var EventEmitter = require("events").EventEmitter;

var audioContext;

var MAX_MUSIC = 8; //Max number of music tracks cached in memory
var MAX_SOUNDS = 16; //Max number of sounds cached in memory

/**
 */
function SoundManager() {
	this.testSupport();
	
	this.preloadSound("walk_bump");
	this.preloadSound("walk_jump");
	this.preloadSound("walk_jump_land");
	this.preloadSound("exit_walk");
	
	this.registerPreloadedMusic("m_tornworld", {
		tag: DORITO_MUSIC,
		loopStart: 13.304,
		loopEnd: 22.842,
	});
}
inherits(SoundManager, EventEmitter);
extend(SoundManager.prototype, {
	sounds : {},
	music: {},
	ext : null,
	createAudio: null,
	
	__muted_music: false,
	__muted_sound: false,
	__vol_music: 0.5,
	__vol_sound: 0.5,
	
	testSupport : function() {
		var testsound = new Audio();
		var ogg = testsound.canPlayType("audio/ogg; codecs=vorbis");
		if (ogg) this.ext = ".ogg";
		else this.ext = ".mp3";
		
		try {
			audioContext = new (window.AudioContext || window.webkitAudioContext)();
			if (audioContext) {
				this.createAudio = createAudio_WebAPI;
			} else {
				this.createAudio = createAudio_Tag;
			}
			this.__audioContext = audioContext;
		} catch (e) {
			this.createAudio = createAudio_Tag;
		}
		
	},
	
	////////////////////////// Loading //////////////////////////////
	
	/** Loads sound from the server, used as part of the startup process. */
	preloadSound : function(id) {
		if (!this.sounds[id]) {
			this.sounds[id] = this.createAudio(id, {
				url : BASEURL+"/snd/" + id + this.ext,
			});
			this.sounds[id].mustKeep = true;
			this.emit("load_sound", id);
		}
		return this.sounds[id];
	},
	
	/** Loads music from the server, used as part of the startup process. */
	registerPreloadedMusic: function(id, info) {
		if (!this.music[id]) {
			this.music[id] = createAudio_Tag(id, info); //force using this kind
			this.music[id].mustKeep = true;
			this.emit("load_music", id);
		}
		return this.music[id];
	},
	
	/** Loads sound from data extracted from the map zip file. */
	loadSound: function(id, info) {
		if (!this.sounds[id]) {
			this.sounds[id] = this.createAudio(id, info);
			this.emit("load_sound", id);
		}
		return this.sounds[id];
	},
	
	/** Loads music from data extracted from the map zip file. */
	loadMusic: function(id, info) {
		if (!this.music[id]) {
			this._ensureRoomForMusic();
			this.music[id] = this.createAudio(id, info);
			this.emit("load_music", id);
		}
		return this.music[id];
	},
	
	
	isMusicLoaded: function(id) {
		return !!this.music[id];
	},
	isSoundLoaded: function(id) {
		return !!this.sounds[id];
	},
	
	_ensureRoomForMusic: function() {
		if (Object.keys(this.music).length+1 <= MAX_MUSIC) return;
		
		var oldestDate = new Date().getTime();
		var oldestId = null;
		for (var id in this.music) {
			var m = this.music[id]
			if (m.mustKeep) continue;
			if (m.loadDate < oldestDate) {
				oldestDate = m.loadDate;
				oldestId = id;
			}
		}
		
		this.music[oldestId].unload();
		delete this.music[oldestId];
		this.emit("unloaded-music", oldestId);
	},
	
	/////////////////////////////// Playing ///////////////////////////////
	
	playSound : function(id) {
		if (this.muted_sound) return;
		if (!this.sounds[id]) {
			console.error("Sound is not loaded!", id);
			return;
		}
		this.sounds[id].play();
	},
	
	playMusic: function(id){
		var m = this.music[id];
		if (!m) return;
		if (m.playing) return; //already playing
		
		var startDelay = 0;
		for (var id in this.music) {
			if (this.music[id].playing) {
				this.stopMusic(id);
				startDelay = 1000;
			}
		}
		
		setTimeout(function(){
			m.playing = true;
			if (this.muted_music) return;
			m.playing_real = true;
			m.play();
		}, startDelay);
	},
	
	pauseMusic: function(id){
		var m = this.music[id];
		if (!m) return;
		m.playing = m.playing_real = false;
		m.pause();
	},
	
	toggleMusic: function(id) {
		var m = this.music[id];
		if (!m) return;
		if (m.playing) {
			m.playing = m.playing_real = false;
			m.pause();
		} else {
			m.playing = true;
			if (this.muted_music) return;
			m.playing_real = true;
			m.play();
		}
	},
	
	stopMusic: function(id){
		var m = this.music[id];
		if (!m) return;
		// m.playing = m.playing_real = false;
		//m.pause();
		//m.currentTime = 0;
		m.fadeout = true;
	},
	
	
	_tick: function(delta) {
		for (var id in this.music) {
			this.music[id].loopTick(delta);
		}
	},
});

Object.defineProperties(SoundManager.prototype, {
	vol_music: {
		enumerable: true,
		get: function() { return this.__vol_music; },
		set: function(vol) {
			this.__vol_music = Math.clamp(vol);
			for (var id in this.music) {
				this.music[id].setVolume(this.__vol_music);
			}
		},
	},
	vol_sound: {
		enumerable: true,
		get: function() { return this.__vol_sound; },
		set: function(vol) {
			this.__vol_sound = Math.clamp(vol);
			for (var id in this.sounds) {
				this.sounds[id].setVolume(this.__vol_sound);
			}
		},
	},
	muted_music: {
		enumerable: true,
		get: function() { return this.__muted_music; },
		set: function(val) {
			this.__muted_music = val;
			for (var id in this.music) {
				this.music[id].setMuted(val);
			}
		},
	},
	muted_sound: {
		enumerable: true,
		get: function() { return this.__muted_sound; },
		set: function(val) {
			this.__muted_sound = val;
			for (var id in this.sounds) {
				this.sounds[id].setMuted(val);
			}
		},
	},
	
	__vol_music: { enumerable: false, writable: true, },
	__vol_sound: { enumerable: false, writable: true, },
	__muted_music: { enumerable: false, writable: true, },
	__muted_sound: { enumerable: false, writable: true, },
});


///////////////////////////// Sound Objects ///////////////////////////////

function SoundObject(opts) {
	extend(this, opts);
	this.loadDate = new Date().getTime();
}
extend(SoundObject.prototype, {
	playing: false, //sound is playing, theoretically (might be muted)
	playing_real: false, //sound is actually playing and not muted
	
	loopStart: 0,
	loopEnd: 0,
	
	loadDate: 0, //milisecond datestamp of when this was loaded, for cache control
	mustKeep: false, //if we should skip this object when determining sounds to unload
	
	fadeout: false,
	
	play: function(){},
	pause: function(){},
	setVolume: function(vol){},
	setMuted: function(muted){},
	loopTick: function(delta){},
	
	unload: function(){},
});



//////////////////////////// Audio Tag Implementation ////////////////////////////

function createAudio_Tag(id, info) {
	var snd;
	if (info.tag) {
		snd = info.tag;
	} else if (info.url) {
		snd = new Audio();
		snd.autoplay = false;
		snd.autobuffer = true;
		snd.preload = "auto";
		snd.src = info.url; 
		$("body").append( $(snd.tag).css({display:"none"}) );
	} else {
		throw new Error("Called createAudio without any info!");
	}
	
	var sobj = new SoundObject({
		__tag: snd,
		__bloburl: info.url,
		
		loopStart: info.loopStart || 0,
		loopEnd: info.loopEnd || 0,
		
		play: function() {
			this.__tag.play();
		},
		
		pause: function() {
			this.__tag.pause();
		},
		
		setVolume: function(vol) {
			this.__tag.volume = vol;
		},
		
		setMuted: function(muted) {
			if (muted) {
				this.playing_real = false;
				this.__tag.pause();
			} else {
				if (this.playing) {
					this.playing_real = true;
					this.__tag.play();
				}
			}
		},
		
		loopTick: function(delta) {
			if (!this.loopEnd || !this.playing_real) return;
			
			//TODO support this.fadeout
			if (this.__tag.currentTime >= this.loopEnd) {
				this.__tag.currentTime -= (this.loopEnd - this.loopStart);
			}
		},
		unload: function() {
			if (this.__bloburl)
				URL.revokeObjectURL(this.__bloburl);
			
			$(this.tag).remove();
			delete this.tag;
		},
	});
	snd.on("ended", function(){
		sobj.playing = false;
		sobj.playing_real = false;
		snd.currentTime = 0;
	});
	
	snd.load();
	
	return sobj;
}

////////////////////////// Web Audio API Implementation //////////////////////////

function createAudio_WebAPI(id, info) {
	var sobj = new SoundObject({
		__audioBuffer: null,
		__tag: null,
		__gainCtrl: null,
		__muteCtrl: null,
		__bloburl: null,
		__debugAnalyser: null,
		
		__currSrc: null,
		
		loopStart: info.loopStart || 0,
		loopEnd: info.loopEnd || 0,
		
		play: function() {
			var src;
			if (this.__audioBuffer) {
				src = audioContext.createBufferSource();
				src.buffer = this.__audioBuffer;
			} else if (this.__tag) {
				src = audioContext.createMediaElementSource(info.tag);
			} else { 
				console.log("No audio buffer ready to play!"); 
				return; 
			}
			
			src.loop = !!info.loopEnd;
			if (!!info.loopEnd) {
				src.loopStart = info.loopStart;
				src.loopEnd = info.loopEnd;
			}
			
			src.on("ended", function(){
				sobj.playing = false;
				sobj.playing_real = false;
				sobj.__currSrc = null;
			});
			
			src.connect(this.__gainCtrl);
			src.start();
			this._playing = true;
			
			this.__currSrc = src;
		},
		
		pause: function() {
			this.__currSrc.stop();
			this.__currSrc = null;
		},
		
		setVolume: function(vol) {
			this.__gainCtrl.gain.value = vol;
		},
		
		setMuted: function(muted) {
			if (this.fadeout) return; //ignore during fadeout
			this.__muteCtrl.gain.value = (muted)? 0 : 1;
		},
		
		loopTick: function(delta) {
			if (this.fadeout) {
				if (this.__muteCtrl.gain.value > 0.001) {
					this.__muteCtrl.gain.value -= delta * 0.5;
					// console.log(this.__muteCtrl.gain.value);
				} else {
					this.__currSrc.stop();
					this.__currSrc = null;
					this.fadeout = false;
					this.playing = this.playing_real = false;
					this.__muteCtrl.gain.value = 1;
				}
			}
		},
		
		unload: function(){
			if (this.__bloburl)
				URL.revokeObjectURL(this.__bloburl);
			
			delete this.__bloburl;
			delete this.__audioBuffer;
			delete this.__tag;
			delete this.__gainCtrl;
			delete this.__muteCtrl;
		},
	});
	
	
	if (info.tag) {
		sobj.__tag = info.tag;
		
	} else if (info.data) {
		currentMap.markLoading("DecodeAudio_"+id);
		
		var fr = new FileReader();
		fr.on("load", function(){
			audioContext.decodeAudioData(fr.result, function(buffer){
				sobj.__audioBuffer = buffer;
				if (sobj.playing_real) {
					sobj.play();
				}
				currentMap.markLoadFinished("DecodeAudio_"+id);
			});
		});
		fr.readAsArrayBuffer(info.data);
		
	} else if (info.url) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", info.url);
		xhr.responseType = 'arraybuffer';
		xhr.on("load", function(e) {
			// console.log("LOAD:", e);
			if (xhr.status != 200) {
				console.error("ERROR LOADING AUDIO:", xhr.statusText);
				return;
			}
			
			var data = xhr.response;
			audioContext.decodeAudioData(xhr.response, function(buffer){
				sobj.__audioBuffer = buffer;
				if (sobj.playing_real) {
					sobj.play();
				}
			});
		});
		xhr.on("error", function(e){
			console.error("ERROR LOADING AUDIO!!", e);
		});
		
		if (info.url.indexOf("blob") > -1) {
			this.__bloburl = info.url;
		}
		
		xhr.send();
	} else {
		throw new Error("Called createAudio without any info!");
	}
	
	sobj.__gainCtrl = audioContext.createGain();
	//TODO look into 3d sound fun: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext.createPanner
	sobj.__muteCtrl = audioContext.createGain();
	
	sobj.__gainCtrl.connect(sobj.__muteCtrl);
	//TODO
	
	var finalNode = sobj.__muteCtrl;
	if (DEBUG.setupAdditionalAudioFilters) {
		finalNode = DEBUG.setupAdditionalAudioFilters(id, audioContext, finalNode);
	}
	
	if (DEBUG.soundAnalyzer) {
		var da = sobj.__debugAnalyser = audioContext.createAnalyser();
		da.fftSize = 1024;//2048;
		this.emit("DEBUG-AnalyserCreated", id, da);
		
		finalNode.connect(da);
		da.connect(audioContext.destination);
	} else {
		finalNode.connect(audioContext.destination);
	}
	
	return sobj;
}



///////////////////////////////////////////////////////////////////////////////////
module.exports = new SoundManager();
