// Pigdevil2010.member/iCasino.js
// Defines the event for this character in Napoleon's casino

var base = require("./base.js");
var Actor = require("tpp-actor");
var ActorCasino = window.ActorCasino || Actor; //defined in the casino.js file

add(new ActorCasino(base, {
	dialog: [
		"You: Pigu, pls.",
		function(){ this.showEmote(":)", 3); },
	],
}));