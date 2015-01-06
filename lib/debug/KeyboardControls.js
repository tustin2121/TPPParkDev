// 


function KeyboardControls(object) {
	this.keyDown = {};
	this.keyChanged = {};
	
	this.onKeyDown = function ( event ) {
		this.keyDown[event.keyCode] = true;
		this.keyChanged[event.keyCode] = true;
	};
	
	this.onKeyUp = function ( event ) {
		this.keyDown[event.keyCode] = false;
		this.keyChanged[event.keyCode] = true;
	};
	
	window.addEventListener( 'keydown', bind( this, this.onKeyDown ), false );
	window.addEventListener( 'keyup', bind( this, this.onKeyUp ), false );
	
	function bind( scope, fn ) {
		return function () {
			fn.apply( scope, arguments );
		};
	};
}