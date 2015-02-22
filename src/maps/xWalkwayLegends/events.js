// xWalkwayLegends/events.js

var Event = require("tpp-event");
var Warp = require("tpp-warp");

$(function(){
	var ch = currentMap.mapmodel.children;
	for (var i = 0; i < ch.length; i++) {
		//Check if the model is a statue model
		if (ch[i].name.indexOf("ST-") == 0) {
			// For each model in the statue group, apply the following things
			for (var j = 0; j < ch[i].children.length; j++) {
				var mesh = ch[i].children[j];
				if (!(mesh instanceof THREE.Mesh)) continue;
				
				mesh.geometry.mergeVertices();
				mesh.geometry.computeFaceNormals();
				mesh.geometry.computeVertexNormals();
				
				mesh.geometry.normalsNeedUpdate = true;
				
				mesh.material.shininess = 0.01;
				
				mesh.material.map.magFilter = THREE.LinearFilter;
				mesh.material.map.minFilter = THREE.LinearFilter;
				mesh.material.map.needsUpdate = true;
				
				mesh.shading = THREE.SmoothShading;
			}
			
		}
	}
});



add(new Warp({
	id: "EXIT_Surldab",
	locations: [5, 11, 5, 1],
	exit_to: { map: "eSouthSurldab", warp: 0x00, }
}));

add(new Warp({
	id: "PORTAL_FrontDoorInward",
	locations: [6, 40, 3, 1],
	exit_to: { warp: 0x02, }
}));

add(new Warp({
	id: "PORTAL_FrontDoorOutward",
	locations: [29, 15, 3, 1],
	exit_to: { warp: 0x01, }
}));

add(new Warp({
	id: "PORTAL_SideDoor",
	locations: [20, 51],
	exit_to: { warp: 0x04, }
}));