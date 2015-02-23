// chatot.js
// Defines the script for the Chat Simulation Tester

require("../polyfill.js");
window.THREE = {
	Mesh: function(){},
	Object3D: function(){},
	Material: function(){},
	ShaderMaterial: function(){},
	BasicMaterial: function(){},
	Matrix4: function(){},
	Geometry: function(){},
	Vector3: function(){},
	Vector2: function(){},
	Face3: function(){},
	Texture: function(){},
	Color: function(){},
	Scene: function(){},
};

var renderLoop = require("../model/renderloop");

// require("../globals");
window.Chat = require("../chat/chat-core.js");
window.gameState = require("../gamestate");

// On Ready
$(function(){
	
	renderLoop.start({
		_disableThree: true,
		ticksPerSecond : 20,
	});
	
	Chat.initChatSpawnLoop();
	
});