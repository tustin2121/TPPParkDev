// tGallery.js file

var base = require("./base.js");
var ActorGala = require("tpp-test-gallery");

add(new ActorGala(base, {
	dialog_type: "dialog",
	dialog: [
		"Did you know they're building a gym just for me in Surldab City?",
		"I'll be able to keep taunting you guys forever there!",
		"WAHAHAHAHAHAHAHAHAHAHAHAHAHA!",
	],
}));