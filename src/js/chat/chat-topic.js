// chat-topic.js
// Defines a topic for the chat to talk about

var inherits = require("inherits");
var extend = require("extend");

function Topic(id, opts) {
	extend(this, opts);
	this.id = id;
	
	if (!this.chats) {
		this.chats = [ "<d:riot> RIOT <d:riot>" ];
	}
}
extend(Topic.prototype, {
	id: "UNKNOWN",
	chats: null,
	users: null,
	
	getChat: function() {
		var i = Math.floor(Math.random() * this.chats.length);
		var chat = this.chats[i];
		
		var j = Math.floor(Math.random() * this.users.length);
		var user = this.users[j];
		
		return { chat: chat, user: user };
	},
});

