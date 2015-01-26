// eSouthSurldab/events.js
// Events for South Surldab

var Warp = require("tpp-warp");
var Event = require("tpp-event");

add(new Event({
	id: "MartSignSpin",
	location: [38, 40],
	getAvatar : function(map) {
		var node = map.mapmodel.getObjectByName("PokeMartSign");
		
		if (!node.children[0]) return;
		if (!node.children[0].geometry) return;
		var center = node.children[0].geometry.boundingSphere.center;
		
		var parent = new THREE.Object3D();
		parent.position.set(center);
		
		node.parent.add(parent);
		parent.add(node);
		//node.position.set(center.negate());
		node.traverse(function(obj){
			if (!obj.geometry) return;
			obj.geometry.center(obj.geometry);
			obj.geometry.computeBoundingSphere();
		})
		
		this.sign_node = parent;
		
		return null;
	},
	onEvents : {
		tick : function(delta) {
			this.sign_node.rotateY(delta * 0.05);
		},
	},
}))

