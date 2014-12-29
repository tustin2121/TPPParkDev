// polyfill.js
// Defines some polyfills needed for the game to function.

// String.startsWith()
// 
if (!String.prototype.startsWith) {
	Object.defineProperty(String.prototype, 'startsWith', {
		enumerable: false,
		configurable: false,
		writable: false,
		value: function(searchString, position) {
			position = position || 0;
			return this.lastIndexOf(searchString, position) === position;
		}
	});
}

// EventTarget.on() and EventTarget.emit()
// Adding this to allow dom elements and objects to simply have "on" and "emit" used like node.js objects can
if (!EventTarget.prototype.on) {
	EventTarget.prototype.on = EventTarget.prototype.addEventListener;
	EventTarget.prototype.emit = EventTarget.prototype.dispatchEvent;
}

// Object.dispose()
// Adding this allows a call to "dispose" on any object without throwing errors, though it won't do anything by default
// if (!Object.prototype.dispose) {
// 	Object.defineProperty(Object.prototype, "dispose", {
// 		enumerable: false,
// 		configurable: true,
// 		writable: true,
// 		value : function(){},
// 	});
	
// 	Array.prototype.dispose = null;
	
// 	// Object.defineProperty(Array.prototype, "dispose", {
// 	// 	enumerable: true,
// 	// 	configurable: true,
// 	// 	writable: true,
// 	// 	value : undefined
// 	// });
// }
