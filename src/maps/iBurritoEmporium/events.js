// iBurritoEmporium/events.js
//

var Event = require("tpp-event");
var Warp = require("tpp-warp");

//////////////// Fixing Transparency Problems ////////////////

(function(){
	var railing = currentMap.mapmodel.getChildByName("2ndRailing");
	
	var mat = new THREE.Matrix4().makeTranslation(0, -5/2, -5/2); //for some reason, this is doubled?!
	
	for (var i = 0; i < railing.children.length; i++) {
		var geom = railing.children[i].geometry;
		geom.applyMatrix(mat);
		
		geom.verticesNeedUpdate = true;
		geom.computeBoundingBox();
		geom.computeBoundingSphere();
		
		railing.children[i].position.z = 5;
		railing.children[i].position.y = 5;
	}
	
})();

///////////////////////// Upstairs ///////////////////////////

var upperFloors = [];
(function(){
	var ch = currentMap.mapmodel.children;
	for (var i = 0; i < ch.length; i++) {
		//Check if the model is of the 2nd floor, and collect them
		if (ch[i].name.indexOf("2nd") == 0) {
			upperFloors.push(ch[i]);
			// ch[i].visible = false;
		}
	}
})();

add(new Event({
	id: "ShowUpstairs",
	locations: [35, 9, 1, 2],
	onEvents: {
		"entering-tile" : function(from) {
			for (var i = 0; i < upperFloors.length; i++) {
				upperFloors[i].visible = true;
			}
		},
	},
}));

add(new Event({
	id: "HideUpstairs",
	locations: [16, 11, 1, 2],
	onEvents: {
		"entering-tile" : function(from) {
			for (var i = 0; i < upperFloors.length; i++) {
				upperFloors[i].visible = false;
			}
		},
	},
}));


/////////////////////// Warps ///////////////////////////

add(new Warp({
	id: "EXIT_Surldab",
	locations: [10, 33],
}));

