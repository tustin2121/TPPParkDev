// map.js

var inherits = require("inherits");
var extend = require("extend");
var EventEmitter = require("events").EventEmitter;
//var zip = zip.js

var ObjLoader = require("./modelloader/obj-loader");

// The currently loaded zip file system
var fileSys = new zip.fs.FS();
var controls;

function Map(id, opts){
	this.id = id;
	extend(this, opts);
}
inherits(Map, EventEmitter);
extend(Map.prototype, {
	id : null, //map's internal id
	
	//Zip file holding all data
	file: null,
	xhr: null, //active xhr request
	
	jsondata : null,
	objdata : null,
	mtldata : null,
	
	tiledata : null,
	
	mapmodel: null,
	camera : null,
	scene : null,
	
	/** Begin download of this map's zip file, preloading the data. */
	download : function(){
		if (this.file) return; //we have the file in memory already, do nothing
		if (this.xhr) return; //already got an active request, do nothing
		
		var self = this;
		var xhr = this.xhr = new XMLHttpRequest();
		xhr.open("GET", "maps/"+this.id+".zip");
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
		console.log("OPEN: ", xhr.readyState);
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
		
		fileSys.importBlob(this.file, function success(){
			//TODO load up the map!
			fileSys.root.getChildByName("map.json").getText(__jsonLoaded, __logProgress);
			fileSys.root.getChildByName("map.obj").getText(__objLoaded, __logProgress);
			fileSys.root.getChildByName("map.mtl").getText(__mtlLoaded, __logProgress);
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
			self.jsondata = JSON.parse(data);
			self.emit("loaded-meta");
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
			console.log("__modelLoaded");
			var objldr = new ObjLoader(self.objdata, self.mtldata, fileSys);
			objldr.on("load", __modelReady);
			objldr.load();
		}
		
		function __modelReady(obj) {
			console.log("__modelReady");
			self.mapmodel = obj;
			self.emit("loaded-model");
			self.init();
		}
	},
	
	/**
	 * Creates the map for display from the stored data.
	 */
	init : function(){
		this.scene = new THREE.Scene();
		
		var scrWidth = $("#gamescreen").width();
		var scrHeight = $("#gamescreen").height();
		// switch(this.jsondata.camera) {
		// 	case "ortho":
		// 		this.camera = new THREE.OrthographicCamera(scrWidth/-2, scrWidth/2, scrHeight/2, scrHeight/-2, 1, 1000);
		// 		this.camera.position.y = 100;
		// 		this.camera.roation.x = -Math.PI / 2;
		// 		break;
		// 	case "gen4":
				this.camera = new THREE.PerspectiveCamera(75, scrWidth / scrHeight, 1, 1000);
				// this.camera.position.y = 10;
				// this.camera.rotation.x = -55 * (Math.PI / 180);
				
				this.camera.position.z = 10;
	
				controls = new THREE.OrbitControls(this.camera);
				controls.damping = 0.2;
		// 		break;
		// }
		this.scene.add(this.camera);
		
		light = new THREE.DirectionalLight(0xffffff, 1);
		light.position.set(0, 1, 1);
		this.scene.add(light);
		
		this.scene.add(this.mapmodel);
	},
	
	cleanup : function(){
		delete this.fileSys;
	},
	
	logicLoop : function(){
		if (controls) controls.update();
	},
});
module.exports = Map;

