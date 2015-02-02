// actorscheduler.js
// Defines the Actor Scheduler

var inherits = require("inherits");
var extend = require("extend");

function ActorScheduler() {
	
}
extend(ActorScheduler.prototype, {
	actormap : {},
	
	/** Creates a schedule for an actor given a list of locations.
	 * A Schedule is a list of times to locations showing when a given actor
	 * is in a map for this day. Passed is a list of locations that the actor
	 * might visit in a normal day. Not passed are places that the actor will 
	 * always be at a given time (unless the actor randomly shows up there normally).
	 * This function creates a randomized schedule, with randomized amounts of
	 * time spent at any given place.
	 */
	createSchedule: function(locations) {
		
	},
});
module.exports = new ActorScheduler();
