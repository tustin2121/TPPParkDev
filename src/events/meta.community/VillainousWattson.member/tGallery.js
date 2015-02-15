// tGallery.js file

var base = require("./base.js");
var ActorGala = require("tpp-test-gallery");

add(new ActorGala(base, {
	dialog_type: "text",
	dialog: [
		function(){ this.showEmote("evil", 40); },
		"Villainous Wattson laughs in your face!",
	],
}));