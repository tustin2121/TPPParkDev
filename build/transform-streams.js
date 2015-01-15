// transform-stream.js
// A module which encapsultes a couple common Transform streams

var inherits = require("inherits");
var extend = require("extend");
var stream = require("stream");

module.exports = {};

// http://strongloop.com/strongblog/practical-examples-of-the-new-node-js-streams-api/
function ByLineReader(opts) {
	if (!(this instanceof ByLineReader))
		return new ByLineReader(opts);
	
	extend(opts, { objectMode: false });
	stream.Transform.call(this, opts);
	
	this.setEncoding("utf8");
}
inherits(ByLineReader, stream.Transform);
extend(ByLineReader.prototype, {
	_transform : function(chunk, encoding, doneFn) {
		var data = chunk.toString();
		if (this._lastLineData) 
			data = this._lastLineData + data;
		
		var lines = data.split("\n");
		this._lastLineData = lines.splice(lines.length-1, 1)[0];
		
		for (var i = 0; i < lines.length; i++) {
			this.push(lines[i]);
		}
		// lines.forEach(this.push.bind(this));
		doneFn();
	},
	
	_flush : function(doneFn) {
		if (this._lastLineData) 
			this.push(this._lastLineData);
		this._lastLineData = null;
		doneFn();
	},
});
module.exports.ByLineReader = ByLineReader;


/**
 * For each chunk of data, calls a given function with the data which is expected to
 * transform it somehow, and return the result.
 */
function ProcessorTransform(fn, opts) {
	if (!(this instanceof ProcessorTransform))
		return new ProcessorTransform(fn, opts);
	
	extend(opts, { objectMode: true });
	stream.Transform.call(this, opts);
	this.processFn = fn;
	
	this.setEncoding("utf8");
}
inherits(ProcessorTransform, stream.Transform);
extend(ProcessorTransform.prototype, {
	processFn : function() { throw new Error("Did not assign a process function to the ProcessorTransform class."); },
	
	_transform : function(chunk, encoding, doneFn) {
		var trans = this.processFn(chunk.toString());
		if (trans === undefined) {
			throw new Error("Did not return a value from the process function!");
		}
		//Append a new line if it does not have one
		if (trans.lastIndexOf("\n") != trans.length-1)
			trans += "\n";
		
		doneFn(null, trans);
	},
	
	// _flush : function(doneFn) {
		
	// },
});
module.exports.ProcessorTransform = ProcessorTransform;


/**
 * For each chunk of data, calls a given function with the data which is expected to
 * transform it somehow, and return the result.
 */
function PrependTransform(Str, opts) {
	if (!(this instanceof PrependTransform))
		return new PrependTransform(Str, opts);
	
	extend(opts, { objectMode: true });
	stream.Transform.call(this, opts);
	this.prependStr = Str;
	
	this.setEncoding("utf8");
}
inherits(PrependTransform, stream.Transform);
extend(PrependTransform.prototype, {
	prependStr : "",
	done : false,
	
	_transform : function(chunk, encoding, doneFn) {
		if (!this.done) {
			chunk = this.prependStr + chunk.toString();
			this.done = true;
		}
		
		doneFn(null, chunk);
	},
	
	// _flush : function(doneFn) {
	// 	doneFn();
	// },
});
module.exports.PrependTransform = PrependTransform;
