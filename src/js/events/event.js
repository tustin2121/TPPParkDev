// event.js
// Defines the base event used throughout the park.

// Fittingly, Event is a subclass of node.js's EventEmitter class.
var EventEmitter = require("events").EventEmitter;
var inherits = require("inherits");
var extend = require("extend");

/**
 * An event is any interactable or animating object in the game.
 * This includes things ranging from signs, to people/pokemon.
 * An event:
 *	- Takes up at least one tile on the map
 *	- Can be interacted with by in-game talking or on-screen click
 *	- May be represented in-game by a sprite
 *	- May decide, upon creation, to not appear on the map.
 */
function Event(base, opts) {
	EventEmitter.call(this);
	
	extend(this, base, opts);
}
inherits(Event, EventEmitter);
extend(Event.prototype, {
	
});

/*
Events:
	entering-tile (from-dir) 
		emitted upon the player is given the go ahead to enter the tile this event occupies.
	entered-tile (from-dir)
		emitted upon the player landing on the tile this event occupies.
	leaving-tile (to-dir)
		emitted upon the player is given the go ahead to leave the tile this event occupies.
	left-tile (to-dir)
		emitted upon the player completely leaving the tile this event occupies.
	bumped (from-dir)
		emitted upon the player is denied entry into the tile this event occupies.
	interacted (from-dir)
		emitted when the player interacts with this event from an adjacent tile
	clicked (x, y)
		emitted when the mouse is clicked on this event (and it is determined it is this event)
	clicked-through (x, y)
		emitted when the mouse is clicked on this event (and the raytrace is passing through 
		this event during the determining phase)
	moving (srcX, srcY, destX, destY)
		emitted when this event begins moving to a new tile
	moved (srcX, srcY, destX, destY)
		emitted when this event finishes moving to a new tile
	created
		emitted when this event is added to the event map
	destroyed
		emitted when this event has been taken out of the event map
	
*/
