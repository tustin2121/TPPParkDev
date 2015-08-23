// Flamesplash.pokemon/iCasino.js
// Defines the event for this character in Napoleon's casino

var base = require("./base.js");
var Actor = require("tpp-actor");
var ActorCasino = window.ActorCasino || Actor; //defined in the casino.js file

add(new ActorCasino(base, {
	dialog: [
		"All the slot machines seem to be out of order tonight.",
		"Maybe Napoleon's come to his senses and stopped perpetuating this gambling addiction he has...",
	],
}));