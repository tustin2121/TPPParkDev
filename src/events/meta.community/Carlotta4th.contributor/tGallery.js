// tGallery.js file

var base = require("./base.js");
var ActorGala = require("tpp-test-gallery");

add(new ActorGala(base, {
	dialog_type: "dialog",
	dialog: [
		"How are you enjoying the gallery?",
		function(){ this.showEmote(":D") },
		"I created or edited most of the sprites you see walking around you!",
		function(){ this.hideEmote() },
		"Tustin is accepting sprites for the park, if you want to make your own.",
		"Or I might be able to make something for you, if I can find the time. You'll have to ask actual me on Reddit.",
	],
}));