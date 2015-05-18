// map-setup.js
// Defines some of the setup functions for Map.js in a separate file, for organization

var extend = require("extend");

function setupMapRigging(map) {
	{	// Setup Lighting Rigging
		var lightdef = extend({ "type": "int", "default": {} }, map.metadata.lighting);
		
		var rig = setupLighting(map, lightdef);
		map.scene.add(rig);
	}
	
	{	// Setup Shadow Map Rigging
		var shadowdef = extend({}, map.metadata.shadowmap);
		
		if ($.isPlainObject(shadowdef)) {
			shadowdef = [shadowdef];
		}
		
		var rig = setupShadowMaps(map, shadowdef);
		map.scene.add(rig);
	}
	
	{	// Setup Camera Rigging
		var camdef = extend({ "0": {} }, map.metadata.cameras);
		
		var rig = setupCameras(map, camdef);
		map.scene.add(rig);
	}
	
}
module.exports = setupMapRigging;


function setupLighting(map, def) {
	var node = new THREE.Object3D();
	node.name = "Lighting Rig";
	
	var light;
	var ORIGIN = new THREE.Vector3(0, 0, 0);
	
	if (def.type == "int") {
		// Setup default interior lighting rig
		var intensity = def["default"].intensity || 1.4;
		var skyColor = def["default"].skyColor || 0xFFFFFF;
		var groundColor = def["default"].groundColor || 0x111111;
		
		light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
		
		var cp = def["default"].position || [-4, 4, 4];
		light.position.set(cp[0], cp[1], cp[2]);
		
		light.lookAt(ORIGIN);
		node.add(light);
	}
	else if (def.type == "ext") {
		// Setup default exterior lighting rig, with sun movement
		var intensity = def["default"].intensity || 1.4;
		var skyColor = def["default"].skyColor || 0xFFFFFF;
		var groundColor = def["default"].groundColor || 0x111111;
		
		light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
		
		var cp = def["default"].position || [-4, 4, 4];
		light.position.set(cp[0], cp[1], cp[2]);
		
		light.lookAt(ORIGIN);
		node.add(light);
		
		//TODO setup sun movement
	}
	
	return node;
}



function setupShadowMaps(map, shadowMaps) {
	var node = new THREE.Object3D();
	node.name = "Shadow Casting Rig";
	
	for (var i = 0; i < shadowMaps.length; i++) {
		var shm = shadowMaps[i];
		
		light = new THREE.DirectionalLight();
		light.position.set(0, 75, 1);
		light.castShadow = true;
		light.onlyShadow = true;
		light.shadowDarkness = 0.7;
		light.shadowBias = 0.001;
		
		light.shadowCameraNear = shm.near || 1;
		light.shadowCameraFar = shm.far || 200;
		light.shadowCameraTop = shm.top || 30;
		light.shadowCameraBottom = shm.bottom || -30;
		light.shadowCameraLeft = shm.left || -30;
		light.shadowCameraRight = shm.right || 30;
		
		light.shadowMapWidth = shm.width || 512;
		light.shadowMapHeight = shm.height || 512;
		
		// light.shadowCameraVisible = true;
		node.add(light);
		
		DEBUG._shadowCamera = light;
	} 
	
	return node;
}



var camBehaviors = {
	none: function(){},
	followPlayer : function(cdef, cam, camRoot) {
		return function(delta) {
			// if (!player || !player.avatar_node) return;
			camRoot.position.set(player.avatar_node.position);
			//TODO negate moving up and down with jumping
		};
	},
	followPlayerX: function(cdef, came, camRoot) {
		var zaxis = cdef["zaxis"] || 0;
		var xmax = cdef["xmax"] || 1000;
		var xmin = cdef["xmin"] || -1000;
		
		return function(delta) {
			camRoot.position.x = Math.max(xmin, Math.min(xmax, player.avatar_node.position.x));
			camRoot.position.y = player.avatar_node.position.y;
			camRoot.position.z = zaxis;
		};
	},
	followPlayerZ: function(cdef, came, camRoot) {
		var xaxis = cdef["xaxis"] || 0;
		var zmax = cdef["zmax"] || 1000;
		var zmin = cdef["zmin"] || -1000;
		
		return function(delta) {
			camRoot.position.x = xaxis;
			camRoot.position.y = player.avatar_node.position.y;
			camRoot.position.z = Math.max(zmin, Math.min(zmax, player.avatar_node.position.z));
		};
	},
	
	softFollowZ: function(cdef, came, camRoot) {
		var xaxis = cdef["xaxis"] || 0; //axis along which to keep the camera
		var dev = cdef["dev"] || 5; //max deviation of the cam position from this axis
		var lookrange = cdef["lookrange"] || 10; //max deviation of the lookat position from this axis
		
		var zmax = cdef["zmax"] || 1000;
		var zmin = cdef["zmin"] || -1000;
		
		return function(delta) {
			var offpercent = (player.avatar_node.position.x - xaxis) / lookrange;
			
			camRoot.position.x = xaxis + (offpercent * dev);
			camRoot.position.y = player.avatar_node.position.y;
			camRoot.position.z = Math.max(zmin, Math.min(zmax, player.avatar_node.position.z));
		};
	},
	
	// Follow along an axis, tilt to look at the player as they move off the center line
	softFollowZYTilt: function(cdef, came, camRoot) {
		var xaxis = cdef["xaxis"] || 0; //axis along which to keep the camera
		var dev = cdef["dev"] || 5; //max deviation of the cam position from this axis
		var lookrange = cdef["lookrange"] || 10; //max deviation of the lookat position from this axis
		var notilt = cdef["notilt"] || 0; //deviation of cam position that doesn't tilt
		var lookoff = cdef["lookat"] || [0, 0.8, 0];
		
		var zmax = cdef["zmax"] || 1000;
		var zmin = cdef["zmin"] || -1000;
		var ymax = cdef["y@zmax"] || 2;
		var ymin = cdef["y@zmin"] || 4;
		
		return function(delta) {
			var yper = (camRoot.position.z - zmin) / (zmax - zmin);
			
			if (player.avatar_node.position.x < xaxis + notilt 
				&& player.avatar_node.position.x > xaxis - notilt) 
			{
				camRoot.position.x = player.avatar_node.position.x;
				camRoot.position.y = (ymin + (ymax-ymin)*yper) + player.avatar_node.position.y;
				console.log(yper, camRoot.position.y);
				camRoot.position.z = Math.max(zmin, Math.min(zmax, player.avatar_node.position.z));
				
				var lx = lookoff[0];
				var ly = lookoff[1];
				var lz = lookoff[2];
				came.lookAt(new THREE.Vector3(-lx, ly, lz));
			}
			else
			{
				var baseaxis = (player.avatar_node.position.x > xaxis)? xaxis+notilt : xaxis-notilt;
				var offpercent = (player.avatar_node.position.x - baseaxis) / lookrange;
				
				camRoot.position.x = baseaxis + (offpercent * dev);
				camRoot.position.y = (ymin - (ymax-ymin)*yper) + player.avatar_node.position.y;
				camRoot.position.z = Math.max(zmin, Math.min(zmax, player.avatar_node.position.z));
				
				var lx = camRoot.position.x - player.avatar_node.position.x + lookoff[0];
				var ly = camRoot.position.y - player.avatar_node.position.y + lookoff[1];
				var lz = camRoot.position.z - player.avatar_node.position.z + lookoff[2];
				came.lookAt(new THREE.Vector3(-lx, -ly, lz));
			}
		};
	},
	
	// Follow along an axis, tilt to look at the player as they move off the center line
	softFollowZTilt: function(cdef, came, camRoot) {
		var xaxis = cdef["xaxis"] || 0; //axis along which to keep the camera
		var dev = cdef["dev"] || 5; //max deviation of the cam position from this axis
		var lookrange = cdef["lookrange"] || 10; //max deviation of the lookat position from this axis
		var notilt = cdef["notilt"] || 0; //deviation of cam position that doesn't tilt
		var lookoff = cdef["lookat"] || [0, 0.8, 0];
		
		var zmax = cdef["zmax"] || 1000;
		var zmin = cdef["zmin"] || -1000;
		
		return function(delta) {
			if (player.avatar_node.position.x < xaxis + notilt 
				&& player.avatar_node.position.x > xaxis - notilt) 
			{
				camRoot.position.x = player.avatar_node.position.x;
				camRoot.position.y = player.avatar_node.position.y;
				camRoot.position.z = Math.max(zmin, Math.min(zmax, player.avatar_node.position.z));
			}
			else
			{
				var baseaxis = (player.avatar_node.position.x > xaxis)? xaxis+notilt : xaxis-notilt;
				var offpercent = (player.avatar_node.position.x - baseaxis) / lookrange;
				
				camRoot.position.x = baseaxis + (offpercent * dev);
				camRoot.position.y = player.avatar_node.position.y;
				camRoot.position.z = Math.max(zmin, Math.min(zmax, player.avatar_node.position.z));
				
				var lx = camRoot.position.x - player.avatar_node.position.x + lookoff[0];
				var ly = camRoot.position.y - player.avatar_node.position.y + lookoff[1];
				var lz = camRoot.position.z - player.avatar_node.position.z + lookoff[2];
				came.lookAt(new THREE.Vector3(-lx, ly, lz));
			}
		};
	},
	
	// Follow along an axis, tilt the opposite direction the player has gone
	softFollowZTiltOpposite: function(cdef, came, camRoot) {
		var xaxis = cdef["xaxis"] || 0; //axis along which to keep the camera
		var dev = cdef["dev"] || 5; //max deviation of the cam position from this axis
		var lookrange = cdef["lookrange"] || 10; //max deviation of the lookat position from this axis
		var lookoff = cdef["lookat"] || [0, 0.8, 0];
		
		var zmax = cdef["zmax"] || 1000;
		var zmin = cdef["zmin"] || -1000;
		
		return function(delta) {
			var offpercent = (player.avatar_node.position.x - xaxis) / lookrange;
			
			camRoot.position.x = xaxis - (offpercent * dev);
			camRoot.position.y = player.avatar_node.position.y;
			camRoot.position.z = Math.max(zmin, Math.min(zmax, player.avatar_node.position.z));
			
			var lx = camRoot.position.x - player.avatar_node.position.x + lookoff[0];
			var ly = camRoot.position.y - player.avatar_node.position.y + lookoff[1];
			var lz = camRoot.position.z - player.avatar_node.position.z + lookoff[2];
			came.lookAt(new THREE.Vector3(-lx, ly, lz));
		};
	},
};

function setupCameras(map, camlist) {
	var scrWidth = $("#gamescreen").width();
	var scrHeight = $("#gamescreen").height();
	
	var node = new THREE.Object3D();
	node.name = "Camera Rig";

	for (var cname in camlist) {
		var c;
		
		if (camlist[cname].type == "ortho") {
			c = new THREE.OrthographicCamera(
				scrWidth/-2, scrWidth/2, scrHeight/2, scrHeight/-2, 0.1, 150);
			
			var cp = camlist[cname].position || [0, 100, 0];
			c.position.set(cp[0], cp[1], cp[2]);
			
			c.roation.x = -Math.PI / 2; //TODO lookAt?
			
		} else {
			c = new THREE.PerspectiveCamera(
					camlist[cname].fov || 55, 
					scrWidth / scrHeight, 
					camlist[cname].near || 0.1, 
					camlist[cname].far || 150);
			
			var cp = camlist[cname].position || [0, 5.45, 5.3];
			c.position.set(cp[0], cp[1], cp[2]);
			
			if (camlist[cname].rotation) {
				var cl = camlist[cname].rotation || [-45, 0, 0];
				cl[0] *= Math.PI / 180;
				cl[1] *= Math.PI / 180;
				cl[2] *= Math.PI / 180;
				c.rotation.set(cl[0], cl[1], cl[2]);
			} else {
				var cl = camlist[cname].lookat || [0, 0.8, 0];
				c.lookAt(new THREE.Vector3(cl[0], cl[1], cl[2]));
			}
		}
		
		c.name = "Camera ["+cname+"]";
		c.my_camera = c;
		
		var croot;
		if (!camlist[cname].fixedCamera) {
			croot = new THREE.Object3D();
			croot.add(c);
			croot.my_camera = c;
		}
		
		var cb = camlist[cname].behavior || "followPlayer";
		if (!camBehaviors[cb]) {
			console.error("Invalid Camera Behavior Defined! ", cb);
			cb = "followPlayer";
		}
		var cb = camBehaviors[cb].call(map, camlist[cname], c, croot);
		if (cb) {
			map.cameraLogics.push(cb);
		}
		
		node.add(croot || c);
		map.cameras[cname] = c;
		if (cname == 0) map.camera = c;
	}
	
	if (!map.camera) throw new Error("No cameras defined!");
	
	return node;
}


