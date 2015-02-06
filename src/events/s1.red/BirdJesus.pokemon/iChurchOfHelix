// BirdJesus.trainer/iChurchOfHelix.js
// Defines BirdJesus's event for the "Church of Helix" map

var base = require("./base.js")
var Actor = require("tpp-actor");

var FaceDirBehav = require("tpp-behavior").FaceDirection;
var TalkingBehav = require("tpp-behavior").Talking;

add(new Actor(base, {
	location: [9, 4],
	onEvents: {
		created: function(){
			//TODO detect for Flareon getting added, and start arguments with 
		},
		interacted : function(fromDir) {
			var self = this;
			this.faceInteractor(fromDir);
			this.behaviorStack.push(new TalkingBehav({
				dialog: [
					"Praise Helix",
				],
			}));
		},
	},
	behaviorStack: [],
}));

