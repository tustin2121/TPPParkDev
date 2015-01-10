// globals.js

window.currentMap = null;
window.gameState = require("./gamestate");

window.DEF_TEXTURE = "/img/missing_tex.png";
window.DEF_SPRITE = "/img/missing_sprite.png";
window.DEF_SPRITE_FORMAT = "pt_horzrow-32";

window.CONFIG = {
	speed : {
		pathing: 0.25,
		animation: 2.4,
	},
};

window.DEBUG = {};


//On Ready
$(function(){
	$("<img>").attr("str", DEF_TEXTURE).css({display:"none"}).appendTo("body");
	$("<img>").attr("str", DEF_SPRITE).css({display:"none"}).appendTo("body");
});
