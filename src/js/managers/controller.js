// controller.js
// This class handles input and converts it to control signals

var inherits = require("inherits");
var extend = require("extend");
var EventEmitter = require("events").EventEmitter;

// TODO https://developer.mozilla.org/en-US/docs/Web/Guide/API/Gamepad

function ControlManager() {
	var self = this;
	this.setKeyConfig();
	
	$(function(){
		$(document).on("keydown", function(e){ self.onKeyDown(e); });
		$(document).on("keyup", function(e){ self.onKeyUp(e); });
		
		$("#chatbox").on("focus", function(e){ 
			console.log("CHAT FOCUS");
			self.inputContext.push("chat"); 
		});
		$("#chatbox").on("blur", function(e){ 
			console.log("CHAT BLUR");
			if (self.inputContext.top == "chat")
				self.inputContext.pop(); 
		});
		
		self.touchManager();
	})
}
inherits(ControlManager, EventEmitter);
extend(ControlManager.prototype, {
	inputContext : ["game"],
	
	keys_config : {
		Up: [38, "Up", 87, "w"], 
		Down: [40, "Down", 83, "s"], 
		Left: [37, "Left", 65, "a"], 
		Right: [39, "Right", 68, "d"],
		Interact: [13, "Enter", 32, " "],
		Cancel: [27, "Escape", 17, "Ctrl"],
		Run: [16, "Shift"],
		Menu: [8, "Backspace", 46, "Delete"],
		FocusChat: [191, "/"],
	},
	
	keys_active : {},
	
	keys_down : {
		Up: false, Down: false,
		Left: false, Right: false,
		Interact: false, FocusChat: false,
		Run: false, Cancel: false,
	},
	
	pushInputContext: function(ctx) {
		this.inputContext.push(ctx);
		this.emit("inputContextChanged");
	},
	popInputContext: function(ctx) {
		if (!ctx || this.inputContext.top == ctx) {
			var c = this.inputContext.pop();
			this.emit("inputContextChanged");
			return c;
		}
	},
	removeInputContext: function(ctx) {
		if (!ctx) return;
		var index = this.inputContext.lastIndexOf(ctx);
		if (index > -1) {
			this.inputContext.splice(index, 1);
			this.emit("inputContextChanged");
			return ctx;
		}
	},
	
	isDown : function(key, ctx) {
		if ($.isArray(ctx)) {
			var go = false;
			for (var i = 0; i < ctx.length; i++) go |= ctx[i];
			if (!go) return;
		} else {
			if (this.inputContext.top != ctx) return;
		}
		
		return this.keys_down[key];
	},
	isDownOnce : function(key, ctx) {
		if ($.isArray(ctx)) {
			var go = false;
			for (var i = 0; i < ctx.length; i++) go |= ctx[i];
			if (!go) return;
		} else {
			if (this.inputContext.top != ctx) return;
		}
		
		return this.keys_down[key] == 1;
	},
	
	setKeyConfig : function() {
		this.keys_active = extend(true, {}, this.keys_config);
	},
	
	onKeyDown : function(e) {
		for (var action in this.keys_active) {
			var keys = this.keys_active[action];
			for (var i = 0; i < keys.length; i++) {
				if (e.which == keys[i]) {
					// Key is now down!
					this.emitKey(action, true);
				}
			}
		}
	},
	onKeyUp : function (e) {
		for (var action in this.keys_active) {
			var keys = this.keys_active[action];
			for (var i = 0; i < keys.length; i++) {
				if (e.which == keys[i]) {
					// Key is now up!
					this.emitKey(action, false);
				}
			}
		}
	},
	
	submitChatKeypress : function(key) {
		switch(key) {
			
		}
	},
	
	emitKey : function(action, down) {
		if (this.keys_down[action] != down) {
			this.keys_down[action] = down;
			this.emit("control-action", action, down);
		}
	},
	
	_tick : function() {
		for (var name in this.keys_down) {
			if (this.keys_down[name] > 0)
				this.keys_down[name]++;
		}
	}
	
});

ControlManager.prototype.touchManager = function() {
	var self = this;
	
	$(document).one("touchstart", function(){
		$("html").addClass("touchmode");
		if (!$("#touchcontrols").length) {
			function __map(btn, key) {
				btn.on("touchstart", function(e){
					console.log("TOUCHSTART: ", key);
					e.preventDefault();
					self.emitKey(key, true);
				});
				btn.on("touchend", function(e){
					console.log("TOUCHEND: ", key);
					e.preventDefault();
					self.emitKey(key, false);
				});
				btn.on("touchcancel", function(e){
					console.log("TOUCHCANCEL: ", key);
					e.preventDefault();
					self.emitKey(key, false);
				});
				btn.on("touchmove", function(e){
					console.log("TOUCHMOVE: ", key);
					e.preventDefault();
				})
				return btn;
			}
			
			$("<div>").attr("id", "touchcontrols")
			.append (
				__map($("<div>").addClass("button").addClass("a"), "Interact")
			).append (
				__map($("<div>").addClass("button").addClass("b"), "Cancel")
			).append (
				__map($("<div>").addClass("button").addClass("menu"), "Menu")
			).append (
				__map($("<div>").addClass("button").addClass("run"), "Run")
			).append (
				$("<div>").addClass("dpad")
				.append (
					__map($("<div>").addClass("button").addClass("up"), "Up")
				).append (
					__map($("<div>").addClass("button").addClass("down"), "Down")
				).append (
					__map($("<div>").addClass("button").addClass("left"), "Left")
				).append (
					__map($("<div>").addClass("button").addClass("right"), "Right")
				)
			).appendTo("body");
		}
	});
}



module.exports = new ControlManager();
