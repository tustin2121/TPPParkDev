// chat-context.js
// Defines the ChatContext class

// var inherits = require("inherits");
var extend = require("extend");

/** 
 * A Chat Context is the embodiment of a set of reactions from the chat for 
 * a given situation. The chat context is what determines how the chat will
 * respond when something happens on screen.
 */
function ChatContext(opts) {
	extend(this, opts);
}
extend(ChatContext.prototype, {
	chat: null,
	
	distribution: 'random', //also: 'sequential'
	
	timeout: 15000, // 15 seconds
	timestamp: 0, // The time that this context drops into the pool
	
	influence: 1,
	
	getInfluence : function(date) {
		if (!this.timestamp) return -1;
		date = date || new Date().getTime();
		if (this.timestamp + this.timeout < date) return 0;
		
		var x = 0; //% time since this context was stamped
		//TODO if this was stamped less than 5 seconds ago, ramp up over that time period
		//else
		{
			var inflMulti = 0.5 * Math.cos((x - 0.18) * Math.PI) + 0.5;
			return this.influence * inflMulti;
		}
	},
	
	isTimedout : function(date) {
		date = date || new Date().getTime();
		return this.timestamp + this.timeout < date;
	},
});