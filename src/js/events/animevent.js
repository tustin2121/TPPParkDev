// animevent.js
// Defines an AnimEvent, which is a basic event that animates map elements

var Event = require("tpp-event");
var inherits = require("inherits");
var extend = require("extend");

/**
 * An AnimEvent is an convience event for animation objects on the map,
 * be it a texture animation or moving a model in some fashion.
 */
function AnimEvent(base, opts) {
	Event.call(this, base, opts);
	
	this.on("tick", this.onTick);
}
inherits(AnimEvent, Event);
extend(AnimEvent.prototype, {
	location: [0, 0], //default to an inaccessable location, top corner of the map
	
	getAvatar: function(map) {
		return null;
	},
	
	onTick : function(delta) {
	},
});
module.exports = AnimEvent;



function WaterAnimEvent(opts) {
	AnimEvent.call(this, {
		id: "ANIM_Water",
		tex_x : [], //water flow x
		tex_y : [], //water flow y
		tex_b : [], //water flow x and y
		
		name_regex: null, //only collect the named assets
		speed: 0.2,
		yaugment: 1.2,
		
		getAvatar: function(map) {
			var ch = map.mapmodel.children;
			for (var i = 0; i < ch.length; i++) {
				
				if (this.name_regex) {
					// If in named regex mode, skip over things that don't match the name
					if (!this.name_regex.test(ch[i].name)) continue;
				} 
				
				if (/\!WATEX$/.test(ch[i].name)) {
					for (var j = 0; j < ch[i].children.length; j++) {
						var mesh = ch[i].children[j];
						if (!(mesh instanceof THREE.Mesh)) continue;
						
						this.tex_x.push(mesh.material.map);
					}
				}
				if (/\!WATEY$/.test(ch[i].name)) {
					for (var j = 0; j < ch[i].children.length; j++) {
						var mesh = ch[i].children[j];
						if (!(mesh instanceof THREE.Mesh)) continue;
						
						this.tex_y.push(mesh.material.map);
					}
				}
				if (/\!WATEB$/.test(ch[i].name)) {
					for (var j = 0; j < ch[i].children.length; j++) {
						var mesh = ch[i].children[j];
						if (!(mesh instanceof THREE.Mesh)) continue;
						
						this.tex_b.push(mesh.material.map);
					}
				}
			}
		},
		
		onTick: function(delta) {
			for (var i = 0; i < this.tex_b.length; i++) {
				var off = this.tex_b[i].offset.x;
				off += delta * this.speed;
				this.tex_b[i].offset.set(off, off * this.yaugment);
				this.tex_b[i].needsUpdate = true;
			}
			for (var i = 0; i < this.tex_x.length; i++) {
				this.tex_x[i].offset.x += delta * this.speed;
				this.tex_x[i].needsUpdate = true;
			}
			for (var i = 0; i < this.tex_y.length; i++) {
				this.tex_y[i].offset.y += delta * this.speed;
				this.tex_y[i].needsUpdate = true;
			}
		},
		
	}, opts);
}
inherits(WaterAnimEvent, AnimEvent);
module.exports.Water = WaterAnimEvent;

function WaterRippleAnimEvent(opts) {
	AnimEvent.call(this, {
		id: "ANIM_WaterRipple",
		tex_r : [], //water ripple
		
		name_regex: null, //only collect the named assets
		speed: 1,
		yaugment: 1.2,
		amplitude: 0.03,
		
		_delta: 0,
		
		getAvatar: function(map) {
			var ch = map.mapmodel.children;
			for (var i = 0; i < ch.length; i++) {
				
				if (this.name_regex) {
					// If in named regex mode, skip over things that don't match the name
					if (!this.name_regex.test(ch[i].name)) continue;
				} 
				
				if (/\!WATER$/.test(ch[i].name)) {
					for (var j = 0; j < ch[i].children.length; j++) {
						var mesh = ch[i].children[j];
						if (!(mesh instanceof THREE.Mesh)) continue;
						
						this.tex_r.push(mesh.material.map);
					}
				}
			}
		},
		
		onTick: function(delta) {
			this._delta += delta * this.speed;
			for (var i = 0; i < this.tex_r.length; i++) {
				var off = Math.sin(this._delta) * this.amplitude;
				this.tex_r[i].offset.set(off, off * this.yaugment);
				this.tex_r[i].needsUpdate = true;
			}
		},
		
	}, opts);
}
inherits(WaterRippleAnimEvent, AnimEvent);
module.exports.SineRipple = WaterRippleAnimEvent;
