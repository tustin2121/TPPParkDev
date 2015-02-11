// soundmanager.js
// Defines the Sound Manager

var inherits = require("inherits");
var extend = require("extend");
var EventEmitter = require("events").EventEmitter;

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
	
	__muted_music: false,
	__muted_sound: false,
	__vol_music: 0.5,
	__vol_sound: 0.5,
	
	testSupport : function() {
		var testsound = new Audio();
		var ogg = testsound.canPlayType("audio/ogg; codecs=vorbis");
		if (ogg) this.ext = ".ogg";
		else this.ext = ".mp3";
	},
	
	setMusicVolume: function(vol) {
		
	},
	setSoundVolume: function(vol) {
		
	},
	
	
	
	
	preloadSound : function(id) {
		if (!this.sounds[id]) {
			var snd = this.sounds[id] = new Audio();
			snd.autoplay = false;
			snd.autobuffer = true;
			snd.preload = "auto";
			snd.src = BASEURL+"/snd/" + id + this.ext;
			snd.on("ended", function(){
				snd.currentTime = 0;
			});
			snd.load();
		}
		return this.sounds[id];
	},
	
	playSound : function(id) {
		if (this.muted_sound) return;
		if (!this.sounds[id]) {
			console.error("Sound is not loaded!", id);
			return;
		}
		this.sounds[id].play();
	},
	
	
	registerPreloadedMusic: function(id, info) {
		if (!this.music[id]) {
			var snd = this.music[id] = extend({
				tag: null,
				playing: false,
				loopStart: 0,
				loopEnd: 0,
			}, info);
			
			snd.tag.on("ended", function(){
				snd.playing = false;
				snd.currentTime = 0;
			});
			
			snd.tag.load();
		}
		return this.music[id];
	},
	
	loadMusic: function(id, info) {
		if (!this.music[id]) {
			var snd = this.music[id] = extend({
				tag: null,
				playing: false,
				loopStart: 0,
				loopEnd: 0,
			}, info);
			
			snd.tag = new Audio();
			snd.tag.autoplay = false;
			snd.tag.autobuffer = true;
			snd.tag.preload = "auto";
			snd.tag.src = info.url;
			$("body").append( $(snd.tag).css({display:"none"}) );
			
			snd.tag.on("ended", function(){
				snd.playing = false;
				snd.currentTime = 0;
			});
			
			snd.tag.load();
		}
		return this.music[id];
	},
	
	unloadMusic: function(id) {
		//TODO
	},
	
	playMusic: function(id){
		var m = this.music[id];
		if (!m) return;
		m.playing = true;
		m.tag.play();
	},
	
	pauseMusic: function(id){
		var m = this.music[id];
		if (!m) return;
		m.playing = false;
		m.tag.pause();
	},
	
	toggleMusic: function(id) {
		var m = this.music[id];
		if (!m) return;
		if (m.playing) {
			m.playing = false;
			m.tag.pause();
		} else {
			m.playing = true;
			m.tag.play();
		}
	},
	
	stopMusic: function(id){
		var m = this.music[id];
		if (!m) return;
		m.playing = false;
		m.tag.pause();
		m.tag.currentTime = 0;
	},
	
	
	_tick: function() {
		for (var id in this.music) {
			if (!this.music[id].loopEnd || !this.music[id].playing) continue;
			
			var m = this.music[id];
			if (m.tag.currentTime >= m.loopEnd) {
				m.tag.currentTime -= (m.loopEnd - m.loopStart);
			}
		}
	},
});

Object.defineProperties(SoundManager.prototype, {
	vol_music: {
		enumerable: true,
		get: function() { return this.__vol_music; },
		set: function(vol) {
			this.__vol_music = Math.clamp(vol);
			for (var i = 0; i < this.music.length; i++) {
				this.music[i].tag.volume = this.__vol_music;
			}
		},
	},
	vol_sound: {
		enumerable: true,
		get: function() { return this.__vol_sound; },
		set: function(vol) {
			this.__vol_sound = Math.clamp(vol);
			for (var i = 0; i < this.sounds.length; i++) {
				this.sounds[i].volume = this.__vol_sound;
			}
		},
	},
	muted_music: {
		enumerable: true,
		get: function() { return this.__muted_music; },
		set: function(val) {
			this.__muted_music = val;
			
		},
	},
	muted_sound: {
		enumerable: true,
		get: function() { return this.__muted_sound; },
		set: function(val) {
			this.__muted_sound = val;
			
		},
	},
	
	__vol_music: { enumerable: false, writable: true, },
	__vol_sound: { enumerable: false, writable: true, },
	__muted_music: { enumerable: false, writable: true, },
	__muted_sound: { enumerable: false, writable: true, },
});


module.exports = new SoundManager();
