// map.js

function Map(opts){
	
}

Map.prototype = {
	tiledata : null,
	
	camera : null,
	scene : null,
	
	/**
	 *  Reads the tile data and begins loading the required resources.
	 */
	load : function(){
		
	},
	
	/**
	 * Creates the map for display from the stored data.
	 */
	init : function(){
		this.scene = new THREE.Scene();
		
		var scrWidth = $("#gamescreen").width();
		var scrHeight = $("#gamescreen").height();
		switch(tiledata.properties.camera) {
			case "ortho":
				this.camera = new THREE.OrthographicCamera(scrWidth/-2, scrWidth/2, scrHeight/2, scrHeight/-2, 1, 1000);
				this.camera.position.y = 100;
				this.camera.roation.x = -Math.PI / 2;
				break;
			case "gen4":
				this.camera = new THREE.PerspectiveCamera(75, scrWidth / scrHeight, 1, 1000);
				this.camera.position.y = 10;
				this.camera.roation.x = -55 * (Math.PI / 180);
				break;
		}
		this.scene.add(this.camera);
		
		
	},
}