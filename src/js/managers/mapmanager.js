// mapmanager.js
//

var inherits = require("inherits");
var extend = require("extend");
var EventEmitter = require("events").EventEmitter;
var controller = require("tpp-controller");

var Map = require("../map.js");
var DoritoDungeon = require("../model/dungeon-map.js");

function MapManager() {
	
}
inherits(MapManager, EventEmitter);
extend(MapManager.prototype, {
	in_transition: null,
	nextMap: null,
	loadError: null,
	
	transitionTo : function(mapid, warpindex, animOverride) {
		var self = this;
		if (this.in_transition) {
			console.error("Called Map Transition while already in a map transition!", mapid, warpindex);
			return;
		}
		this.in_transition = true;

		controller.pushInputContext("_map_warping_");
		if (mapid !== undefined || warpindex !== undefined) {
			gameState.mapTransition.nextMap = mapid = mapid || currentMap.id;
			gameState.mapTransition.warp = warpindex || 0;
			gameState.mapTransition.animOverride = animOverride;
		} else {
			mapid = gameState.mapTransition.nextMap;
		}
		
		console.warn("Beginning Transition to", mapid);
		var loadCall = __beginLoad;
		var fadeOutDone = false;
		var finishedDownload = false;
		
		if (currentMap && currentMap.id == mapid) {
			// No need to download the next map
			loadCall = __inMapWarp;
			finishedDownload = true;
		} else {
			var nmap = this.nextMap = new Map(mapid);
			nmap.on("load-error", __loadError);
			nmap.on("progress", __progressUpdate);
			nmap.once("downloaded", __finishedDownload);
			nmap.once("map-started", __mapStart);
			
			nmap.download();
		}
		
		UI.fadeOut(function(){
			UI.showLoadingAjax();
			fadeOutDone = true;
			if (finishedDownload && fadeOutDone) {
				loadCall();
			}
		});
		
		return;
		///////////////////////////////////////////////////
		
		function __inMapWarp() {
			console.log("In-map warp!");
			var warp = gameState.mapTransition.warp || 0;
			warp = currentMap.metadata.warps[warp];
			if (!warp) {
				console.warn("Requested warp location doesn't exist:", window.transition_warpto);
				warp = this.metadata.warps[0];
			}
			if (!warp) throw new Error("This map has no warps!!");
			
			player.warpTo(warp);
			currentMap.eventMap.put(player.location.x, player.location.y, player);
			
			__mapStart();
		}
		
		///////////////////////////////////////////////////
		
		function __loadError(e) {
			self.nextMap.removeListener("load-error", __loadError);
			self.nextMap.removeListener("progress", __progressUpdate);
			self.nextMap.removeListener("downloaded", __finishedDownload);
			self.nextMap.removeListener("map-started", __mapStart);
			
			self.nextMap = new DoritoDungeon();
			self.nextMap.on("load-error", __loadError);
			self.nextMap.once("map-started", __mapStart);
			
			finishedDownload = true;
			if (finishedDownload && fadeOutDone) {
				__beginLoad();
			}
		}
		function __progressUpdate(loaded, total) {
			UI.updateLoadingProgress(loaded, total);
		}
		function __finishedDownload() {
			finishedDownload = true;
			if (finishedDownload && fadeOutDone) {
				__beginLoad();
			}
		}
		function __beginLoad() {
			if (currentMap) currentMap.dispose();
			console.log("============BEGIN LOAD==============");
			
			self.nextMap.removeListener("progress", __progressUpdate);
			self.nextMap.removeListener("downloaded", __finishedDownload);
			
			currentMap = self.nextMap; self.nextMap = null;
			
			if (DEBUG && DEBUG.runOnMapReady)
				currentMap.once("map-ready", DEBUG.runOnMapReady);
			
			currentMap.load();
		}
		function __mapStart() {
			currentMap.removeListener("load-error", __loadError);
			
			UI.hideLoadingAjax();
			UI.fadeIn();
			controller.removeInputContext("_map_warping_");
			self.in_transition = false;
		}
	},
});

module.exports = new MapManager();