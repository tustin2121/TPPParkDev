// tGallery.js file

var base = require("./base.js");
var ActorGala = require("tpp-test-gallery");

add(new ActorGala(base, {
	dialog_type: "text",
	dialog: [
		function(){ this.showEmote(":("); },
		"Kenya seems a bit too big for this room...",
		function(){ this.hideEmote(); },
	],
}));