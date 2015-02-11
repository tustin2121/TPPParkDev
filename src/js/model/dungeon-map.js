// dungeon-map.js
// Definition of the Dorito Dungeon

// &#9660; &#9668; &#9650; &#9658; &#9660; &#9668; &#9650; &#9658; &#9660; &#9668; &#9650; &#9658; &#9660; &#9668; &#9650; &#9658; &#9660; &#9668; &#9650; &#9660; &#9668; &#9650; &#9658; &#9660; &#9668; &#9650; &#9658; &#9660; &#9668; &#9660; &#9668; &#9650; &#9658; &#9660; &#9668; &#9650;
// ▼ ◄ ▲ ► ▼ ◄ ▲ ► ▼ ◄ ▲ ► ▼ ◄ ▲ ► ▼ ◄ ▲ ▼ ◄ ▲ ► ▼ ◄ ▲ ► ▼ ◄ ▼ ◄ ▲ ► ▼ ◄ ▲

var inherits = require("inherits");
var extend = require("extend");

var Map = require("../map.js");
var PlayerChar = require("tpp-pc");
var mSetup = require("./map-setup");


function DoritoDungeon() {
	Map.call(this, "xDungeon");
}
inherits(DoritoDungeon, Map);
extend(DoritoDungeon.prototype, {
	// Override to do nothing
	download: function() {}, 
	
	// Load model into the mapmodel property
	load: function() {
		this.markLoading("MAP_mapdata");
		
		this.metadata = {
			areaname : "The Dorito Dungeon",
			width: 50,
			height: 50,
			
			"layers" : [
				{"layer": 1, "3d": [1, 0, 0, -25.5,   0, 1, 0, 0,   0, 0, 1, -25.5,   0, 0, 0, 1], "2d": [5, 10] },
			],
			"warps" : [
				{ "loc" : [25, 25], "anim" : 0 },
			],
			
			// clearColor: 0x000000,
		};
		
		this.tiledata = {
			get: function(){ return 0; },
		}
		
		var doritodefs = [
			[5, 0], [5, 1], [5, 2], [5, 3],
			[6, 0], [6, 1], [6, 2], [6, 3],
			[7, 0], [7, 1], [7, 2], [7, 3],
		];
		
		var model = new THREE.Object3D();
		{ // Dorito BG
			var offsets = [];
			var geom = new THREE.Geometry();
			this.gc.collect(geom);
			for (var k = 0; k < 50 * doritodefs.length; k ++ ) {
				var vertex = new THREE.Vector3();
				vertex.x = Math.random() * 200 - 100;
				vertex.y = Math.random() * -50 - 1;
				vertex.z = Math.random() * 200 - 180;

				geom.vertices.push( vertex );
				
				var di = Math.floor(Math.random() * doritodefs.length);
				offsets.push(new THREE.Vector2(
					(doritodefs[di][0] * 16) / 128, 
					(doritodefs[di][1] * 16) / 64));
			}
			
			var tex = new THREE.Texture(AJAX_TEXTURE_IMG);
			tex.magFilter = THREE.NearestFilter;
			tex.minFilter = THREE.NearestFilter;
			tex.wrapS = THREE.RepeatWrapping;
			tex.wrapT = THREE.RepeatWrapping;
			tex.repeat = new THREE.Vector2(16/128, 16/64);
			// tex.offset = new THREE.Vector2(
			// 	(doritodefs[i][0] * 16) / 128,
			// 	(doritodefs[i][1] * 16) / 64);
			tex.generateMipmaps = false;
			tex.needsUpdate = true;
			
			// var mat = new THREE.PointCloudMaterial({
			// 	size: Math.random()*2+1, transparent: true,
			// 	map: tex,
			// });
			
			var mat = new DoritoCloudMaterial({
				map: tex, size: 10, scale: 100,
				offsets: offsets,
			});
			
			var cloud = new THREE.PointCloud(geom, mat);
			cloud.sortParticles = true
			model.add(cloud);
		}{
			var height = 60;
			
			var geom = new THREE.CylinderGeometry(400, 50, height);
			// for (var i = 0; i < geom.vertices.length; i++) {
			// 	var c = (geom.vertices[i].y + (height/2)) / height;
			// 	geom.colors.push(new THREE.Color( c, c * 0.5, 0 ));
			// }
			var faceidx = ['a', 'b', 'c'];
			for (var i = 0; i < geom.faces.length; i++) {
				var face = geom.faces[i];
				for (var j = 0; j < faceidx.length; j++) {
					var vert = geom.vertices[ face[faceidx[j]] ];
					
					var c = (vert.y + (height/2)) / height;
					face.vertexColors[j] = new THREE.Color(c, c * 0.5, 0);
				}
			}
			
			console.log(geom.colors);
			geom.colorsNeedUpdate = true;
			
			var mat = new THREE.MeshBasicMaterial({
				side: THREE.BackSide,
				vertexColors: THREE.VertexColors,
				depthWrite: false,
			});
			
			var bg = new THREE.Mesh(geom, mat);
			bg.renderDepth = 10;
			bg.position.y = -50;
			model.add(bg);
		}
		this.mapmodel = model;
		
		this._init();
		this.markLoadFinished("MAP_mapdata");
	},
	
	_init : function(){
		var self = this;
		this.scene = new THREE.Scene();
		this.cameras = {};
		
		if (!window.player) {
			window.player = new PlayerChar();
		}
		
		this.scene.add(this.mapmodel);
		
		this.cameraLogics = [];
		// mSetup.setupRigging.call(this);
		//NOTE: No lights
		
		this.scene.add(
			mSetup.camera.gen4.call(this, {
				"type" : "gen4",
				"cameras": {
					0: {},
				}
			})
		);
		
		this.queueForMapStart(function() {
			SoundManager.playMusic("m_tornworld");
			UI.skrim.speed = 0.2; //This will override the speed of the fadein done by the map manager.
			// UI.fadeOut(0.2);
		});
		
		threeRenderer.setClearColorHex( 0x000000 );
		
		// Map Model is now ready
		
		this._initEventMap();
		
		this.emit("map-ready");
		
	},
	
	__loadScript : function(t) {
		if (t != "l") return; //Local only
		
		// Add local events
		//TODO Add Gmann here to take you back to the main world
	},
	
	canWalkBetween : function(srcx, srcy, destx, desty, ignoreEvents) {
		if (Math.abs(srcx - destx) + Math.abs(srcy - desty) != 1) return false;
		
		if (destx < 0 || destx >= this.metadata.width) return false;
		if (desty < 0 || desty >= this.metadata.height) return false;
		
		if (!ignoreEvents) { //check for the presense of events
			var evts = this.eventMap.get(destx, desty);
			if (evts) {
				for (var i = 0; i < evts.length; i++) {
					if (!evts[i].canWalkOn()) return false;
				}
			}
		}
		
		return true;
	},
});

module.exports = DoritoDungeon;


function DoritoCloudMaterial(texture, opts) {
	if ($.isPlainObject(texture) && opts === undefined) {
		opts = texture; texture = null;
	}
	
	this.map = texture || opts.texture || opts.map || new THREE.Texture();
	this.offsets = opts.offsets || [];
	this.repeat = opts.repeat || this.map.repeat;
	
	this.size = opts.size || 1;
	this.scale = opts.scale || 1;
	
	var params = this._createMatParams(opts);
	THREE.ShaderMaterial.call(this, params);
	this.type = "DoritoCloudMaterial";
	
	this.transparent = (opts.transparent !== undefined)? opts.transparent : true;
	this.alphaTest = 0.05;
}
inherits(DoritoCloudMaterial, THREE.ShaderMaterial);
extend(DoritoCloudMaterial.prototype, {
	map : null,
	
	_createMatParams : function() {
		var params = {
			attributes: {
				offset:		{ type: 'v2', value: this.offsets },
			},
			
			uniforms : {
				repeat:     { type: 'v2', value: this.repeat },
				map:		{ type: "t", value: this.map },
				
				size:		{ type: "f", value: this.size },
				scale:		{ type: "f", value: this.scale },
			},
		};
		
		params.vertexShader = this._vertShader;
		params.fragmentShader = this._fragShader;
		return params;
	},
	
	_vertShader: [
		"uniform float size;",
		"uniform float scale;",
	
		"attribute vec2 offset;",
		
		"varying vec2 vOffset;",
		
		"void main() {",
			"vOffset = offset;",
			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

			"gl_PointSize = size * ( scale / length( mvPosition.xyz ) );",
			"gl_Position = projectionMatrix * mvPosition;",
		"}",
	].join("\n"),
	
	_fragShader: [
		"uniform sampler2D map;",
		"uniform vec2 repeat;",
		
		"varying vec2 vOffset;",
		
		"void main() {",
			"vec2 uv = vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y );",
			"vec4 tex = texture2D( map, uv * repeat + vOffset );",
			
			'#ifdef ALPHATEST',
				'if ( tex.a < ALPHATEST ) discard;',
			'#endif',
			
			"gl_FragColor = tex;",
		"}",
	].join("\n"),
	
});