// xInfiniteLedge/events.js

var Event = require("tpp-event");
var Trigger = require("tpp-trigger");

var inherits = require("inherits");
var extend = require("extend");

function TeleportWarp(base, opts) {
	Trigger.call(this, base, opts);
}
inherits(TeleportWarp, Trigger);
extend(TeleportWarp.prototype, {
	onTriggerEnter : function(dir) {
		setTimeout(function(){
			var orgx = player.location.x;
			var orgy = player.location.y;
			
			player.location.y -= 23;
			player.avatar_node.position.set(
				currentMap.get3DTileLocation(player.location)
			);
			player.emit("moving", orgx, orgy, player.location.x, player.location.y);
			player.emit("moved", orgx, orgy, player.location.x, player.location.y);
			
			// player.moveTo(player.location.x, player.location.y-24, 1, {
			// 	speed: 0.1,
			// 	bypass: true,
			// });
		}, 0);
	},
});


add(new TeleportWarp({
	id: "LOOP",
	locations: [2, 28, 22, 1],
}));