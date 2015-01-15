// mapview.js

//var THREE = require("three");
//var $ = require("jquery");
//var zip = zip.js

require("../polyfill.js");
var Map = require("../map");
var renderLoop = require("../model/renderloop");

require("../globals");

console.log(COMPILED_MAPS);

//On Ready
$(function(){
	
	$("#loadbtn").on("click", function(){
		loadMap($("#idin").val());
		$("#loadbtn").blur();
	});
	
	renderLoop.start({
		clearColor : 0xFF0000,
		ticksPerSecond : 30,
	});
	
	var datalist = $("<datalist id='compiledMaps'>");
	for (var i = 0; i < COMPILED_MAPS.length; i++) {
		datalist.append($("<option>").text(COMPILED_MAPS[i]));
	}
	$("#idin").after(datalist);
	
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
		
		var map = currentMap;
		var oldlogic = map.logicLoop;
		map.logicLoop = function(delta){
			controls.update();
			oldlogic.call(map, delta);
		};
		
		// showWalkableTiles();
		showMovementGrid();
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

var _node_movementGrid;
function showMovementGrid() {
	if (!_node_movementGrid) {
		_node_movementGrid = new THREE.Object3D();
		
		createInfoParent();
		
		//CONST
		var markerColors = [ 0x888888, 0x008800, 0x000088, 0x880000, 0x008888, 0x880088, 0x888800 ];
		
		var map = currentMap;
		var mdata = currentMap.metadata;
		
		for (var li = 1; li <= 7; li++) {
			if (!mdata.layers[li-1]) continue;
			
			var geom = new THREE.Geometry();
			var jumps = [];
			
			function __drawLine(sx, sy, dx, dy) {
				var mv = map.canWalkBetween(sx, sy, dx, dy);
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
