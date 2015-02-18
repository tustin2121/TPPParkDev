// mapview.js

//var THREE = require("three");
//var $ = require("jquery");
//var zip = zip.js

require("../polyfill.js");
var Map = require("../map");
var renderLoop = require("../model/renderloop");

require("../globals");

var warp = require("tpp-warp");

var DoritoDungeon = require("../model/dungeon-map.js");

console.log(COMPILED_MAPS);

//On Ready
$(function(){
	
	$("#loadbtn").on("click", function(){
		loadMap($("#idin").val());
		$("#loadbtn").blur();
	});
	
	renderLoop.start({
		clearColor : 0xFF0000,
		ticksPerSecond : 20,
	});
	
	var datalist = $("<datalist id='compiledMaps'>");
	for (var i = 0; i < COMPILED_MAPS.length; i++) {
		datalist.append($("<option>").text(COMPILED_MAPS[i]));
	}
	$("#idin").after(datalist);
	
	
	DEBUG.runOnMapReady = function(){
		var scrWidth = $("#gamescreen").width();
		var scrHeight = $("#gamescreen").height();
		
		createInfoParent();
		
		currentMap.__origCamera = currentMap.camera;
		currentMap.__debugCamera = new THREE.PerspectiveCamera(75, scrWidth / scrHeight, 1, 1000);
		// currentMap.camera = currentMap.__debugCamera;
		currentMap.__debugCamera.position.z = 10;
		
		DEBUG.switchDebugCamera = function() {
			if (currentMap.camera == currentMap.__origCamera) {
				currentMap.camera = currentMap.__debugCamera;
			} else {
				currentMap.camera = currentMap.__origCamera;
			}
		}
		$(document).on("keyup", function(e){ 
			if (e.which == 192) {
				DEBUG.switchDebugCamera();
			}
		});
		
		var controls = new THREE.OrbitControls(currentMap.__debugCamera);
		controls.damping = 0.2;
		
		var helper = new THREE.CameraHelper(currentMap.__origCamera);
		_infoParent.add(helper);
		
		var map = currentMap;
		var oldlogic = map.logicLoop;
		map.logicLoop = function(delta){
			controls.update();
			helper.update();
			oldlogic.call(map, delta);
		};
		
		// showWalkableTiles();
		showMovementGrid();
		showHeightGrid();
	}; 
	
});

function loadMap(id) {
	if (currentMap) {
		currentMap.dispose();
		_infoParent = null;
		_node_movementGrid = null;
	}
	
	if (/^(dd|hell|[iex]doritodungeon)$/i.test(id)) {
		currentMap = new DoritoDungeon();
	} else {
		currentMap = new Map(id);
	}
	currentMap.queueForMapStart(function(){
		UI.fadeIn();
	});
	//*
	
	currentMap.once("map-ready", DEBUG.runOnMapReady);
	
	//*/
	
	currentMap.load();
}

var _infoParent;
function createInfoParent() {
	if (!_infoParent) {
		_infoParent = new THREE.Object3D();
		_infoParent.name = "DEBUG Info Rigging";
		currentMap.scene.add(_infoParent);
		
		DEBUG.hideInfoLayer = function() {
			_infoParent.visible = !_infoParent.visible;
		}
	}
}
/*
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
} */

var markerColors = [ 0x888888, 0x008800, 0x000088, 0x880000, 0x008888, 0x880088, 0x888800 ];


var _node_heightGrid;
function showHeightGrid() {
	if (!_node_heightGrid) {
		_node_heightGrid = new THREE.Object3D();
		_node_heightGrid.name = "DEBUG Height Grid";
		
		createInfoParent();
		
		var map = currentMap;
		var mdata = currentMap.metadata;
		
		for (var li = 1; li <= 7; li++) {
			if (!mdata.layers[li-1]) continue;
			
			var geom = new THREE.Geometry();
			
			function __drawMark(x, y) {
				var v1 = map.get3DTileLocation(x, y, li);
				var v2 = new THREE.Vector3();
				var vts = geom.vertices;
				
				var a = new THREE.Vector3(v1.x + 0.15 + (li*0.02), v1.y, v1.z + 0.15 + (li*0.02));
				var b = new THREE.Vector3(v1.x - 0.15 + (li*0.02), v1.y, v1.z + 0.15 + (li*0.02));
				var c = new THREE.Vector3(v1.x - 0.15 + (li*0.02), v1.y, v1.z - 0.15 + (li*0.02));
				var d = new THREE.Vector3(v1.x + 0.15 + (li*0.02), v1.y, v1.z - 0.15 + (li*0.02));
				
				geom.vertices.push(a, b, b, c, c, d, d, a);
			}
			
			for (var y = 0; y < mdata.height; y++) {
				for (var x = 0; x < mdata.width; x++) {
					__drawMark(x, y);
				}
			}
			
			
			var mat = new THREE.LineBasicMaterial({
				color: markerColors[li],
				opacity: 0.4,
				linewidth: 1,
			});
			var line = new THREE.Line(geom, mat, THREE.LinePieces);
			_node_heightGrid.add(line);
		}
		
		_node_heightGrid.position.y = 0.01;
		
		_infoParent.add(_node_heightGrid);
	}
}


var _node_movementGrid;
function showMovementGrid() {
	if (!_node_movementGrid) {
		_node_movementGrid = new THREE.Object3D();
		_node_movementGrid.name = "DEBUG Movement Grid";
		
		createInfoParent();
		
		var map = currentMap;
		var mdata = currentMap.metadata;
		
		for (var li = 1; li <= 7; li++) {
			if (!mdata.layers[li-1]) continue;
			
			var geom = new THREE.Geometry();
			var jumps = [];
			
			function __drawLine(sx, sy, dx, dy) {
				var mv = map.canWalkBetween(sx, sy, dx, dy, true); //ignore events
				if (!mv) return;
				
				var v1 = map.get3DTileLocation(sx, sy, li);
				var v2 = map.get3DTileLocation(dx, dy, li);
				
				if (mv & 0x2) {
					jumps.push([v1, v2]); //push for a spline later
					return;
				}
				
				v2.set((v1.x+v2.x)/2, (v1.y+v2.y)/2, (v1.z+v2.z)/2);
				
				geom.vertices.push(v1);
				geom.vertices.push(v2);
			}
			
			for (var y = 0; y < mdata.height; y++) {
				for (var x = 0; x < mdata.width; x++) {
					__drawLine(x, y, x+1, y);
					__drawLine(x, y, x-1, y);
					__drawLine(x, y, x, y+1);
					__drawLine(x, y, x, y-1);
				}
			}
			
			var mat = new THREE.LineBasicMaterial({
				color: markerColors[li],
				opacity: 0.8,
				linewidth: 1,
			});
			var line = new THREE.Line(geom, mat, THREE.LinePieces);
			_node_movementGrid.add(line);
			
			if (jumps.length) {
				for (var i = 0; i < jumps.length; i++) {
					var v1 = jumps[i][0];
					var v3 = jumps[i][1];
					var v2 = new THREE.Vector3((v1.x+v3.x)/2, Math.max(v1.y, v3.y)+0.4, (v1.z+v3.z)/2);
					
					var spline = new THREE.SplineCurve3([v1, v2, v3]);
					var geom = new THREE.Geometry();
					geom.vertices = spline.getPoints(7).slice(0, -1);
					
					var mat = new THREE.LineBasicMaterial({
						color: markerColors[li],
						opacity: 0.8,
						linewidth: 1,
					});
					var line = new THREE.Line(geom, mat);
					_node_movementGrid.add(line);
				}
			}
		}
		
		_node_movementGrid.position.y = 0.1;
		
		_infoParent.add(_node_movementGrid);
	}
	_node_movementGrid.visible = true;
}
