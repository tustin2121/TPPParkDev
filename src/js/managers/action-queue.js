// action-queue.js
// Defines the ActionQueueItem and how they work together.

var inherits = require("inherits");
var extend = require("extend");

function ActionQueueItem() {}
extend(ActionQueueItem.prototype, {
	run: function() {
		//Needs to be overridden in subclasses
	},
	_complete: function() {},
	
	start: function() {
		this.run();
	},
	then: function(item) {
		
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


