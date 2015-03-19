// infodex.js
// The manager for the infodex. Other managers defer to this 
// when calling functions for the infodex.

var inherits = require("inherits");
var extend = require("extend");

function Infodex() {
	var self = this;
	$(function(){
		self.breadcrumb = $("#dex-container .breadcrumb");
		self.searchbox = $("#dex-container .search input");
		
		$("#dex-container .backbtn").click(function(){
			
		});
		$("#dex-container .fwdbtn").click(function(){
			
		});
		$("#dex-container .searchbtn").click(function(){
			
		});
	});
	
	this.history_back = [];
	this.history_fwd = [];
}
extend(Infodex.prototype, {
	history_back: null,
	history_fwd: null,
	
	openPage: function(id) {
		
	},
});
module.exports = new Infodex();

