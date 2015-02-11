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
	
	testSupport : function() {
		var testsound = new Audio();
		var ogg = testsound.canPlayType("audio/ogg; codecs=vorbis");
		if (ogg) this.ext = ".ogg";
		else this.ext = ".mp3";
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

module.exports = new SoundManager();
