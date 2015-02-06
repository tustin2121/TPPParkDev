// Red.trainer/iChurchOfHelix.js
// Defines Red's event for the "Church of Helix" map

var base = require("./base.js")
var Actor = require("tpp-actor");

var FaceDirBehav = require("tpp-behavior").FaceDirection;
var TalkingBehav = require("tpp-behavior").Talking;

add(new Actor(base, {
	location: [9, 4],
	onEvents: {
		interacted : function(fromDir) {
			var self = this;
			this.faceInteractor(fromDir);
			this.behaviorStack.push(new TalkingBehav({
				dialog: [ "...", "Praise Helix..." ],
			}));
		},
	},
	behaviorStack: [new FaceDirBehav(0, 1)],
}));

