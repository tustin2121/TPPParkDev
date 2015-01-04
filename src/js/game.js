// game.js

//var THREE = require("three");
//var $ = require("jquery");
//var zip = zip.js

require("./polyfill.js");
var Map = require("./map");
var renderLoop = require("./model/renderloop");

window.currentMap = null;

window.DEF_TEXTURE = "/img/missing_tex.png";
window.DEF_SPRITE = "/img/missing_sprite.png";

//On Ready
$(function(){
	$("<img>").attr("str", DEF_TEXTURE).css({display:none}).appendTo("body");
	$("<img>").attr("str", DEF_SPRITE).css({display:none}).appendTo("body");
	
	currentMap = new Map("iChurchOfHelix");
	currentMap.load();
	
	renderLoop.start();
	
});
