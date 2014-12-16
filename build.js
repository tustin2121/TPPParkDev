// build.js
// The build script for TPP Park v2

var exec = require("child_process").exec;
var fs = require("fs");
var less = require("less");
var Browserify = require("browserify");

//TODO: require("exec-sync");

function compileLess(src, dest) {
	exec("./node_modules/lessc", src, dest);
}

function bundleGame() {
	var bundler = new Browserify({
		noParse : ["three", "jquery"],
		debug : true,
	});
	
	bundler.exclude("three");
	
	bundler.plugin("minifyify", {
		map: "_srcmaps/game.map.json",
		output: "_srcmaps/game.map.json",
	});
	
	bundler.add("./src/game.js");
	bundler.bundle().pipe(fs.createWriteStream("./js/game.js"));
}

(function(){
	
	
})();
