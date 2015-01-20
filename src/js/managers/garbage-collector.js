// garbage-collector.js
// Allocates all the various disposable items, such as geometry and listeners, for
// later disposal.

var REVOKE_URLS = !!URL.revokeObjectURL;


function GarbageCollector() {
	this.bins = {};
	this.allocateBin("_default");
}

GarbageCollector.prototype.allocateBin = function(binId) {
	var bin = this.bins[binId] = new GarbageBin();
}

GarbageCollector.prototype.collect = function(obj, binId){
	if (!binId) binId = "_default";
	var bin = this.bins[binId];
	if (!bin) {
		console.warn("[GC] Bin does not exist! Putting object in default bin. BinID:", binID);
		bin = this.bins["_default"];
	}
	bin.collect(obj);
}

GarbageCollector.prototype.collectURL = function(obj, binId){
	if (!binId) binId = "_default";
	var bin = this.bins[binId];
	if (!bin) {
		console.warn("[GC] Bin does not exist! Putting object in default bin. BinID:", binID);
		bin = this.bins["_default"];
	}
	bin.collectURL(obj);
}

GarbageCollector.prototype.getBin = function(binId) {
	if (!binId) binId = "_default";
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
	this.tags = []; //Script tags and other disposable tags
	
	this.bloburls = []; //Object URLs that can be revoked with URL.revokeObjectURL
}
GarbageBin.prototype = {
	collect: function(obj) {
		if (obj.dispose) {
			this.disposal.push(obj);
		}
		if (obj.removeAllListeners) {
			this.listeners.push(obj);
		}
		if ((obj instanceof $) || obj.nodeName) {
			this.tags.push(obj);
		}
	},
	
	collectURL: function(url) {
		if (!REVOKE_URLS) return;
		if (typeof url != "string") return;
		this.bloburls.push(url);
	},
	
	dispose: function() {
		for (var i = 0; i < this.disposal.length; i++) {
			this.disposal[i].dispose();
			this.disposal[i] = null;
		}
		this.disposal = null;
		
		for (var i = 0; i < this.listeners.length; i++) {
			this.listeners[i].removeAllListeners();
			this.listeners[i] = null;
		}
		this.listeners = null;
		
		for (var i = 0; i < this.tags.length; i++) {
			$(this.tags[i]).removeAttr("src").remove();
			this.tags[i] = null;
		}
		this.tags = null;
		
		
		
		for (var i = 0; i < this.bloburls.length; i++) {
			URL.revokeObjectURL(this.bloburls[i]);
			this.bloburls[i] = null;
		}
		this.bloburls = null;
	},
};

