// ui-manager.js
// Defines the UI module, which controls the user interface.

var inherits = require("inherits");
var extend = require("extend");
var EventEmitter = require("events").EventEmitter;

/**
 *
 */
function UIManager() {
	// this.skrim = $("#canvas-ui .skrim");
	// this.textbox = $("#canvas-ui .textbox");
	
	var self = this;
	$(function(){
		self._initUIScene();
	});
}
inherits(UIManager, EventEmitter);
extend(UIManager.prototype, {
	/////////////////////// UI Actions ///////////////////////////
	skrim : null,
	
	textbox : null,
	tb_owner : null,
	tb_text : "",
	tb_printindex : 0,
	
	/** Show a standard textbox on screen. */
	showTextBox : function(text) {
		this.showDialogBox(null, text);
	},
	
	/** Show a speech bubble on screen. Owner points to the event the tail should point at. */
	showDialogBox : function(owner, text) {
		
	},
	
	/** Immedeately hides the text or dialog box and clears any text that was in it. */
	closeTextBox : function() {
		
	},
	
	/** Shows a selectable menu in the top-right corner of the screen. */
	showMenu : function() {
		
	},
	
	/** Immedately closes the menu and clears it for further use. */
	closeMenu : function() {
		
	},
	
	/** 
	 * Shows a Yes/No menu just above the text box. If text is currently printing out on a, 
	 * dialog box or text box on screen, this will automatically wait for the text to finish
	 * printing before showing it. The Yes and No functions will fire off one when is selected.
	 * The functions will presumably push more actions into the action queue.
	 */
	showConfirmPrompt : function(yesfn, nofn) {
		
	},
	
	
	openInfodexPage : function(pageid) {
		
	},
	
	
	/** Fade the screen out for a transition of some sort. */
	fadeOut : function(duration) {
		if (!duration) duration = 1000; //1 second
	},
	
	/** Fade the screen in from a transition. */
	fadeIn : function(duration) {
		if (!duration) duration = 1000; //1 second
	},
	
	/** Displays the loading icon over the main game screen. Optionally supply text. */
	showLoadingAjax : function(loadingText) {
		if (!loadingText) loadingText = "Loading...";
	},
	
	
	////////////////////// Action Queues /////////////////////////
	actionQueue : [],
	
	/** Pass this a set of functions to be run one after the other when the user confirms 
	 *  an action. */
	queueActions: function() {
		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if ($.isArray(arg)) {
				for (var j = 0; j < arg.length; j++) {
					if (!$.isFunction(arg[j])) 
						throw new Error("UI Actions must be functions to be run!");
					this.actionQueue.push(arg[j]);
				}
			} else if ($.isFunction(arg[j])) {
				this.actionQueue.push(arg[j]);
			} else {
				throw new Error("UI Actions must be functions to be run!");
			}
		}
	},
	
	/** Clears all queued actions from the ui action queue. Use this sparingly. This will 
	 *  NOT terminate any currently running actions or clear any text boxes. */
	clearActionQueue : function() {
		
	},
	
	////////////////////// UI Three.js Scene //////////////////////
	scene : null,
	camera : null,
	
	_initUIScene : function() {
		
		this.scene = new THREE.Scene();
		
		var sw = $("#gamescreen").width();
		var sh = $("#gamescreen").height();
		
		var camera = this.camera = new THREE.OrthographicCamera(0, sw, 0, -sh, 0, 10);
		camera.position.set(sw/2, -sh/2, -5);
		this.scene.add(camera);
		
		this.textbox = createDialogModel("textbox_gold");
		// adjust width : this.textbox.morphTargetInfluences[0] = 1;
		// adjust height: this.textbox.morphTargetInfluences[1] = 1;
		this.scene.add(this.textbox);
		
	},
	
});

// Alias for closeTextBox
UIManager.prototype.closeDialogBox = UIManager.prototype.closeTextBox; 

module.exports = new UIManager();



function createDialogModel(type) {
	var ins; //insets
	switch (type) {
		case "textbox_gold":
			ins = { 
				t: 6, b: 10, h: 16, //top, bottom, height
				l: 6, r: 10, w: 16, //left, right, width
			};
			break;
		case "dialog_bubble":
			ins = { 
				t: 6, b:  9, h: 16,
				l: 9, r: 12, w: 32,
			};
			break;
	}
	
	var geom = new THREE.Geometry();
	{
		geom.vertices = [
			v3(0,     0), v3(ins.l,     0), v3(ins.r,     0), v3(ins.w,     0), //0-3
			v3(0, ins.t), v3(ins.l, ins.t), v3(ins.r, ins.t), v3(ins.w, ins.t), //4-7
			v3(0, ins.b), v3(ins.l, ins.b), v3(ins.r, ins.b), v3(ins.w, ins.b), //8-11
			v3(0, ins.h), v3(ins.l, ins.h), v3(ins.r, ins.h), v3(ins.w, ins.h), //12-15
		];
		f4(geom, 0, 1, 4, 5); f4(geom, 1, 2, 5, 6); f4(geom, 2, 3, 6, 7);
		f4(geom, 4, 5, 8, 9); f4(geom, 5, 6, 9,10); f4(geom, 6, 7,10,11);
		f4(geom, 8, 9,12,13); f4(geom, 9,10,13,14); f4(geom,10,11,14,15);
		
		geom.morphTargets = [
			{
				name: "width", vertices: [
					v3(0,     0), v3(ins.l,     0), v3(ins.r+1,     0), v3(ins.w+1,     0), //0-3
					v3(0, ins.t), v3(ins.l, ins.t), v3(ins.r+1, ins.t), v3(ins.w+1, ins.t), //4-7
					v3(0, ins.b), v3(ins.l, ins.b), v3(ins.r+1, ins.b), v3(ins.w+1, ins.b), //8-11
					v3(0, ins.h), v3(ins.l, ins.h), v3(ins.r+1, ins.h), v3(ins.w+1, ins.h), //12-15
				],
			},
			{
				name: "height", vertices: [
					v3(0,     0  ), v3(ins.l,     0  ), v3(ins.r,     0  ), v3(ins.w,     0  ), //0-3
					v3(0, ins.t  ), v3(ins.l, ins.t  ), v3(ins.r, ins.t  ), v3(ins.w, ins.t  ), //4-7
					v3(0, ins.b+1), v3(ins.l, ins.b+1), v3(ins.r, ins.b+1), v3(ins.w, ins.b+1), //8-11
					v3(0, ins.h+1), v3(ins.l, ins.h+1), v3(ins.r, ins.h+1), v3(ins.w, ins.h+1), //12-15
				],
			}
		];
	}
	
	
	var mat = new THREE.MeshBasicMaterial();
	{
		var tex = new THREE.Texture();
		tex.magFilter = THREE.NearestFilter;
		tex.minFilter = THREE.NearestFilter;
		tex.generateMipmaps = false;
		
		var img = new Image();
		function f(){
			tex.image = img;
			tex.needsUpdate = true;
			img.removeEventListener("load", f);
		}
		img.on("load", f);
		
		img.src = BASEURL+"/img/ui/"+type+".png";
		
		mat.map = tex;
		mat.morphTargets = true;
	}
	
	var model = new THREE.Mesh(geom, mat);
	return model;
	
	//--------------------------------------------------------------------//
	function v2(x, y) { return new THREE.Vector2(x, y); }
	function v3(x, y) { return new THREE.Vector3(x, y, 0); }
	function uv(v) {
		return new THREE.Vector2(v.x / ins.w, v.y / ins.h);
	}
	
	function f4(g, a, b, c, d) {
		g.faces.push(new THREE.Face3(a, b, d));
		g.faces.push(new THREE.Face3(b, c, d));
		
		g.faceVertexUvs[0].push([ uv(g.vertices[a]), uv(g.vertices[b]), uv(g.vertices[d]) ]);
		g.faceVertexUvs[0].push([ uv(g.vertices[b]), uv(g.vertices[c]), uv(g.vertices[d]) ]);
	}
}


