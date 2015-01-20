// garbage-collector.js
// Allocates all the various disposable items, such as geometry and listeners, for
// later disposal.

function GarbageCollector() {
	this.bins = {};
	this.allocateBin("_default");
}

GarbageCollector.prototype.allocateBin = function(binId) {
	var bin = this.bins[binId] = new GarbageBin();
}

GarbageCollector.prototype.collect = function(obj, binId){
	var bin = this.bins[binId];
	if (!bin) {
		console.warn("[GC] Bin does not exist! Putting object in default bin. BinID:", binID);
		bin = this.bins["_default"];
	}
	bin.collect(obj);
}

GarbageCollector.prototype.getBin = function(binId) {
	var bin = this.bins[binId];
	if (!bin) {
		console.warn("[GC] Bin does not exist! Getting default bin. BinID:", binID);
		bin = this.bins["_default"];
	}
	return bin;
}

GarbageCollector.prototype.dispose = function(binId) {
	if (!binId) binId = "_default";
	var bin = this.bins[binId];
	if (!bin) {
		console.warn("[GC] Bin does not exist! Cannot dispose! BinID:", binID);
		return;
	}
	
	bin.dispose();
	
	bin = null;
	delete this.bins[binId];
}

module.exports = new GarbageCollector();



function GarbageBin() {
	this.disposal = []; //Objects that can have "dispose" called on them
	this.listeners = []; //Objects with listeners attached to them
}
GarbageBin.prototype = {
	collect: function(obj) {
		if (obj.dispose) {
			bin.disposal.push(obj);
		}
		if (obj.removeAllListeners) {
			bin.listeners.push(obj);
		}
	},
	
	dispose: function() {
		for (var i = 0; i < bin.disposal.length; i++) {
			bin.disposal[i].dispose();
			bin.disposal[i] = null;
		}
		bin.disposal = null;
		
		for (var i = 0; i < bin.listeners.length; i++) {
			bin.listeners[i].removeAllListeners();
			bin.listeners[i] = null;
		}
		bin.listeners = null;
	},
};

