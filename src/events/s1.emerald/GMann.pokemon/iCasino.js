// GMann.pokemon/iCasino.js
// Defines the event for this character in Napoleon's casino

var base = require("./base.js");
var Actor = require("tpp-actor");
var ActorCasino = window.ActorCasino || Actor; //defined in the casino.js file

add(new ActorCasino(base, {
	dialog: [
		"GMann: Hm... yes, everything checks out. The Karp is in the--",
		function(){ this.showEmote("!", 2); },
		"What?! Stop looking at me like that! Shoo! This is none of your business!",
	],
}));