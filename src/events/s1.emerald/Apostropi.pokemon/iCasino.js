// Apostropi.pokemon/iCasino.js
// Defines the event for this character in Napoleon's casino

var base = require("./base.js");
var Actor = require("tpp-actor");
var ActorCasino = window.ActorCasino || Actor; //defined in the casino.js file

add(new ActorCasino(base, {
	dialog: [
		"Apostropi: This party's got some good vibes, but no eats! What gives?",
	],
}));