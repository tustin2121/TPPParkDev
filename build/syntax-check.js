// syntax-check.js
// A function that checked the syntax of various types of files

var fs = require("fs");
var esprima = require("esprima");
var jsonlint = require("jsonlint");


// Returns FALSE when everything checks out
// Returns an object if something does go wrong!
function checkSyntax(file, format) {
	switch(format) {
		case "js":
		case "javascript":
			return checkJavascript(file);
		case "json":
			return checkJSON(file);
	}
}
module.exports = checkSyntax;


function checkJavascript(file) {
	try {
		var content = fs.readFileSync(file, "utf8");
		
		if (content.indexOf("#!") == 0) {
			content = "//" + content.substr(2);
		}
		
		if (content.indexOf("//$ PackConfig") >= 0) {
			//Checks the pack config seperately and also trims it out of the stuff we're checking
			content = checkPackConfig(content);
		}
		
		syntax = esprima.parse(content, { tolerant : true });
		
		if (syntax.errors.length) {
			return syntax.errors;
		}
		return false;
	} catch (e) {
		return e;
	}
}

function checkJSON(file) {
	try {
		var content = fs.readFileSync(file, "utf8");
		
		jsonlint.parse(content);
		
		return false;
	} catch (e) {
		return e;
	}
}

function checkPackConfig(content) {
	var config = [], out = [];
	var lines = content.split("\n");
	var inConfig = false;
	for (var i = 0; i < lines.length; i++) {
		if (lines[i].indexOf("//$ PackConfig") == 0) { inConfig = i; continue; }
		if (lines[i].indexOf("//$!") == 0) { inConfig = 0; continue; }
		
		if (inConfig) {
			config.push(lines[i]);
		} else {
			out.push(lines[i]);
		}
	}
	if (inConfig) throw new Error("PackConfig does not close properly!");
	
	if (config.length) { //the PackConfig may have been commented out
		jsonlint.parse(config.join("\n"));
	}
	
	return out.join("\n");
}

