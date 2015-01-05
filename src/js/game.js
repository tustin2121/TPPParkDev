// game.js

//var THREE = require("three");
//var $ = require("jquery");
//var zip = zip.js

require("./polyfill.js");
var Map = require("./map");
var renderLoop = require("./model/renderloop");

require("./globals");


//On Ready
$(function(){
	
	currentMap = new Map("iChurchOfHelix");
	currentMap.load();
	
	renderLoop.start();
	
});
