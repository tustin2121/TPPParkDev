// chat-core.js
// Defines the core of the chat simulator

var extend = require("extend");
var controller = require("tpp-controller");
var donger = require("./donger.js");

function currTime() { return new Date().getTime(); }

/**
 */
function Chat() {
	
}
extend(Chat.prototype, {
	playerUser: null,
	
	_u_list: [], //contains the list of all users
	_u_hash: {}, //contrains a hash of usernames to users
	_u_classes: {
		chatleader: [],
	},
	
	_initUserlist : function() {
		var ul = require("./userlist");
		for (var i = 0; i < ul.length; i++) {
			var u = new User(ul[i]);
			this._u_list.push(u);
			this._u_hash[u.name] = u;
			
			if (!this.playerUser) {
				//The first user is the player's user
				this.playerUser = u; 
			}
		}
	},
	
	_randomUser : function(time){
		time = time || new Date().getTime();
		var index;
		for (var i = 0; i < 20; i++) { //try up to only 20 times
			index = Math.floor(Math.random() * this._u_list.length);
			var u = this._u_list[index];
			if (u.nextTimeTalk > time) return u;
		}
		
		//If we can't find a user to return, make a new one as a fallback
		var u = new User({name: "guest"+ (Math.floor(Math.random() * 20000) + 10000) });
		this._u_list.push(u);
		this._u_hash[u.name] = u;
		return u;
	},
	
	
	
	///////////////////////////////////////////////////
	// Note, the chat spawn loop was going to be part of the tick loop, but
	// using setTimeout ourselves makes things more independant and more 
	// flexible.
	
	_currChatMode : null,
	_timeout_id: 0,
	initChatSpawnLoop : function() {
		var self = this;
		
		__tick_spawnChats();
		return;

		function __tick_spawnChats() {
			if (!self._currChatMode) {
				//TODO remove connecting spinner
				self._currChatMode = "normal";
			}
				
			if (self._currChatMode == "normal") {
				self.spawnChatMessages();
				self._timeout_id = setTimeout(__tick_spawnChats, 500);
				
			} else {
				console.error("INVALID CHAT MODE");
			}
			
		}
	},
	
	setChatMode: function(chat) {
		this._currChatMode = chat;
		
		if (!self._timeout_id) {
			this.initChatSpawnLoop();
		}
	},
	
	
	///////////////////////////////////////////////////////////////////
	
	spawnChatMessages: function() {
		var numMsgs = Math.floor(Math.random() * 5) + 4;
		var date = currTime();
		
		for (var i = 0; i < numMsgs; i++) {
			
		}
	},
	
	
});
module.exports = new Chat();
