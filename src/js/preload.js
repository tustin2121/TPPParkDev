// preload.js
// Included in the main html file to be loaded before the 
//  async'ed js files are finished loading.


// Images / Textures / Sprites
window.AJAX_TEXTURE = BASEURL+"/img/ui/helix_doritos.png";
window.DEF_TEXTURE = BASEURL+"/img/missing_tex.png";
window.DEF_SPRITE = BASEURL+"/img/missing_sprite.png";
window.DEF_SPRITE_FORMAT = "pt_horzrow-32";

window.AJAX_TEXTURE_IMG = $("<img>").attr("src", AJAX_TEXTURE)[0];
window.DEF_TEXTURE_IMG = $("<img>").attr("src", DEF_TEXTURE)[0];
window.DEF_SPRITE_IMG = $("<img>").attr("src", DEF_SPRITE)[0];

$(function(){
	$(AJAX_TEXTURE_IMG).css({display:"none"}).appendTo("body");
	$(DEF_TEXTURE_IMG).css({display:"none"}).appendTo("body");
	$(DEF_SPRITE_IMG).css({display:"none"}).appendTo("body");
});


// Sounds / Music
window.DORITO_MUSIC = $("<audio>").attr({
			autoplay: false,
			autobuffer: true,
			preload: "auto",
			src: BASEURL+"/snd/m_tornworld.mp3"
		})[0];

$(function(){
	$(DORITO_MUSIC).css({display:"none"}).appendTo("body");
});