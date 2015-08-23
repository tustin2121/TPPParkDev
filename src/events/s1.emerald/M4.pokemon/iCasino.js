// M4.pokemon/iCasino.js
// Defines the event for this character in Napoleon's casino

var base = require("./base.js");
var Actor = require("tpp-actor");
var ActorCasino = window.ActorCasino || Actor; //defined in the casino.js file

add(new ActorCasino(base, {
	dialog: [
		"M4: I'll never understand why Apostropi keeps following us around, the backstabbing bitch.",
		"She has some obsession with C3. They're constantly at some sort of awful cat-and-mouse game!",
		"Though helping C3 tie that pikachu up is satisfying sometimes. Very stress reliving.",
	],
}));