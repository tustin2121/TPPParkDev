// tGallery.js file

var base = require("./base.js");
var ActorGala = require("tpp-test-gallery");

add(new ActorGala(base, {
	dialog_type: "dialog",
	dialog: [
		"Hello! I'm Tustin2121!",
		"What you see around you is a sneak peak at TPP Park Verson 2. It's done in the style of the DS games using Three.js!",
		"There's three Wattson-like people around: real Wattson, VillainousWattson, and sohippy, our self-proclaimed Fake Wattson.",
		"I'm still debating on whether all three will enter the park, or if I make VillainousWattson the park's designated Wattson.",
		// "This is a test of the emergency dialog system. This is <em>only</em> a test.",
		// "If this were real, I would be <em><b>running around screaming with my hair on fire right now!!!</b></em>",
		// "But since I'm not, here is some <hlt>very important text</hlt> for your perusal.",
		// "That is all."
	],
}));