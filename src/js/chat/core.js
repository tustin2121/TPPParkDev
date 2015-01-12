// chat/core.js
// The core of the chat simulation behavior

// var inherits = require("inherits");
var extend = require("extend");

function currTime() { return new Date().getTime(); }

/**
 *
 */
function Chat() {
	this._initUserlist();
	this._initChatSpawnLoop();
	
}
// inherits(Chat, );
extend(Chat, {
	
	_u_list : [], //contains the list of all users
	_u_hash : {}, //contains a hash of usernames to users
	_u_classes: {
		chatleader: [],
		
	},
	
	_initUserlist : function() {
		var ul = require("./userlist");
		for (var i = 0; i < ul.length; i++) {
			var u = new User(ul[i]);
			this._u_list.push(u);
			this._u_hash[u.name] = u;
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
	
	_currChatMode : null,
	_initChatSpawnLoop : function() {
		var self = this;
		
		self._currChatMode = "loading";
		setTimeout(chatTick, 3000);
		
		self.setChatMode = function(mode) {
			self._currChatMode = mode;
			setTimeout(chatTick, 0);
		};
		
		function chatTick() {
			var nextUpdate = self.updateChat();
			if (nextUpdate < 0) return;
			setTimeout(chatTick, nextUpdate);
		}
	},
	
	setChatMode : function(){},
	
	updateChat : function() {
		switch (this._currChatMode) {
			case "normal":
				this.spawnChatMessage();
				return 300 + Math.floor(Math.random()*400);
			case "loading":
				//TODO
				return -1;
			case "disconnected":
				//TODO
				return 1000;
		}
	},
	
	///////////////////////////////////////////////////
	
	_ctx_pool : [], // Contexts that are active or have not yet timed out
	// Long term contexts:
	_ctx_location : null, // The context for the current location
	_ctx_occasion : null, // The context for the current occasion
	
	/** Adds a Chat Context to the context pool. */
	addContext : function(ctx) {
		ctx.timestamp = currTime();
		this._ctx_pool.push(ctx);
		
	},
	
	setLocationContext : function(context) {
		
	},
	
	/** */
	_tick_manageContexts : function() {
		var date = currTime();
		
		// Prune timed-out contexts
		var pool = this._ctx_pool;
		for (var i = 0; i < pool.length; i++) {
			if (pool[i].isTimedout(date)) {
				pool.splice(i, 1);
				i--;
				continue;
			}
		}
	},
	
	
	///////////////////////////////////////////////////
	
	/** 
	 * Puts a message into the chat.
	 */
	putMessage : function(user, text) {
		if (typeof user == "string")
			user = userlist[user];
		
		var line = $("<li>").addClass("chat-line");
		var badges = $("<span>").addClass("badges");
		var from = $("<span>").addClass("from");
		var colon = null;
		var msg = $("<span>").addClass("message");
		
		// Style the message
		if (user.badges) badges.append(user.badges);
		from.html(user.name);
		from.css({ "color": user.color });
		
		//Process message
		//TODO replace donger placeholders here
		//remove HTML here
		//replace Twitch emotes here
		msg.html(text);
		
		if (!text.startsWith("/me ")) {
			colon = $("<span>").addClass("colon").html(":");
		} else {
			msg.css({ "color": user.color });
		}
		
		line.append(badges, from, colon, msg);
		
		$("#chat-lines").append(line);
	},

	
});
module.exports = Chat;


function spawnChatMessage() {
	var date = currTime();
		
	// 
	var pool = this._ctx_pool;
	var distPool = [];
	var accum = 0;
	for (var i = 0; i < pool.length; i++) {
		var inf = pool[i].getInfluence();
		if (inf < 0) inf = 0;
		
		accum += inf;
		distPool.push(accum);
	}
	
	var index = Math.random() * accum;
	var selCtx = null;
	for (var i = 0; i < pool.length; i++) {
		if (index > distPool[i]) continue;
		selCtx = pool[i]; break;
	}
	
	//Context to pull from is now selected
	var msg = selCtx.getChatMessage(date);
	
}
Chat.spawnChatMessage = spawnChatMessage;






/**
 * 
 */
function User(obj){
	if (!(this instanceof User)) return new User(obj);
	
	extend(this, obj);
}
User.prototype = {
	name : null,
	color : "#000000",
	postmsg : "",
	premsg : "",
	badges : null,
	
	nextTimeTalk: 0, //next time this user is allowed to talk
	lastTimeout: 0, //the last timeout this user had, in seconds. More than 5 seconds indicates a ban moment.
	
};
