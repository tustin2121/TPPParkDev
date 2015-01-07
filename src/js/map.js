// map.js

var inherits = require("inherits");
var extend = require("extend");
var ndarray = require("ndarray");
var Event = require("tpp-event");
var EventEmitter = require("events").EventEmitter;
//var zip = zip.js

var ObjLoader = require("./model/obj-loader");

// The currently loaded zip file system
var EXT_MAPBUNDLE = ".zip";


// These would be CONSTs if we weren't in the browser
var DEF_HEIGHT_STEP = 0.5; //Default Y translation amount a height step takes. This can be defined in a map file.


// If you make any changes here, make sure to mirror them in build/map-zipper.js!
function convertShortToTileProps(val) {
	// TileData: MMMMLW00 TTTHHHHH
	// Where:
	//    M = Movement, Bits are: (Down, Up, Left, Right)
	//    L = Ledge bit (this tile is a ledge: you jump over it when given permission to enter it)
	//    W = Water bit (this tile is water: most actors are denied entry onto this tile)
	//    H = Height (vertical location of the center of this tile)
	//    T = Transition Tile (transition to another Layer when stepping on this tile)
	var props = {};
	
	var movement = ((val >> 12) & 0xF);
	// movement is blocked if a movement flag is true:
	props.movement = {};
	props.movement["down"]  = !!(movement & 0x8);
	props.movement["up"]    = !!(movement & 0x4);
	props.movement["left"]  = !!(movement & 0x2);
	props.movement["right"] = !!(movement & 0x1);
	
	props.isWalkable = !!(~movement & 0xF);
	props.isLedge = !!(val & (0x1 << 11));
	props.isWater = !!(val & (0x1 << 10));
	
	props.transition = ((val >> 5) & 0x7);
	
	props.height = ((val) & 0x1F);
	
	return props;
}



/**
 *
 *
 *
 *
 */
function Map(id, opts){
	this.id = id;
	extend(this, opts);
	
	this.fileSys = new zip.fs.FS();
}
inherits(Map, EventEmitter);
extend(Map.prototype, {
	id : null, //map's internal id
	
	file: null, //Zip file holding all data
	fileSys: null, //Current zip file system for this map
	xhr: null, //active xhr request
	
	metadata : null,
	objdata : null,
	mtldata : null,
	
	lScriptTag : null,
	gScriptTag : null,
	
	mapmodel: null,
	camera : null,
	scene : null,
	spriteNode : null,
	
	///////////////////////////////////////////////////////////////////////////////////////
	// Load Management 
	///////////////////////////////////////////////////////////////////////////////////////
	
	dispose : function(){
		$(this.lScriptTag).remove();
		$(this.gScriptTag).remove();
		
		delete this.file;
		delete this.fileSys;
		delete this.xhr;
		
		delete this.metadata;
		delete this.objdata;
		delete this.mtldata;
		
		delete this.lScriptTag;
		delete this.gScriptTag;
		
		delete this.tiledata;
		
		delete this.mapmodel;
		delete this.camera;
		delete this.scene;
	},
	
	/** Begin download of this map's zip file, preloading the data. */
	download : function(){
		if (this.file) return; //we have the file in memory already, do nothing
		if (this.xhr) return; //already got an active request, do nothing
		
		var self = this;
		var xhr = this.xhr = new XMLHttpRequest();
		xhr.open("GET", "/maps/"+this.id+EXT_MAPBUNDLE);
		console.log("XHR: ", xhr);
		xhr.responseType = "blob";
		xhr.on("load", function(e) {
			console.log("LOAD:", e);
			self.file = xhr.response;
			self.emit("downloaded");
		});
		xhr.on("progress", function(e){
			console.log("PROGRESS:", e);
			if (e.lengthComputable) {
				var percentDone = e.loaded / e.total;
			} else {
				//marquee bar
			}
		});
		xhr.on("error", function(e){
			console.log("ERROR:", e);
		});
		xhr.on("canceled", function(e){
			console.log("CANCELED:", e);
		});
		//TODO on error and on canceled
		
		xhr.send();
	},
	
	/**
	 *  Reads the tile data and begins loading the required resources.
	 */
	load : function(){
		var self = this;
		if (!this.file) { //If file isn't downloaded yet, defer loading
			this.once("downloaded", function(){
				self.load();
			});
			this.download();
			//TODO throw up loading gif
			return;
		}
		
		this.fileSys.importBlob(this.file, function success(){
			//TODO load up the map!
			self.fileSys.root.getChildByName("map.json").getText(__jsonLoaded, __logProgress);
			self.fileSys.root.getChildByName("map.obj").getText(__objLoaded, __logProgress);
			self.fileSys.root.getChildByName("map.mtl").getText(__mtlLoaded, __logProgress);
			//TODO load event bundles
			
		}, function error(e){
			console.log("ERROR: ", e);
			self.emit("load-error"); //Send to the dorito dungeon
		});
		return; 
		
		function __logProgress() {
			console.log("PROGRESS", arguments);
		}
		//Callback chain below
		function __jsonLoaded(data) {
			self.metadata = JSON.parse(data);
			
			self.tiledata = ndarray(self.metadata.map, [self.metadata.width, self.metadata.height], [1, self.metadata.width]);
			if (self.metadata["heightstep"] === undefined) {
				self.metadata["heightstep"] = DEF_HEIGHT_STEP;
			}
			
			self.emit("loaded-meta");
			__loadDone();
		}
		
		function __objLoaded(data) {
			self.objdata = data;
			__modelLoaded();
		}
		function __mtlLoaded(data) {
			self.mtldata = data;
			__modelLoaded();
		}
		function __modelLoaded() {
			if (!self.objdata || !self.mtldata) return; //don't begin parsing until they're both loaded
			
			function loadTexture(filename, callback) {
				console.log("LOAD TEX:", filename);
				var file = self.fileSys.root.getChildByName(filename);
				if (!file) {
					console.error("ERROR LOADING TEXTURE: No such file in map bundle! "+filename);
					callback(DEF_TEXTURE);
					return;
				}
				file.getBlob("image/png", function(data) {
					console.log("TEX LOADED:", filename, data);
					callback(URL.createObjectURL(data));
				});
			}
			
			var objldr = new ObjLoader(self.objdata, self.mtldata, loadTexture);
			objldr.on("load", __modelReady);
			objldr.load();
		}
		
		function __modelReady(obj) {
			console.log("__modelReady");
			self.mapmodel = obj;
			self.emit("loaded-model");
			__loadDone();
		}
		
		function __loadDone() {
			if (!self.mapmodel || !self.tiledata) return; //don't call on _init before both are loaded
			
			self._init();
		}
	},
	
	/**
	 * Creates the map for display from the stored data.
	 */
	_init : function(){
		this.scene = new THREE.Scene();
		
		//TODO create player character
		
		var scrWidth = $("#gamescreen").width();
		var scrHeight = $("#gamescreen").height();
		// For camera types, see the Camera types wiki page
		switch(this.metadata.camera.type) {
			case "ortho":
				this.camera = new THREE.OrthographicCamera(scrWidth/-2, scrWidth/2, scrHeight/2, scrHeight/-2, 1, 1000);
				this.camera.position.y = 100;
				this.camera.roation.x = -Math.PI / 2;
				break;
			case "gen4":
				this.camera = new THREE.PerspectiveCamera(75, scrWidth / scrHeight, 1, 1000);
				this.camera.position.y = 5;
				this.camera.position.z = -5;
				this.camera.rotation.x = -55 * (Math.PI / 180);
				
				break;
			case "gen5":
				this.camera = new THREE.PerspectiveCamera(75, scrWidth / scrHeight, 1, 1000);
				break;
		}
		this.scene.add(this.camera);
		
		light = new THREE.DirectionalLight(0xffffff, 0.5);
		light.position.set(1, 1, 1);
		this.scene.add(light);
		
		light = new THREE.DirectionalLight(0xffffff, 0.5);
		light.position.set(-1, 1, 1);
		this.scene.add(light);
		
		this.scene.add(this.mapmodel);
		// Map Model is now ready
		
		this._initEventMap();
		
		
		this.emit("map-ready");
	},
	
	
	///////////////////////////////////////////////////////////////////////////////////////
	// Tile Information 
	///////////////////////////////////////////////////////////////////////////////////////
	
	tiledata : null,
	
	getTileData : function(x, y) {
		var tile = convertShortToTileProps(this.tiledata.get(x, y));
		return tile;
	},
	
	get3DTileLocation : function(x, y, layer, tiledata) {
		if (x instanceof THREE.Vector2) {
			y = x.y; x = x.x;
		}
		if (x instanceof THREE.Vector3) {
			layer = x.z; y = x.y; x = x.x;
		}
		layer = (layer || 1) - 1;
		if (!tiledata) tiledata = this.getTileData(x, y);
		
		var layerdata = this.metadata.layers[layer];
		var z = tiledata.height * this.metadata.heightstep;
		
		var loc = new THREE.Vector3(x, z, y);
		loc.x -= layerdata["2d"][0];
		loc.z -= layerdata["2d"][1];
		
		var mat = new THREE.Matrix4();
		mat.set.apply(mat, layerdata["3d"]);
		loc.applyMatrix4(mat);
		
		return loc;
	},
	
	getAllWalkableTiles : function() {
		var tiles = [];
		for (var li = 1; li <= 7; li++) {
			if (!this.metadata.layers[li-1]) continue;
			tiles[li] = [];
			
			for (var y = 0; y < this.metadata.height; y++) {
				for (var x = 0; x < this.metadata.width; x++) {
					var tdata = this.getTileData(x, y);
					if (!tdata.isWalkable) continue;
					
					tdata["3dloc"] = this.get3DTileLocation(x, y, li, tdata);
					
					tiles[li].push(tdata);
				}
			}
		}
		return tiles;
	},
	
	/**
	 * canWalkBetween: If it is possible to walk from one tile to another. The two
	 * 		tiles must be adjacent, or false is immedeately returned.
	 * returns:
	 * 		false = cannot, 1 = can, 2 = must jump, 4 = must swim/surf
	 */
	canWalkBetween : function(srcx, srcy, destx, desty, ignoreEvents){
		if (Math.abs(srcx - destx) + Math.abs(srcy - desty) != 1) return false;
		
		// If we're somehow already outside the map, unconditionally allow them to walk around to get back in
		if (srcx < 0 || srcx >= this.metadata.width) return true;
		if (srcy < 0 || srcy >= this.metadata.height) return true;
		
		// Sanity check edges of the map
		if (destx < 0 || destx >= this.metadata.width) return false;
		if (desty < 0 || desty >= this.metadata.height) return false;
		
		var srctile = this.getTileData(srcx, srcy);
		var desttile = this.getTileData(destx, desty);
		
		if (!desttile.isWalkable) return false;
		
		if (!ignoreEvents) { //check for the presense of events
			var evts = this.eventMap.get(destx, desty);
			if (evts) {
				for (var i = 0; i < evts.length; i++) {
					if (!evts[i].canWalkOn()) return false;
				}
			}
		}
		
		var canWalk = true; //Assume we can travel between until proven otherwise.
		var mustJump, mustSwim;
		
		var dir = (function(){
			switch (1) {
				case (srcy - desty): return ["up", "down"];
				case (desty - srcy): return ["down", "up"];
				case (srcx - destx): return ["left", "right"];
				case (destx - srcx): return ["right", "left"];
			} return null;
		})();
		
		if (srctile.movement[dir[0]]) { //if movement = true, means we can't walk there
			if (srctile.isLedge) 
				mustJump = true;
			else canWalk = false;
		}
		canWalk &= !desttile.movement[dir[1]];
		
		mustSwim = desttile.isWater;
		
		if (!canWalk) return false;
		return (canWalk?0x1:0) | (mustJump?0x2:0) | (mustSwim?0x4:0);
	},
	
	
	///////////////////////////////////////////////////////////////////////////////////////
	// Event Handling 
	///////////////////////////////////////////////////////////////////////////////////////
	
	_localId : 0,
	eventList : null,
	eventMap : null,
	
	_initEventMap : function() {
		var self = this;
		
		this.eventList = {};
		var w = this.metadata.width, h = this.metadata.height;
		this.eventMap = ndarray(new Array(w*h), [w, h], [1, w]);
		this.eventMap.put = function(x, y, val) {
			if (!this.get(x, y)) {
				this.set(x, y, []);
			}
			if (this.get(x, y).indexOf(val) >= 0) return; //don't double add
			this.get(x, y).push(val);
		};
		this.eventMap.remove = function(x, y, val) {
			if (!this.get(x, y)) return null;
			var i = this.get(x, y).indexOf(val);
			if (i == -1) return null;
			return this.get(x, y).splice(i, 1);
		};
		
		this.spriteNode = new THREE.Object3D();
		// this.spriteNode.position.y = 0.66;
		this.scene.add(this.spriteNode);
		
		// Load event js files now:
		loadScript("l"); // Load locally defined events
		loadScript("g"); // Load globally defined events
		
		return;
		
		function loadScript(t) {
			var file = self.fileSys.root.getChildByName(t+"_evt.js");
			if (!file) {
				console.error("ERROR LOADING EVENTS: No "+t+"_evt.js file is present in the map bundle.");
				return;
			}
			file.getBlob("text/javascript", function(data){
				// NOTE: We cannot use JQuery().append(), as it delibrately cleans the script tags
				//   out of the dom element we're appending, literally defeating the purpose.
				// NOTE2: We append to the DOM instead of using eval() or new Function() because
				//   when appended like so, the in-browserdebugger should be able to find it and
				//   breakpoint in it.
				var script = document.createElement("script");
				script.type = "text/javascript";
				script.src = URL.createObjectURL(data);
				document.body.appendChild(script);
				self[t+"ScriptTag"] = script;
				// Upon being added to the body, it is evaluated
			});
		}
		
	},
	
	addEvent : function(evt) {
		if (!evt) return;
		if (!(evt instanceof Event)) 
			throw new Error("Attempted to add an object that wasn't an Event! " + evt);
		
		if (!evt.shouldAppear()) return;
		if (!evt.id)
			evt.id = "LocalEvent_" + (++this._localId);
		
		var self = this;
		//now adding event to map
		this.eventList[evt.id] = evt;
		if (evt.location) {
			this.eventMap.put(evt.location.x, evt.location.y, evt);
		} else if (evt.locations) {
			for (var i = 0; i < evt.locations.length; i++) {
				var loc = evt.locations[i];
				this.eventMap.put(loc.x, loc.y, evt);
			}
		}
		
		//registering listeners on the event
		evt.on("moving", function(srcX, srcY, destX, destY){
			//Started moving to a new tile
			self.eventMap.put(destX, destY, this);
		});
		evt.on("moved", function(srcX, srcY, destX, destY){
			//Finished moving from the old tile
			self.eventMap.remove(srcX, srcY, this);
		});
		
		var avatar = evt.getAvatar(this);
		if (avatar) {
			var loc = evt.location;
			var loc3 = this.get3DTileLocation(loc.x, loc.y, loc.z);
			avatar.position.set(loc3);
			avatar.updateMatrix();
			
			this.spriteNode.add(avatar);
		}
		
		evt.emit("created");
	},
	
	loadSprite : function(evtid, filename, callback) {
		try {
			var dir = this.fileSys.root.getChildByName(evtid);
			if (!dir) {
				callback(("No subfolder for event id '"+evtid+"'!"));
				return;
			}
			
			var file = dir.getChildByName(filename);
			if (!file) {
				callback(("No asset with name '"+filename+"' for event id '"+evtid+"'!"));
				return;
			}
			
			file.getBlob("image/png", function(data){
				callback(null, URL.createObjectURL(data));
			});
		} catch (e) {
			callback(e);
		}
	},
	
	
	
	
	
	
	
	
	
	
	logicLoop : function(delta){
		if (this.eventList) {
			for (var name in this.eventList) {
				var evt = this.eventList[name];
				if (!evt) continue;
				
				evt.emit("tick", delta);
			}
		}
	},
});
module.exports = Map;


