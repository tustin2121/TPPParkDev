// iCasino/events.js
// 

var inherits = require("inherits");
var extend = require("extend");

var Event = require("tpp-event");
var Sign = require("tpp-sign");
var Warp = require("tpp-warp");
var CameraTrigger = require("tpp-cameratrigger");

//////////////////////////// Volumetric Spotlights /////////////////////////////
// Adapted from https://github.com/jeromeetienne/threex.volumetricspotlight
// In turn from http://stemkoski.blogspot.fr/2013/07/shaders-in-threejs-glow-and-halo.html

function SpotSmokeMaterial(opts) {
	if (!(this instanceof SpotSmokeMaterial)) {
		return new SpotSmokeMaterial(opts);
	}
	
	var params = this._createMatParams(opts);
	THREE.ShaderMaterial.call(this, params);
	this.type = "SpotSmokeMaterial";
	
	this.transparent = true;
	this.depthWrite = false;
}
inherits(SpotSmokeMaterial, THREE.ShaderMaterial);
extend(SpotSmokeMaterial.prototype, {
	
	_createMatParams : function() {
		return {
			uniforms: { 
				attenuation	: {
					type	: "f",
					value	: 20,//5.0
				},
				anglePower	: {
					type	: "f",
					value	: 1.7,//1.2
				},
				spotPosition: {
					type	: "v3",
					value	: new THREE.Vector3( 0, 0, 0 )
				},
				lightColor	: {
					type	: "c",
					value	: new THREE.Color(0xFFFFFF)
				},
			},
			vertexShader	: this._vertShader,
			fragmentShader	: this._fragShader,
			// side		: THREE.DoubleSide,
			// blending	: THREE.AdditiveBlending,
		};
	},
	
	_vertShader: [
		'varying vec3 vNormal;',
		'varying vec3 vWorldPosition;',
		
		'void main(){',
			'// compute intensity',
			'vNormal		= normalize( normalMatrix * normal );',

			'vec4 worldPosition	= modelMatrix * vec4( position, 1.0 );',
			'vWorldPosition		= worldPosition.xyz;',

			'// set gl_Position',
			'gl_Position	= projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'}',
	].join( '\n' ),
	
	_fragShader: [
		'varying vec3		vNormal;',
		'varying vec3		vWorldPosition;',

		'uniform vec3		lightColor;',

		'uniform vec3		spotPosition;',

		'uniform float		attenuation;',
		'uniform float		anglePower;',

		'void main(){',
			'float intensity;',

			// distance attenuation
			// 'intensity	= distance(vWorldPosition, spotPosition)/attenuation;',
			'intensity	= distance(vWorldPosition, spotPosition)/attenuation;',
			'intensity	= 1.0 - clamp(intensity, 0.0, 1.0);',

			// intensity on angle
			'vec3 normal	= vec3(vNormal.x, vNormal.y, abs(vNormal.z));',
			'float angleIntensity	= pow( abs(dot(normal, vec3(0.0, 0.0, 1.0))), anglePower );',
			'intensity	= intensity * angleIntensity;',		
			// 'gl_FragColor	= vec4( lightColor, intensity );',

			// set the final color
			'gl_FragColor	= vec4( lightColor, intensity);',
		'}',
	].join( '\n' ),
});

function SpotSmokeHelper(light) {
	THREE.Object3D.call( this );
	this.type = "SpotSmokeHelper";

	this.light = light;
	this.light.updateMatrixWorld();

	this.matrix = light.matrixWorld;
	this.matrixAutoUpdate = false;

	var geometry = new THREE.CylinderGeometry( 0, 1, 1, 32, 20, true );

	geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, - 0.5, 0 ) );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

	// var material = new THREE.MeshBasicMaterial( { wireframe: false, fog: false } );
	var material = new SpotSmokeMaterial();

	this.cone = new THREE.Mesh( geometry, material );
	this.add( this.cone );

	this.update();
}
inherits(SpotSmokeHelper, THREE.Object3D);
extend(SpotSmokeHelper.prototype, {
	dispose : function () {
		this.cone.geometry.dispose();
		this.cone.material.dispose();
	},
	update : function () {
		var vector = new THREE.Vector3();
		var vector2 = new THREE.Vector3();

		return function () {
			var coneLength = this.light.distance ? this.light.distance : 30;
			var coneWidth = coneLength * Math.tan( this.light.angle );

			this.cone.scale.set( coneWidth, coneWidth, coneLength );

			vector.setFromMatrixPosition( this.light.matrixWorld );
			vector2.setFromMatrixPosition( this.light.target.matrixWorld );

			this.cone.lookAt( vector2.sub( vector ) );

			if (this.cone.material instanceof SpotSmokeMaterial) {
				this.cone.material.uniforms.spotPosition.value.set(vector);
				this.cone.material.uniforms.lightColor.value.set( this.light.color ).multiplyScalar( this.light.intensity );
			} else {
				this.cone.material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );
			}
		};
	}(),
});


///////////////////////////////// Lights /////////////////////////////////////

$(function(){
	var node = new THREE.Object3D();
	node.name = "Dance Lighting Rig";
	
	{ //Red Light
		var light = new THREE.SpotLight(0xFF2222);
		light.name = "Red Light";
		light.target.name = "Red Light Target";
		light.position.set(10, 5, 10);
		light.target.position.set(2, -2, 8);
		light.intensity = 1.1;
		light.exponent = 0;
		light.angle = 20 * (Math.PI/180);
		node.add(light);
		node.add(light.target);
		
		// var helper = new THREE.SpotLightHelper(light);
		// DEBUG.updateFns.push(helper);
		// node.add(helper);
		var fog = new SpotSmokeHelper(light);
		DEBUG.updateFns.push(fog);
		node.add(fog);
	}
	{ //Green Light
		var light = new THREE.SpotLight(0x22FF22);
		light.name = "Green Light";
		light.target.name = "Green Light Target";
		light.position.set(2, 5, 2);
		light.target.position.set(10, -2, 5);
		light.intensity = 1.1;
		light.exponent = 0;
		light.angle = 20 * (Math.PI/180);
		node.add(light);
		node.add(light.target);
		
		// var helper = new THREE.SpotLightHelper(light);
		// DEBUG.updateFns.push(helper);
		// node.add(helper);
		var fog = new SpotSmokeHelper(light);
		DEBUG.updateFns.push(fog);
		node.add(fog);
	}
	{ //Blue Light
		var light = new THREE.SpotLight(0x2222FF);
		light.name = "Blue Light";
		light.target.name = "Blue Light Target";
		light.position.set(-1, 5, 9);
		light.target.position.set(5, -2, 0);
		light.intensity = 1.1;
		light.exponent = 0;
		light.angle = 20 * (Math.PI/180);
		node.add(light);
		node.add(light.target);
		
		// var helper = new THREE.SpotLightHelper(light);
		// DEBUG.updateFns.push(helper);
		// node.add(helper);
		var fog = new SpotSmokeHelper(light);
		DEBUG.updateFns.push(fog);
		node.add(fog);
	}
	{ //Card Table Light
		var light = new THREE.SpotLight(0xFFFFFF);
		light.name = "Card Table Light";
		light.target.name = "Card Table Light Target";
		light.position.set(-9, 5, -1);
		light.target.position.set(-10, -2, 5);
		light.intensity = 0.9;
		light.exponent = 0;
		light.angle = 20 * (Math.PI/180);
		node.add(light);
		node.add(light.target);
		
		// var helper = new THREE.SpotLightHelper(light);
		// DEBUG.updateFns.push(helper);
		// node.add(helper);
		var fog = new SpotSmokeHelper(light);
		DEBUG.updateFns.push(fog);
		node.add(fog);
	}
	
	{ //Lobby Light
		var light = new THREE.SpotLight(0xFFFFFF);
		light.name = "Lobby Light";
		light.target.name = "Lobby Light Target";
		light.position.set(23, 6, -4);
		light.target.position.set(20, 1, -4);
		light.intensity = 1;
		light.exponent = 3;
		light.distance = 20;
		light.angle = 45 * (Math.PI/180);
		node.add(light);
		node.add(light.target);
		
		// var helper = new THREE.SpotLightHelper(light);
		// DEBUG.updateFns.push(helper);
		// node.add(helper);
		var fog = new SpotSmokeHelper(light);
		fog.cone.material.uniforms.anglePower.value = 8;
		fog.cone.material.uniforms.attenuation.value = 10;
		DEBUG.updateFns.push(fog);
		node.add(fog);
	}
	
	currentMap.scene.add(node);
	
	// For some reason, adding the lights here means its not added to *every* materal
	// So we need to refresh all materials.
	setTimeout(function(){
		var ch = currentMap.mapmodel.children;
		for (var i = 0; i < ch.length; i++) {
			for (var j = 0; j < ch[i].children.length; j++) {
				var m = ch[i].children[j].material;
				m.needsUpdate = true;
			}
		}
	}, 100);
});


////////////////////////// Model Modifications //////////////////////////////
$(function() {
	var ModelMods = require("tpp-model-mods");
	
	ModelMods.renderDepthFix.name = ["ElevatorGlass"];
	ModelMods.doubleSided.name = ["Railings"];
	// ModelMods.refreshMaterials.all = true;
	
	ModelMods.modify();
});

////////////////////////////////// Warps /////////////////////////////////////

add(new Warp({
	id: "EXIT_SurldabW",
	locations: [10, 33, 2, 1],
	exit_to: { map: "eSouthSurldab", warp: 0x14 },
}));

add(new Warp({
	id: "EXIT_SurldabS",
	locations: [43, 13, 1, 2],
	exit_to: { map: "eSouthSurldab", warp: 0x13 },
}));

////////////////////////////////// Camera //////////////////////////////////////

add(new CameraTrigger({
	id: "CAMERA_lobbyEntrance",
	locations: [30, 29, 1, 3],
	eCameraId: "lobby",
	wCameraId: "0",
}));

add(new CameraTrigger({
	id: "CAMERA_lobbyHallway",
	locations: [29, 5, 1, 2],
	eCameraId: "lobby",
	wCameraId: "hallway",
}));

// add(new CameraTrigger({
// 	id: "CAMERA_elevatorRight",
// 	locations: [21, 5, 1, 2],
// 	wCameraId: "0",
// 	cameraId: "hallway",
// }));

// add(new CameraTrigger({
// 	id: "CAMERA_elevatorLeft",
// 	locations: [10, 5, 1, 2],
// 	eCameraId: "0",
// 	cameraId: "hallway",
// }));

add(new CameraTrigger({
	id: "CAMERA_gameRoomElevator",
	locations: [2, 7, 2, 1],
	cameraId: "0",
	nCameraId: "hallway",
}));




/////////////////////////////// Reel Minigame /////////////////////////////////
/*
var reelgame;
add(reelgame = require("./event_slotmachine.js"));

add(new Event({
	id: "Reels1",
	locations: [13, 19],
	onEvents: {
		interacted: function() { reelgame.emit("interacted"); },
	},
}))
//*/

