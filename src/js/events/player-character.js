// player-character.js
// Defines the concrete code for a Player Character in the world

var Actor = require("tpp-actor");
var inherits = require("inherits");
var extend = require("extend");

/**
 */
function PlayerChar(){
	Actor.call(this, {}, {});
}
inherits(PlayerChar, Actor);
extend(PlayerChar.prototype, {
	
});
