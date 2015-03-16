// action-queue.js
// Defines the ActionQueueItem and how they work together.

var inherits = require("inherits");
var extend = require("extend");

function ActionQueueItem() {}
extend(ActionQueueItem.prototype, {
	previous: null,
	next: null,
	
	run: function() {
		//Needs to be overridden in subclasses
	},
	_complete: function() {
		if (this.next) {
			var n = this.next;
			setTimeout(function(){
				n.run();
			}, 0);
		}
	},
	
	start: function() {
		if (this.previous) this.previous.start();
		else {
			var self = this;
			setTimeout(function(){
				self.run();
			}, 0);
		}
	},
	then: function(item) {
		if ((item instanceof ActionQueueItem)) 
			throw new Error("Must pass an ActionQueueItem to then!");
		
		this.next = item;
	},
});
module.exports.ActionQueueItem = ActionQueueItem;

///////////////////////////////////////////////////////////////

function ShowTextBoxQI(type, html, opts) {
	if (!(this instanceof ShowTextBoxQI)) {
		return new ShowTextBoxQI(type, html, opts);
	}
	var self = this;
	
	this.type = type;
	this.html = html;
	this.opts = opts;
	this.opts.complete = function() {
		self._complete();
	};
}
inherits(ShowTextBoxQI, ActionQueueItem);
extend(ShowTextBoxQI.prototype, {
	run: function() {
		UIManager.showTextBox.apply(UIManager, this.args);
	},
});



