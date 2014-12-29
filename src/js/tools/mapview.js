// mapview.js

//var THREE = require("three");
//var $ = require("jquery");
//var zip = zip.js

require("../polyfill.js");
var Map = require("../map");
var renderLoop = require("../model/renderloop");

window.currentMap = null;

//On Ready
$(function(){
	
	$("#loadbtn").on("click", function(){
		loadMap($("#idin").val());
	});
	
	renderLoop.start({
		clearColor : 0xFF0000,
		ticksPerSecond : 30,
	});
	
});

function loadMap(id) {
	if (currentMap) {
		currentMap.dispose();
		_infoParent = null;
		_stored_walkableTiles = null;
	}
	
	currentMap = new Map(id);
	currentMap.load();
	
	currentMap.once("map-ready", function(){
		var scrWidth = $("#gamescreen").width();
		var scrHeight = $("#gamescreen").height();
		
		currentMap.camera = new THREE.PerspectiveCamera(75, scrWidth / scrHeight, 1, 1000);
		currentMap.camera.position.z = 10;
		
		var controls = new THREE.OrbitControls(currentMap.camera);
		controls.damping = 0.2;
		
		var oldlogic = currentMap.logicLoop;
		currentMap.logicLoop = function(){
			controls.update();
			//oldlogic.call(currentMap);
		};
		
		showWalkableTiles();
	});
}

var _infoParent;
function createInfoParent() {
	if (!_infoParent) {
		_infoParent = new THREE.Object3D();
		currentMap.scene.add(_infoParent);
	}
}

var _stored_walkableTiles;
function showWalkableTiles() {
	var tiles = _stored_walkableTiles;
	if (!tiles) {
		tiles = currentMap.getAllWalkableTiles();
	}
	
	createInfoParent();
	//TODO cleat info parent
	
	//CONST
	var markerColors = [ 0x888888, 0x008800, 0x000088, 0x880000, 0x008888, 0x880088, 0x888800 ];
	
	for (var li = 0; li < tiles.length; li++) {
		if (!tiles[li]) {
			console.warn("Tiles for layer", li, "undefined!");
			continue;
		}
		
		var geom = new THREE.Geometry();
		for (var i = 0; i < tiles[li].length; i++) {
			geom.vertices.push(tiles[li][i]["3dloc"]);
		}
		
		var mat = new THREE.PointCloudMaterial({
			size: 1,
			// map: THREE.ImageUtils.loadTexture("/tools/tilemarker.png"),
			depthTest: true,
			transparent: true,
		});
		mat.color.setHex(markerColors[li]);
		
		var particles = new THREE.PointCloud(geom, mat);
		particles.sortParticles = true;
		_infoParent.add(particles);
	}
}
