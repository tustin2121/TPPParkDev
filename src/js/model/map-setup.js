// map-setup.js
// Defines some of the setup functions for Map.js in a separate file, for organization

module.exports = {
	camera : {
		ortho : function(camdef) {
			var scrWidth = $("#gamescreen").width();
			var scrHeight = $("#gamescreen").height();
			
			this.camera = new THREE.OrthographicCamera(scrWidth/-2, scrWidth/2, scrHeight/2, scrHeight/-2, 1, 1000);
			this.camera.position.y = 100;
			this.camera.roation.x = -Math.PI / 2;
			this.scene.add(this.camera);
		},
		
		gen4 : function(camdef) {
			var scrWidth = $("#gamescreen").width();
			var scrHeight = $("#gamescreen").height();
			
			this.camera = new THREE.PerspectiveCamera(75, scrWidth / scrHeight, 1, 1000);
			this.camera.position.y = 5;
			this.camera.position.z = -5;
			this.camera.rotation.x = -55 * (Math.PI / 180);
			//TODO set up a camera for each layer
			this.scene.add(this.camera);
		},
		
		gen5 : function(camdef) {
			var scrWidth = $("#gamescreen").width();
			var scrHeight = $("#gamescreen").height();
			
			this.camera = new THREE.PerspectiveCamera(75, scrWidth / scrHeight, 1, 1000);
			//parse up the gen 5 camera definitions
			this.scene.add(this.camera);
		},
	},
	
	lighting : {
		interior : function() {
			var light;
			
			light = new THREE.DirectionalLight();
			light.position.set(0, 75, 1);
			light.castShadow = true;
			light.onlyShadow = true;
			light.shadowDarkness = 0.7;
			light.shadowBias = 0.001;
			
			//this.mapmodel.
			light.shadowCameraNear = 1;
			light.shadowCameraFar = 150;
			light.shadowCameraTop = 10;
			light.shadowCameraBottom = -10;
			light.shadowCameraLeft = -10;
			light.shadowCameraRight = 10;
			
			light.shadowCameraVisible = true;
			this.scene.add(light);
			
			DEBUG.showShadowCamera = function() { light.shadowCameraVisible = true; };
			DEBUG._shadowCamera = light;
			
			light = new THREE.DirectionalLight(0xffffff, 0.9);
			light.position.set(1, 1, 1);
			this.scene.add(light);
			
			light = new THREE.DirectionalLight(0xffffff, 0.9);
			light.position.set(-1, 1, 1);
			this.scene.add(light);
		},
		
		exterior : function() {
			
		},
		
		hell : function() {
			//TODO Dorrito Dungeon
		},
	},
}