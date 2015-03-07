// mapview.js

//var THREE = require("three");
//var $ = require("jquery");
//var zip = zip.js

var inherits = require("inherits");
var extend = require("extend");
var ndarray = require("ndarray");

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
	
	$("#hidebtn").on("click", function(){
		_infoParent.visible = !_infoParent.visible;
		$("#hidebtn").text(_infoParent.visible? "Hide Info" : "Show Info");
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
	
	DEBUG.updateFns = [];
	
	DEBUG.runOnMapReady = function(){
		var scrWidth = $("#gamescreen").width();
		var scrHeight = $("#gamescreen").height();
		
		createInfoParent();
		
		var camNode = new THREE.Object3D();
		camNode.name = "DEBUG Camera Helpers";
		camNode.visible = false;
		_infoParent.add(camNode);
		
		currentMap.__origCamera = currentMap.camera;
		currentMap.__debugCamera = new THREE.PerspectiveCamera(75, scrWidth / scrHeight, 1, 1000);
		// currentMap.camera = currentMap.__debugCamera;
		currentMap.__debugCamera.position.z = 10;
		
		DEBUG.switchDebugCamera = function() {
			if (currentMap.camera == currentMap.__debugCamera) {
				currentMap.camera = currentMap.__origCamera;
				camNode.visible = false;
			} else {
				currentMap.__origCamera = currentMap.camera;
				currentMap.camera = currentMap.__debugCamera;
				camNode.visible = true;
			}
		}
		$(document).on("keyup", function(e){ 
			if (e.which == 192) {
				DEBUG.switchDebugCamera();
			}
		});
		
		var controls = new THREE.OrbitControls(currentMap.__debugCamera);
		controls.damping = 0.2;
		DEBUG.updateFns.push(controls);
		
		for (var cam in currentMap.cameras) {
			var helper = new THREE.CameraHelper(currentMap.cameras[cam]);
			camNode.add(helper);
			DEBUG.updateFns.push(helper);
		}
		
		var map = currentMap;
		var oldlogic = map.logicLoop;
		map.logicLoop = function(delta){
			for (var i = 0; i < DEBUG.updateFns.length; i++) {
				if (!DEBUG.updateFns[i]) continue;
				if (!DEBUG.updateFns[i].update) continue;
				DEBUG.updateFns[i].update();
			}
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
		};
		DEBUG._infoParent = _infoParent;
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
		//Shortcut Aliases
		var V3 = THREE.Vector3;
		var V2 = THREE.Vector2;
		var F3 = THREE.Face3;
		
		_node_heightGrid = new THREE.Object3D();
		_node_heightGrid.name = "DEBUG Height Grid";
		
		createInfoParent();
		
		var map = currentMap;
		var mdata = currentMap.metadata;
		
		var tex = THREE.ImageUtils.loadTexture( BASEURL+"/img/ui/debug_counters.png" );
		tex.repeat.set(16/128, 16/32);
		tex.magFilter = THREE.NearestFilter;
		tex.minFilter = THREE.NearestFilter;
		
		var offsets = [];
		for (var y = 0; y < mdata.height; y++) {
			for (var x = 0; x < mdata.width; x++) {
				//One for each vertex
				offsets.push(new V2(), new V2(), new V2(), new V2());
			}
		}
		offsets = ndarray(offsets, [mdata.width, mdata.height, 4], [4, mdata.width*4, 1]);
		DEBUG.offsets = offsets;
		var updateAttrs = [];
		
		for (var li = 1; li <= 7; li++) {
			if (!mdata.layers[li-1]) continue;
			
			var geom = new THREE.Geometry();
			
			function __drawMark(x, y) {
				var v1 = map.get3DTileLocation(x, y, li);
				var v2 = new V3();
				var vts = geom.vertices;
				
				var a = new V3(v1.x + 0.15 + (li*0.02), v1.y, v1.z + 0.15 + (li*0.02));
				var b = new V3(v1.x - 0.15 + (li*0.02), v1.y, v1.z + 0.15 + (li*0.02));
				var c = new V3(v1.x - 0.15 + (li*0.02), v1.y, v1.z - 0.15 + (li*0.02));
				var d = new V3(v1.x + 0.15 + (li*0.02), v1.y, v1.z - 0.15 + (li*0.02));
				
				// geom.vertices.push(a, b, b, c, c, d, d, a);
				var idx = geom.vertices.length;
				geom.vertices.push(a, b, c, d);
				geom.faces.push(new F3(idx + 0, idx + 3, idx + 2)); 
				geom.faces.push(new F3(idx + 2, idx + 1, idx + 0)); 
				geom.faceVertexUvs[0].push([ new V2(1, 0), new V2(1, 1), new V2(0, 1) ]);
				geom.faceVertexUvs[0].push([ new V2(0, 1), new V2(0, 0), new V2(1, 0) ]);
			}
			
			for (var y = 0; y < mdata.height; y++) {
				for (var x = 0; x < mdata.width; x++) {
					__drawMark(x, y);
				}
			}
			
			var mat = new EventCounterMaterial({
				map: tex,
				offsets: offsets.data,
			});
			updateAttrs.push(mat.attributes.offsets);
			
			var mesh = new THREE.Mesh(geom, mat);
			_node_heightGrid.add(mesh);
		}
		
		_node_heightGrid.position.y = 0.01;
		
		_infoParent.add(_node_heightGrid);
		
		DEBUG.updateFns.push({
			update: function() {
				
				for (var y = 0; y < mdata.height; y++) {
					for (var x = 0; x < mdata.width; x++) {
						var e = map.eventMap.get(x, y);
						var num = Math.min((!e) ? 0 : e.length, 15);
						
						var offx = (Math.floor(num % 8) * 16) / 128;
						var offy = (Math.floor(num / 8) * 16) / 32;
						
						for (var i = 0; i < 4; i++) {
							offsets.get(x, y, i).set(offx, offy);
						}
					}
				}
				for (var i = 0; i < updateAttrs.length; i++) {
					updateAttrs[i].needsUpdate = true;
				}
			}
		});
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


/////////////////////////////////////////////////////////////////////////////////


function EventCounterMaterial(texture, opts) {
	if ($.isPlainObject(texture) && opts === undefined) {
		opts = texture; texture = null;
	}
	
	this.map = texture || opts.texture || opts.map || new THREE.Texture();
	this.offsets = opts.offsets || [];
	this.repeat = opts.repeat || this.map.repeat;
	
	var params = this._createMatParams(opts);
	THREE.ShaderMaterial.call(this, params);
	this.type = "EventCounterMaterial";
	
	this.transparent = (opts.transparent !== undefined)? opts.transparent : true;
	this.alphaTest = 0.05;
}
inherits(EventCounterMaterial, THREE.ShaderMaterial);
extend(EventCounterMaterial.prototype, {
	map : null,
	
	_createMatParams : function() {
		var params = {
			attributes: {
				offsets:	{ type: 'v2', value: this.offsets },
			},
			
			uniforms : {
				repeat:     { type: 'v2', value: this.repeat },
				map:		{ type: "t", value: this.map },
			},
		};
		
		params.vertexShader = this._vertShader;
		params.fragmentShader = this._fragShader;
		return params;
	},
	
	_vertShader: [
		"uniform float size;",
		"uniform float scale;",
		"uniform vec2 repeat;",
	
		"attribute vec2 offsets;",
		
		'varying vec2 vUV;',
		
		"void main() {",
			'vUV = offsets + uv * repeat;',
			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

			"gl_Position = projectionMatrix * mvPosition;",
		"}",
	].join("\n"),
	
	_fragShader: [
		"uniform sampler2D map;",
		
		'varying vec2 vUV;',
		
		"void main() {",
			"vec4 tex = texture2D( map, vUV );",
			
			'#ifdef ALPHATEST',
				'if ( tex.a < ALPHATEST ) discard;',
			'#endif',
			
			"gl_FragColor = tex;",
		"}",
	].join("\n"),
	
});


