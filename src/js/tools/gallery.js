// gallery.js

//var THREE = require("three");
//var $ = require("jquery");
//var zip = zip.js

require("../polyfill.js");
var Map = require("../map");
var renderLoop = require("../model/renderloop");

require("../globals");

var warp = require("tpp-warp");

//On Ready
$(function(){
	
	MapManager.transitionTo("tGallery", 0);
	
	// currentMap = new Map("tGallery");
	// currentMap.load();
	// currentMap.queueForMapStart(function(){
	// 	UI.fadeIn();
	// });
	
	renderLoop.start({
		clearColor: 0x000000,
		ticksPerSecond : 20,
	});
	
});
