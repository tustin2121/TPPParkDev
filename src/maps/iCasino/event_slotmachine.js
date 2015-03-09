// event_slotmachine.js
// 

var Event = require("tpp-event");

var NUM_SYMBOLS = 6;
var UV_X = 1;
var UV_Y = 1/8;
var SYMBOLS_PER_REEL = 30;

var reels = [];

function randomizeReels() {
	for (var r = 0; r < reels.length; r++) {
		var uvs = reels[r].geometry.faceVertexUvs[0];
		for (var i = 0; i < SYMBOLS_PER_REEL; i++) {
			var symbol = Math.floor(Math.random() * NUM_SYMBOLS);
			
			uvs[i*2+0][0].set(UV_X * 1, UV_Y * (symbol+1));
			uvs[i*2+0][1].set(UV_X * 0, UV_Y * (symbol+1));
			uvs[i*2+0][2].set(UV_X * 1, UV_Y * (symbol+0));
			uvs[i*2+1][0].set(UV_X * 0, UV_Y * (symbol+1));
			uvs[i*2+1][1].set(UV_X * 0, UV_Y * (symbol+0));
			uvs[i*2+1][2].set(UV_X * 1, UV_Y * (symbol+0));
			
		}
		reels[r].geometry.uvsNeedUpdate = true;
	}
}


module.exports = new Event({
	id: "GAME_Reels",
	location: [0, 0],
	
	getAvatar: function(map) {
		var nodes = [
			map.mapmodel.getObjectByName("Reel0"),
			map.mapmodel.getObjectByName("Reel1"),
			map.mapmodel.getObjectByName("Reel2")
		]
		
		for (var i = 0; i < 3; i++) {
			var node = nodes[i];
			if (!node.children[0]) continue;
			if (!node.children[0].geometry) continue;
			var reel = node.children[0];
			var geom = reel.geometry;
			
			// Center the geometry
			reel.position.set(geom.boundingSphere.center);
			geom.center();
			geom.computeBoundingSphere();
			
			reels[i] = reel;
		}
		
		return null;
	},
	
	_randomizeReels: randomizeReels,
	_reels: reels,
});