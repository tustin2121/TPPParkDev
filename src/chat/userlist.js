// chat/userlist.js
// The list of users who will appear in chat, with info associated with them.

var extend = require("extend");

function User(obj){
	if (!(this instanceof User)) return new User(obj);
	
	extend(this, obj);
}
User.prototype = {
	name : null,
	color : "#000000",
	postmsg : "",
	premsg : "",
	
	nextTimeTalk: 0, //next time this user is allowed to talk
	lastTimeout: 0, //the last timeout this user had, in seconds. More than 5 seconds indicates a ban moment.
	
	
};

var lobj = module.exports = {
	list : [], //contains the list of all users
	hash : {}, //contains a hash of usernames to users
	
	
	random : function(time){
		time = time || new Date().getTime();
		var index;
		for (var i = 0; i < 20; i++) { //try up to only 20 times
			index = Math.floor(Math.random() * this.list.length);
			var u = this.list[index];
			if (u.nextTimeTalk > time) return u;
		}
		
		//If we can't find a user to return, make a new one as a fallback
		var u = new User({name: "guest"+ (Math.floor(Math.random() * 20000) + 10000) });
		this.list.push(u);
		this.hash[u.name] = u;
		return u;
	},
	
	
}

var ul = require("./users");
for (var i = 0; i < ul.length; i++) {
	var u = new User(ul[i]);
	lobj.list.push(u);
	lobj.hash[u.name] = u;
}


