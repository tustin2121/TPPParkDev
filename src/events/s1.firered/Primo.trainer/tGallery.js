// tGallery.js file

var base = require("./base.js");
var ActorGala = require("tpp-test-gallery");

add(new ActorGala(base, {
	dialog_type: "dialog",
	dialog: [
		"It's me, the Poké Dude!",
		"Make sure you tune in on your Teachy TV to the super Poké Dude Show!",
		"And remember, a good deed a day brings happiness to stay!",
	],
}));