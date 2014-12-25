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


