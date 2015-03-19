// door.js
// Defines a door used throughout the park.

var Warp = require("tpp-warp");
var inherits = require("inherits");
var extend = require("extend");

/**
 * A warp is an event that, when walked upon, will take the player to another map or
 * area within the same map. Different types of warps exist, ranging from the standard
 * door warp to the teleport warp. Warps can be told to activate upon stepping upon them
 * or activate upon stepping off a certain direction.
 */
function Door(base, opts) {
	Warp.call(this, base, opts);
	
}
inherits(Door, Warp);
extend(Door.prototype, {
	sound: "exit_walk",
	
	getAvatar : function(map, gc){
		var geom = new THREE.Geometry();
		{
			var vts = [];
			
			geom.vertices = [
				v( 0.000000, 0.020000,  0.050000), //1
				v( 0.000000, 0.020000, -0.050000),
				v( 1.000000, 0.020000, -0.050000),
				v( 1.000000, 0.020000,  0.050000), //4
				v( 0.000000, 1.650000,  0.050000),
				v( 0.000000, 1.650000, -0.050000),
				v( 1.000000, 1.650000, -0.050000),
				v( 1.000000, 1.650000,  0.050000), //8
				v( 0.027878, 0.065442,  0.000000),
				v( 0.972122, 0.065442,  0.000000),
				v( 0.027878, 1.604558,  0.000000),
				v( 0.972122, 1.604558,  0.000000), //12
			];
			
			vt( 1.000000, 1.000000); //1
			vt( 0.936319, 1.000000);
			vt( 0.936319, 0.000000);
			vt( 1.000000, 0.000000); //4
			vt( 0.858661, 0.990157);
			vt( 0.000000, 0.990157);
			vt( 0.000000, 0.014765);
			vt( 0.858661, 0.014765); //8
			vt( 0.936319, 0.818504);
			vt( 1.000000, 0.818504);
			vt( 0.000000, 0.000000);
			vt( 0.000000, 1.000000); //12
			
			f( "5/1 6/2 2/3 1/4", 0);
			f( "6/5 7/6 3/7 2/8", 0);
			f( "7/1 8/2 4/3 3/4", 0);
			f( "8/6 5/5 1/8 4/7", 0);
			f( "8/1 7/2 6/9 5/10", 0);
			
			f( "12/11 11/4 9/1 10/12", 1);
			
			geom.morphTargets = [
				{
					name: "width", vertices: [
						v( 0.000000, 0.020000,  0.050000), //1
						v( 0.000000, 0.020000, -0.050000),
						v( 1.000000, 0.020000, -0.050000),
						v( 1.000000, 0.020000,  0.050000), //4
						v( 0.000000, 1.650000,  0.050000),
						v( 0.000000, 1.650000, -0.050000),
						v( 1.000000, 1.650000, -0.050000),
						v( 1.000000, 1.650000,  0.050000), //8
						v( 0.027878, 0.065442,  0.000000),
						v( 0.972122, 0.065442,  0.000000),
						v( 0.027878, 1.604558,  0.000000),
						v( 0.972122, 1.604558,  0.000000), //12
					],
				},
				{
					name: "height", vertices: [
						v( 0.000000, 0.020000,  0.050000), //1
						v( 0.000000, 0.020000, -0.050000),
						v( 1.000000, 0.020000, -0.050000),
						v( 1.000000, 0.020000,  0.050000), //4
						v( 0.000000, 1.750000,  0.050000),
						v( 0.000000, 1.750000, -0.050000),
						v( 1.000000, 1.750000, -0.050000),
						v( 1.000000, 1.750000,  0.050000), //8
						v( 0.027878, 0.065442,  0.000000),
						v( 0.972122, 0.065442,  0.000000),
						v( 0.027878, 1.704558,  0.000000),
						v( 0.972122, 1.704558,  0.000000), //12
					],
				},
			];
			
			//--------------------------------------------------------------------//
			function v(x, y, z) { return new THREE.Vector3(x, y, z); }
			function vt(x, y) { vts.push(new THREE.Vector2(x, y)); }
			
			function f4(facestr, mati) {
				var strlist = facestr.split(" ");
				for (var i = 0; i < strlist.length; i++) {
					strlist = strlist[i].split("/");
				}
				
				geom.faces.push(new THREE.Face3( 
					geom.vertices[ strlist[0][0] ],
					geom.vertices[ strlist[1][0] ],
					geom.vertices[ strlist[3][0] ],
					undefined, undefined, mati
				));
				geom.faces.push(new THREE.Face3( 
					geom.vertices[ strlist[1][0] ],
					geom.vertices[ strlist[2][0] ],
					geom.vertices[ strlist[3][0] ],
					undefined, undefined, mati
				));
				
				geom.faceVertexUvs[0].push([
					vts[ strlist[0][1] ],
					vts[ strlist[1][1] ],
					vts[ strlist[3][1] ],
				]);
				geom.faceVertexUvs[0].push([
					vts[ strlist[1][1] ],
					vts[ strlist[2][1] ],
					vts[ strlist[3][1] ],
				]);
			}
		}
		
		return null; 
	},
	
});
module.exports = Door;