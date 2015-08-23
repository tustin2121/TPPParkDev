// AJ.trainer/iCasino.js
// Defines the event for this character in Napoleon's casino

var base = require("./base.js");
var Actor = require("tpp-actor");
var ActorCasino = window.ActorCasino || Actor; //defined in the casino.js file

add(new ActorCasino(base, {
	dialog: [
		"AJ: I wish Joey were here with me. It's a little awkward on my own...",
		"But he's busy finalizing our apartment over in Crystal Flatts. We've got a nice studio over there.",
		"I can't wait to finally move in to the place! Burrito and LazorGator have a flat right above ours, too!",
		function(){ this.showEmote(":)", 3); },
		"You should come visit sometime when you're in the area.",
	],
}));