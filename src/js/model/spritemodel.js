// spritemodel.js
// A redux of the THREE.js sprite, but not using the sprite plugin

var inherits = require("inherits");
var extend = require("extend");

function CharacterSprite(opts) {
	if (!(this instanceof CharacterSprite)) {
		return new CharacterSprite(opts);
	}
	var gc = opts.gc || GC.getBin();
	
	opts = extend({
		transparent: true,
		alphaTest: true,
	}, opts);
	
	if (!opts.offset) opts.offset = new THREE.Vector3(0, 0, 0);
	
	//TODO replace with geometry we can control
	// var geom = new THREE.PlaneBufferGeometry(1, 1);
	var geom = new CharacterPlaneGeometry(opts.offset);
	gc.collect(geom);
	
	var mat = new CharacterSpriteMaterial(opts);
	gc.collect(mat);
	
	THREE.Mesh.call(this, geom, mat);
	this.type = "CharacterSprite";
	
	mat.scale = mat.uniforms.scale.value = this.scale;
	
	Object.defineProperties(this, {
		width: {
			get: function() {
				return Math.floor((this.morphTargetInfluences[0] + 1) * 32);
			},
			set: function(val) {
				this.morphTargetInfluences[0] = (val / 32) - 1;
			},
		},
		height: {
			get: function() {
				return Math.floor((this.morphTargetInfluences[1] + 1) * 32);
			},
			set: function(val) {
				this.morphTargetInfluences[1] = (val / 32) - 1;
			},
		},
	});
}
inherits(CharacterSprite, THREE.Mesh);
module.exports.CharacterSprite = CharacterSprite;


function CharacterSpriteMaterial(opts) {
	if (!(this instanceof CharacterSpriteMaterial)) {
		return new CharacterSpriteMaterial(opts);
	}
	
	//TODO write it so when we replace the values here, we replace the ones in the uniforms
	// Object.defineProperties(this, {
	// 	uvOffset : {}
	// });

	this.map = opts.map || new THREE.Texture();
	
	this.uvOffset = opts.uvOffset || this.map.offset || new THREE.Vector2(0, 0);
	this.uvScale = opts.uvScale || this.map.repeat || new THREE.Vector2(1, 1);
	
	this.rotation = opts.rotation || 0;
	this.scale = opts.scale || new THREE.Vector2(1, 1);
	
	this.color = (opts.color instanceof THREE.Color)? opts.color : new THREE.Color(opts.color);
	this.opacity = opts.opacity || 1;
	
	var params = this._createMatParams(opts);
	THREE.ShaderMaterial.call(this, params);
	this.type = "CharacterSpriteMaterial";
	
	this.transparent = (opts.transparent !== undefined)? opts.transparent : true;
	this.alphaTest = 0.05;
	// this.depthWrite = false;
	this.morphTargets = true;
}
inherits(CharacterSpriteMaterial, THREE.ShaderMaterial);
extend(CharacterSpriteMaterial.prototype, {
	map : null,
	
	_createMatParams : function() {
		sheermat = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, -0.009,
			0, 0, 0, 1,
		];
		
		var params = {
			uniforms : {
				uvOffset:	{ type: "v2", value: this.uvOffset },
				uvScale:	{ type: "v2", value: this.uvScale },
				
				rotation:	{ type: "f", value: this.rotation },
				scale:		{ type: "v2", value: this.scale },
				
				color:		{ type: "c", value: this.color },
				map:		{ type: "t", value: this.map },
				opacity:	{ type: "f", value: this.opacity },
				
				zoffset:	{ type: "f", value: -0.009 },
				sheer:		{ type: "m4", value: new THREE.Matrix4() },
				
				morphTargetInfluences : { type: "f", value: 0 },
			},
		};
		
		params.vertexShader = this._vertShader;
		params.fragmentShader = this._fragShader;
		return params;
	},
	
	_vertShader: [
		// 'uniform mat4 modelViewMatrix;',
		// 'uniform mat4 projectionMatrix;',
		'uniform float rotation;',
		'uniform vec2 scale;',
		'uniform vec2 uvOffset;',
		'uniform vec2 uvScale;',
		
		'uniform float zoffset;',
		'uniform mat4 sheer;',
		
		'#ifdef USE_MORPHTARGETS',
		"uniform float morphTargetInfluences[ 8 ];",
		'#endif',

		// 'attribute vec2 position;',
		// 'attribute vec2 uv;',

		'varying vec2 vUV;',

		'void main() {',

			'vUV = uvOffset + uv * uvScale;',

			"vec3 morphed = vec3( 0.0 );",
			
			'#ifdef USE_MORPHTARGETS', 
			"morphed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];",
			"morphed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];",
			"morphed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];",
			"morphed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];",
			"morphed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];",
			"morphed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];",
			"morphed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];",
			"morphed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];",
			'#endif',
			
			"morphed += position;",

			'vec2 alignedPosition = morphed.xy * scale;',

			'vec2 rotatedPosition;',
			'rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;',
			'rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;',
			
			'mat4 zsheer = mat4(1, 0, 0, 0,',
				               '0, 1, 0, 0,',
				               '0, 0, 1, position.y * zoffset,',
				               '0, 0, 0, 1);',

			'vec4 sheerforce = modelViewMatrix * vec4(0, position.y, position.z, 1);',
			
			'vec4 finalPosition;',

			'finalPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );',
			'finalPosition.w += (sheerforce.z - finalPosition.z) * zoffset;',
			'finalPosition.xy += rotatedPosition;',
			'finalPosition = zsheer * finalPosition;',
			'finalPosition = sheer * finalPosition;',
			'finalPosition = projectionMatrix * finalPosition;',
			
			'gl_Position = finalPosition;',

		'}'
	].join( '\n' ),
	
	_fragShader: [
		'uniform vec3 color;',
		'uniform sampler2D map;',
		'uniform float opacity;',

		'uniform vec3 fogColor;',
		'uniform float fogDensity;',
		'uniform float fogNear;',
		'uniform float fogFar;',

		'varying vec2 vUV;',

		'void main() {',

			'vec4 texture = texture2D( map, vUV );',

			'#ifdef ALPHATEST',
				'if ( texture.a < ALPHATEST ) discard;',
			'#endif',

			'gl_FragColor = vec4( color * texture.xyz, texture.a * opacity );',

			'#ifdef USE_FOG',
				'float depth = gl_FragCoord.z / gl_FragCoord.w;',
				'float fogFactor = 0.0;',
				
				'#ifndef FOG_EXP2', //note: NOT defined
				
					'fogFactor = smoothstep( fogNear, fogFar, depth );',
					
				'#else',
				
					'const float LOG2 = 1.442695;',
					'float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );',
					'fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );',

				'#endif',
				
				'gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );',

			'#endif',

		'}'
	].join( '\n' ),
});
module.exports.CharacterSpriteMaterial = CharacterSpriteMaterial;



function CharacterPlaneGeometry(off) {
	THREE.Geometry.call(this);
	
	this.type = "CharacterPlaneGeometry";
	this.vertices = [
		new THREE.Vector3( -0.5 + off.x, -0.5 + off.y, 0 + off.z ),
		new THREE.Vector3(  0.5 + off.x, -0.5 + off.y, 0 + off.z ),
		new THREE.Vector3(  0.5 + off.x,  0.5 + off.y, 0 + off.z ),
		new THREE.Vector3( -0.5 + off.x,  0.5 + off.y, 0 + off.z ),
	];
	
	this.faces.push(new THREE.Face3(0, 1, 2));
	this.faces.push(new THREE.Face3(0, 2, 3));
	
	this.faceVertexUvs[0].push([ uv(0, 0), uv(1, 0), uv(1, 1) ]);
	this.faceVertexUvs[0].push([ uv(0, 0), uv(1, 1), uv(0, 1) ]);
	
	this.morphTargets = [
		{ name: "width", vertices: [
			new THREE.Vector3( -0.5 + off.x - 0.5, -0.5 + off.y, 0 + off.z ),
			new THREE.Vector3(  0.5 + off.x + 0.5, -0.5 + off.y, 0 + off.z ),
			new THREE.Vector3(  0.5 + off.x + 0.5,  0.5 + off.y, 0 + off.z ),
			new THREE.Vector3( -0.5 + off.x - 0.5,  0.5 + off.y, 0 + off.z ),
		] },
		{ name: "height", vertices: [
			new THREE.Vector3( -0.5 + off.x, -0.5 + off.y    , 0 + off.z ),
			new THREE.Vector3(  0.5 + off.x, -0.5 + off.y    , 0 + off.z ),
			new THREE.Vector3(  0.5 + off.x,  0.5 + off.y + 1, 0 + off.z ),
			new THREE.Vector3( -0.5 + off.x,  0.5 + off.y + 1, 0 + off.z ),
		] },
	];
	
	function uv(x, y) { return new THREE.Vector2(x, y); }
}
inherits(CharacterPlaneGeometry, THREE.Geometry);

//////////////////////////////////////////////////////////////////////////////////////



function BubbleSprite() {
	if (!(this instanceof BubbleSprite)) {
		return new BubbleSprite();
	}
	
	//TODO replace with geometry we can control
	// var geom = new THREE.PlaneBufferGeometry(1, 1);
	var geom = new BubblePlaneGeometry(new THREE.Vector3(0, 0, 0));
	
	
	var tex = this._tex = new THREE.Texture();
	tex.magFilter = THREE.NearestFilter;
	tex.minFilter = THREE.NearestFilter;
	tex.anisotropy = 1;
	tex.generateMipmaps = false;
	tex.repeat = new THREE.Vector2(16/128, 16/64);
	tex.offset = new THREE.Vector2(0, 0);
	
	var img = new Image();
	function f(){
		tex.image = img;
		tex.needsUpdate = true;
		img.removeEventListener("load", f);
	}
	img.on("load", f);
	
	img.src = BASEURL+"/img/ui/emote_bubble.png";
	
	var mat = this._mat = new CharacterSpriteMaterial({
		map: tex,
		morphTargets: true,
		transparent: true,
		alphaTest: 0.05,
	});
	mat.uniforms.zoffset.value = -0.02;
	
	
	THREE.Mesh.call(this, geom, mat);
	this.type = "BubbleSprite";
	
	mat.scale = mat.uniforms.scale.value = this.scale;
	
	Object.defineProperties(this, {
		xoff: {
			get: function() {
				return Math.floor((this.morphTargetInfluences[0] + 1) * 32);
			},
			set: function(val) {
				this.morphTargetInfluences[0] = (val / 32) - 1;
			},
		},
		height: {
			get: function() {
				return Math.floor((this.morphTargetInfluences[1] + 1) * 32);
			},
			set: function(val) {
				this.morphTargetInfluences[1] = (val / 32) - 1;
			},
		},
		shrink: {
			get: function() {
				return (this.morphTargetInfluences[2]);
			},
			set: function(val) {
				this.morphTargetInfluences[2] = Math.clamp(val);
			},
		},
	});
	this.shrink = 1;
}
inherits(BubbleSprite, THREE.Mesh);
extend(BubbleSprite.prototype, {
	_tex: null,
	_mat: null,
	type: null,
	__types : {	//	 x1 y1 x2 y2
		"blank":	[ 0, 0, 0, 0],
		"...": 		[ 0, 3, 1, 3],
		"!": 		[ 0, 2, 1, 2], "exclaim" : "!",
		"?": 		[ 0, 1, 1, 1], "question": "?",
		"sing": 	[ 2, 3, 3, 3],
		"<3": 		[ 2, 2, 3, 2], "heart": "<3",
		"posion": 	[ 2, 1, 3, 1],
		":)": 		[ 4, 3, 5, 3], "happy": ":)",
		":D": 		[ 4, 2, 5, 2], "excited": ":D",
		":(": 		[ 4, 1, 5, 1], "sad": ":(",
		">:(":		[ 6, 3, 7, 3], "disagree": ">:(",
		"D:<": 		[ 6, 2, 7, 2], "angry": "D:<",
		">:)": 		[ 6, 1, 7, 1], "evil": ">:)",
	},
	
	setType : function(type) {
		this.type = this.__types[type];
		while (this.type && !$.isArray(this.type)) {
			this.type = this.__types[this.type];
		}
		if (!this.type) {
			this.type = this.__types["blank"];
			this.timeout = 1;
		}
		this._alpha = 0;
		this._frameno = 0;
		this._tick(0);
	},
	
	setTimeout: function(to) {
		this.timeout = to;
	},
	
	_show_callback: null,
	_hide_callback: null,
	_opacity_dest: 0,
	_opacity_curr: 0,
	show: function(callback) {
		// this.visible = true;
		this._opacity_dest = 1;
		this._show_callback = callback;
	},
	hide: function(callback) {
		// this.visible = false;
		this._opacity_dest = 0;
		this._show_callback = callback;
	},
	
	_alpha: 0,
	_frameno: 0,
	_tick: function(delta) {
		if (!this.type) return;
		var self = this;
		this._alpha -= delta;
		
		if (this.timeout > 0) {
			this.timeout -= delta;
			if (this.timeout < 0) {
				this.hide(function(){
					self.release();
				});
			}
		}
		
		if (this._opacity_curr > this._opacity_dest) {
			this._opacity_curr -= (delta * CONFIG.speed.bubblepop);
			this.shrink = 1-this._opacity_curr;
			this._mat.opacity = Math.clamp(this._opacity_curr);
			if (this._opacity_curr <= this._opacity_dest) {
				if (this._hide_callback) {
					this._hide_callback();
					this._hide_callback = null;
				}
				this._opacity_curr = Math.clamp(this._opacity_curr);
			}
		}
		else if (this._opacity_curr < this._opacity_dest) {
			this._opacity_curr += (delta * CONFIG.speed.bubblepop);
			this.shrink = 1-this._opacity_curr;
			this._mat.opacity = Math.clamp(this._opacity_curr);
			if (this._opacity_curr >= this._opacity_dest) {
				if (this._show_callback) {
					this._show_callback();
					this._show_callback = null;
				}
				this._opacity_curr = Math.clamp(this._opacity_curr);
			}
		}
		
		if (this._alpha <= 0) {
			this._alpha = 5;
			
			this._frameno = (this._frameno + 1) % 2;
			var fn = this._frameno * 2;
			
			this._tex.offset.x = this.type[fn  ] * this._tex.repeat.x;
			this._tex.offset.y = this.type[fn+1] * this._tex.repeat.y;
		}
	},
});
module.exports.BubbleSprite = BubbleSprite;


function BubblePlaneGeometry(off) {
	THREE.Geometry.call(this);
	var BSIZE = 0.38;
	
	this.type = "BubblePlaneGeometry";
	this.vertices = [
		new THREE.Vector3( -BSIZE + off.x, 1.5 - BSIZE + off.y, -0.01 + off.z ),
		new THREE.Vector3(  BSIZE + off.x, 1.5 - BSIZE + off.y, -0.01 + off.z ),
		new THREE.Vector3(  BSIZE + off.x, 1.5 + BSIZE + off.y, -0.01 + off.z ),
		new THREE.Vector3( -BSIZE + off.x, 1.5 + BSIZE + off.y, -0.01 + off.z ),
	];
	
	this.faces.push(new THREE.Face3(0, 1, 2));
	this.faces.push(new THREE.Face3(0, 2, 3));
	
	this.faceVertexUvs[0].push([ uv(0.005, 0.005), uv(0.995, 0.005), uv(0.995, 0.995) ]);
	this.faceVertexUvs[0].push([ uv(0.005, 0.005), uv(0.995, 0.995), uv(0.005, 0.995) ]);
	
	this.morphTargets = [
		{ name: "offx", vertices: [
			new THREE.Vector3( -BSIZE + off.x + 1, 1 - BSIZE + off.y, -0.01 + off.z ),
			new THREE.Vector3(  BSIZE + off.x + 1, 1 - BSIZE + off.y, -0.01 + off.z ),
			new THREE.Vector3(  BSIZE + off.x + 1, 1 + BSIZE + off.y, -0.01 + off.z ),
			new THREE.Vector3( -BSIZE + off.x + 1, 1 + BSIZE + off.y, -0.01 + off.z ),
		] },
		{ name: "height", vertices: [
			new THREE.Vector3( -BSIZE + off.x, 1 - BSIZE + off.y + 1, -0.01 + off.z ),
			new THREE.Vector3(  BSIZE + off.x, 1 - BSIZE + off.y + 1, -0.01 + off.z ),
			new THREE.Vector3(  BSIZE + off.x, 1 + BSIZE + off.y + 1, -0.01 + off.z ),
			new THREE.Vector3( -BSIZE + off.x, 1 + BSIZE + off.y + 1, -0.01 + off.z ),
		] },
		{ name: "shrink", vertices: [
			new THREE.Vector3( off.x, 1 + off.y, -0.01 + off.z ),
			new THREE.Vector3( off.x, 1 + off.y, -0.01 + off.z ),
			new THREE.Vector3( off.x, 1 + off.y, -0.01 + off.z ),
			new THREE.Vector3( off.x, 1 + off.y, -0.01 + off.z ),
		] },
	];
	
	function uv(x, y) { return new THREE.Vector2(x, y); }
}
inherits(BubblePlaneGeometry, THREE.Geometry);


//////////////////////////////////////////////////////////////////////////////////


function SpriteGlowMaterial(opts) {
	if (!(this instanceof SpriteGlowMaterial)) {
		return new SpriteGlowMaterial(opts);
	}
	
	//TODO write it so when we replace the values here, we replace the ones in the uniforms
	// Object.defineProperties(this, {
	// 	uvOffset : {}
	// });

	this.color = (opts.color instanceof THREE.Color)? opts.color : new THREE.Color(opts.color);
	// this.opacity = opts.opacity || 1;
	
	var params = this._createMatParams(opts);
	THREE.ShaderMaterial.call(this, params);
	this.type = "SpriteGlowMaterial";
	
	this.transparent = (opts.transparent !== undefined)? opts.transparent : true;
	this.alphaTest = 0.05;
	// this.depthWrite = false;
}
inherits(SpriteGlowMaterial, THREE.ShaderMaterial);
extend(SpriteGlowMaterial.prototype, {
	map : null,
	
	_createMatParams : function() {
		var params = {
			uniforms : {
				"c":   { type: "f", value: 1.0 },
				"p":   { type: "f", value: 1.4 },
				glowColor: { type: "c", value: this.color },//new THREE.Color(0xffff00) },
				// viewVector: { type: "v3", value: camera.position }
			},
		};
		
		params.vertexShader = this._vertShader;
		params.fragmentShader = this._fragShader;
		params.blending = THREE.AdditiveBlending;
		return params;
	},
	
	_vertShader: [
		// "uniform vec3 viewVector;",
		"uniform float c;",
		"uniform float p;",
		"varying float intensity;",
		
		"void main() {",
			"vec3 vNorm = normalize( normalMatrix * normal );",
			// "vec3 vNormCamera = normalize( normalMatrix * viewVector );",
			"vec3 vNormCamera = normalize( normalMatrix * normalize( modelViewMatrix * vec4(0, 0, 1, 1) ).xyz );",
			"intensity = pow( c - dot(vNorm, vNormCamera), p );",
			
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}",
	].join("\n"),
	
	_fragShader: [
		"uniform vec3 glowColor;",
		"varying float intensity;",
		
		"void main() {",
			"vec3 glow = glowColor * intensity;",
			"gl_FragColor = vec4( glow, 1.0 );",
		"}",
	].join("\n"),
});
module.exports.SpriteGlowMaterial = SpriteGlowMaterial;
