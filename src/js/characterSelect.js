// characterSelect.js
// Defining the character selection tickets on the landing page.

$(function(){
	var cSel = $("#charSelector");
	
	for (var file in PLAYERCHARS) {
		var format = PLAYERCHARS[file];
		var bx, by;
		switch(format) {
			case "hg_vertmix-32":
				bx = 64; by = 32;
				break;
			default:
				bx = 0; by = 0;
				break;
		}
		
		$("<div>").append(
			$("<div>").css({
				"background-image": "url("+BASEURL+"/img/pcs/"+file+")",
				"background-position": "-"+bx+"px -"+by+"px",
			})
		).attr("name", file)
		.on("click", function(){
			cSel.children().removeClass("selected");
			$(this).addClass("selected");
			
		})
		.appendTo(cSel);
	}
	
});

