// chat/core.js
// The core of the chat simulation behavior

require("../polyfill");

var extend = require("extend");
var userlist = require("./userlist");

/** 
 * Puts a message into the chat.
 */
function putMessage(user, text) {
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
}
module.exports.putMessage = putMessage;


function setLocationContext(context){
	
}
module.exports.setLocationContext = setLocationContext;

