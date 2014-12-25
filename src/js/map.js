// map.js

var inherits = require("inherits");
var extend = require("extend");
var EventEmitter = require("events").EventEmitter;
//var zip = zip.js

var ObjLoader = require("./modelloader/obj-loader");

// The currently loaded zip file system
var fileSys = new zip.fs.FS();

function Map(id, opts){
	
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
		xhr.responseType = "blob";
		xhr.on("load", function(e) {
			self.file = xhr.response;
			self.emit("downloaded");
		});
		xhr.on("progress", function(e){
			if (e.lengthComputable) {
				var percentDone = e.loaded / e.total;
			} else {
				//marquee bar
			}
		});
		//TODO on error and on canceled
		
		xhr.open("GET", "maps/"+id+".zip");
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
		}
		
		fileSys.importBlob(this.file, function success(){
			//TODO load up the map!
			fileSys.root.getChildByName("map.json").getText(__jsonLoaded, true);
			fileSys.root.getChildByName("map.obj").getText(__objLoaded, true);
			fileSys.root.getChildByName("map.mtl").getText(__mtlLoaded, true);
			//TODO load event bundles
			
		}, function error(){
			self.emit("load-error"); //Send to the dorito dungeon
		});
		return; 
		
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
			var objldr = new ObjLoader(self.objdata, self.mtldata, fileSys);
			objldr.on("load", __modelReady);
			
		}
		
		function __modelReady(obj) {
			this.mapmodel = obj;
			self.emit("loaded-model");
			this.init();
		}
	},
	
	/**
	 * Creates the map for display from the stored data.
	 */
	init : function(){
		this.scene = new THREE.Scene();
		
		var scrWidth = $("#gamescreen").width();
		var scrHeight = $("#gamescreen").height();
		switch(tiledata.properties.camera) {
			case "ortho":
				this.camera = new THREE.OrthographicCamera(scrWidth/-2, scrWidth/2, scrHeight/2, scrHeight/-2, 1, 1000);
				this.camera.position.y = 100;
				this.camera.roation.x = -Math.PI / 2;
				break;
			case "gen4":
				this.camera = new THREE.PerspectiveCamera(75, scrWidth / scrHeight, 1, 1000);
				this.camera.position.y = 10;
				this.camera.roation.x = -55 * (Math.PI / 180);
				break;
		}
		this.scene.add(this.camera);
		
		this.scene.add(this.mapmodel);
	},
});


