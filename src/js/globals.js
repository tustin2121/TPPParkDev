// globals.js

window.CONFIG = {
	speed : {
		pathing: 2.5,
		animation: 30,
		bubblepop: 9.5,
	},
	timeout : {
		walkControl : 0.1,
	}
};

window.DEBUG = {};

//On Ready
$(function(){
	
});

window.SoundManager = require("./managers/soundmanager");
window.MapManager = require("./managers/mapmanager");
window.ActorScheduler = require("./managers/actorscheduler");
window.GC = require("./managers/garbage-collector");
window.UI = require("./managers/ui-manager");
// window.Chat = require("./chat/core.js");

window.currentMap = null;
window.gameState = require("./gamestate");
