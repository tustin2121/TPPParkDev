// globals.js

window.currentMap = null;

window.DEF_TEXTURE = "/img/missing_tex.png";
window.DEF_SPRITE = "/img/missing_sprite.png";
window.DEF_SPRITE_FORMAT = "pt_horzrow-32";

//On Ready
$(function(){
	$("<img>").attr("str", DEF_TEXTURE).css({display:"none"}).appendTo("body");
	$("<img>").attr("str", DEF_SPRITE).css({display:"none"}).appendTo("body");
});