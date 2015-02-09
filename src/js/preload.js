// preload.js
// Included in the main html file to be loaded before the 
//  async'ed js files are finished loading.


// Images / Textures / Sprites
window.AJAX_TEXTURE = BASEURL+"/img/ui/helix_doritos.png";
window.DEF_TEXTURE = BASEURL+"/img/missing_tex.png";
window.DEF_SPRITE = BASEURL+"/img/missing_sprite.png";
window.DEF_SPRITE_FORMAT = "pt_horzrow-32";

$(function(){
	window.AJAX_TEXTURE_IMG = $("<img>").attr("src", AJAX_TEXTURE).css({display:"none"}).appendTo("body")[0];
	
	window.DEF_TEXTURE_IMG = $("<img>").attr("src", DEF_TEXTURE).css({display:"none"}).appendTo("body")[0];
	window.DEF_SPRITE_IMG = $("<img>").attr("src", DEF_SPRITE).css({display:"none"}).appendTo("body")[0];
});


// Sounds / Music

