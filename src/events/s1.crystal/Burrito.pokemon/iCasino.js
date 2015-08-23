// Burrito.pokemon/iCasino.js
// Defines the event for this character in Napoleon's casino

var base = require("./base.js");
var Actor = require("tpp-actor");
var ActorCasino = window.ActorCasino || Actor; //defined in the casino.js file

add(new ActorCasino(base, {
	dialog: [
		function(){ this.showEmote("<3", 3); },
		"Burrito: Hey, love! This party's just the thing I need after a hard day's work collecting fics!",
		"Deadinsky's helping me compile a whole bunch of the fanfictions for the Emporium.",
		"Maybe when Surldab is less of a mess and the ferries start running, you can come by the Emporium and read up!",
	],
}));