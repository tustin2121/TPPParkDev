// globals.js

window.SoundManager = require("./managers/soundmanager");
window.GC = require("./managers/garbage-collector");
window.UI = require("./managers/ui-manager");
window.Chat = require("./chat/core.js");

window.currentMap = null;
window.gameState = require("./gamestate");

window.DEF_TEXTURE = BASEURL+"/img/missing_tex.png";
window.DEF_SPRITE = BASEURL+"/img/missing_sprite.png";
window.DEF_SPRITE_FORMAT = "pt_horzrow-32";

window.CONFIG = {
	speed : {
		pathing: 0.25,
		animation: 3,
	},
	timeout : {
		walkControl : 1,
	}
};

window.DEBUG = {};


//On Ready
$(function(){
	$("<img>").attr("str", DEF_TEXTURE).css({display:"none"}).appendTo("body");
	$("<img>").attr("str", DEF_SPRITE).css({display:"none"}).appendTo("body");
});
