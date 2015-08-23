// model-mods.js
// Defining several standard-issue model modiciations to be run in the local event.js for a map

var inherits = require("inherits");
var extend = require("extend");

function Modification(fn, opts) {
	extend(this, opts);
	this.fn = fn;
}
extend(Modification.prototype, {
	name: null,
	prefix: null,
	suffix: null,
	regex: null,
	all: false,
	
	fn: null,
});


function testName(narray, name) {
	if (!$.isArray(narray)) narray = [narray];
	for (var i = 0; i < narray.length; i++) {
		if (name == narray[i]) return true;
	}
	return false;
}
function testPrefix(narray, name){
	if (!$.isArray(narray)) narray = [narray];
	for (var i = 0; i < narray.length; i++) {
		if (name.startsWith(narray[i])) return true;
	}
	return false;
}
function testSuffix(narray, name){
	if (!$.isArray(narray)) narray = [narray];
	for (var i = 0; i < narray.length; i++) {
		if (name.endsWith(narray[i])) return true;
	}
	return false;
}
function testRegex(regex, name) {
	return regex.test(name);
}


module.exports = {
	modify: function (){
		var mods = [];
		for (var p in this) {
			if (!(this[p] instanceof Modification)) continue;
			if (!this[p].name && !this[p].prefix && !this[p].suffix) continue;
			mods.push(this[p]);
		}
		
		var ch = currentMap.mapmodel.children;
		for (var i = 0; i < ch.length; i++) {
			for (var m = 0; m < mods.length; m++) {
				if (mods[m].name && testName(mods[m].name, ch[i].name)) {
					mods[m].fn(ch[i]);
				}
				else if (mods[m].prefix && testPrefix(mods[m].prefix, ch[i].name)) {
					mods[m].fn(ch[i]);
				}
				else if (mods[m].suffix && testSuffix(mods[m].suffix, ch[i].name)) {
					mods[m].fn(ch[i]);
				}
				else if (mods[m].regex && testRegex(mods[m].regex, ch[i].name)) {
					mods[m].fn(ch[i]);
				}
				else if (mods[m].all) {
					mods[m].fn(ch[i]);
				}
			}
		}
		
		for (var m = 0; m < mods.length; m++) {
			mods[m].name = null;
			mods[m].prefix = null;
			mods[m].suffix = null;
			mods[m].regex = null;
			mods[m].all = false;
		}
	},
	
	///////////////////////////////////////////////////////////////////////////////////////
	// Actual modification functions below
	
	hide: new Modification(function(obj){
		obj.visible = false;
	}),
	
	trees: new Modification(function(tree) {
		for (var j = 0; j < tree.children.length; j++) {
			var m = tree.children[j].material;
			if (m.side != THREE.DoubleSide) {
				//Need to gate because the color set at the end is destructive
				m.side = THREE.DoubleSide;
				m.alphaTest = 0.2;
				m.transparent = true;
				m.emissive.set(m.color);
				m.color.set(0);
				m.needsUpdate = true;
			}
			
			tree.children[j].renderDepth = (10+j) * -1;
		}
	}),
	
	doubleSided : new Modification(function(obj){
		for (var j = 0; j < obj.children.length; j++) {
			obj.children[j].material.side = THREE.DoubleSide;
		}
	}),
	
	renderDepthFix: new Modification(function(obj){
		for (var j = 0; j < obj.children.length; j++) {
			obj.children[j].renderDepth = -50;
		}
	}),
	
	godrays: new Modification(function(rays){
		for (var i = 0; i < rays.children.length; i++) {
			rays.children[i].renderDepth = -100;
			rays.children[i].material.blending = THREE.AdditiveBlending;
			rays.children[i].material.depthWrite = false;
		}
	}),
	
	refreshMaterials: new Modification(function(obj){
		for (var j = 0; j < obj.children.length; j++) {
			var m = obj.children[j].material;
			m.needsUpdate = true;
		}
	}),
};