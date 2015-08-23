// Agent006.pokemon/iCasino.js
// Defines the event for this character in Napoleon's casino

var base = require("./base.js");
var Actor = require("tpp-actor");
var ActorCasino = window.ActorCasino || Actor; //defined in the casino.js file

add(new ActorCasino(base, {
	dialog: [
		"Agent006: Yes, G. It's only a party, no need to get all serious...",
		"Oh, hello. You haven't seen my little boy around, have you? He really shouldn't be here, but Solareon and Sunshine were too busy to watch him tonight.",
		"And of course he's run off into the crowd somewhere... I'm a little busy...",
	],
}));