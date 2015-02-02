// dungeon-map.js
// Definition of the Dorito Dungeon

var inherits = require("inherits");
var extend = require("extend");

var Map = require("../map.js");


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
			width: 10,
			height: 20,
			
			"layers" : [
				{"layer": 1, "3d": [1, 0, 0, 0.5,   0, 1, 0, 0,   0, 0, 1, -0.5,   0, 0, 0, 1], "2d": [5, 10] },
			],
			"warps" : [
				{ "loc" : [5, 10], "anim" : 0 },
			],
		}
		
		var model = new THREE.Object3D();
		for (var i = 1; i < 10; i++) { // Dorito BG
			
			var geom = new THREE.Geometry();
			this.gc.collect(geom);
			for ( i = 0; i < 30; i ++ ) {
				var vertex = new THREE.Vector3();
				vertex.x = Math.random() * 200 - 100;
				vertex.y = Math.random() * -50 - 2;
				vertex.z = Math.random() * 200 - 100;

				geometry.vertices.push( vertex );
			}
			
			var mat = new THREE.PointCloudMaterial({
				size: i/5, transparent: true,
			});
			
			var cloud = new THREE.PointCloud(geom, mat);
			model.add(cloude);
		}
		
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
				"camera" : {
					"type" : "gen4",
					"cameras": {}
				}
			})
		);
		
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
