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
	var geom = new CharacterPlaneGeometry(opts.offset.x, opts.offset.y, opts.offset.z);
	gc.collect(geom);
	
	var mat = new CharacterSpriteMaterial(opts);
	gc.collect(mat);
	
	THREE.Mesh.call(this, geom, mat);
	this.type = "CharacterSprite";
	
	mat.scale = mat.uniforms.scale.value = this.scale;
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
}
inherits(CharacterSpriteMaterial, THREE.ShaderMaterial);
extend(CharacterSpriteMaterial.prototype, {
	map : null,
	
	_createMatParams : function() {
		var params = {
			uniforms : {
				uvOffset:	{ type: "v2", value: this.uvOffset },
				uvScale:	{ type: "v2", value: this.uvScale },
				
				rotation:	{ type: "f", value: this.rotation },
				scale:		{ type: "v2", value: this.scale },
				
				color:		{ type: "c", value: this.color },
				map:		{ type: "t", value: this.map },
				opacity:	{ type: "f", value: this.opacity },
				
				zoffset:	{ type: "f", value: 0 },
				sheer:		{ type: "m4", value: new THREE.Matrix4() },
			},
		};
		
		params.vertexShader = VERT_SHADER;
		params.fragmentShader = FRAG_SHADER;
		return params;
	},
});
module.exports.CharacterSpriteMaterial = CharacterSpriteMaterial;



function CharacterPlaneGeometry(xoff, yoff, zoff) {
	THREE.BufferGeometry.call(this);
	
	this.type = "CharacterPlaneGeometry";
	
	var verts = new Float32Array([
		-0.5 + xoff, -0.5 + yoff, 0 + zoff,
		 0.5 + xoff, -0.5 + yoff, 0 + zoff,
		 0.5 + xoff,  0.5 + yoff, 0 + zoff,
		-0.5 + xoff,  0.5 + yoff, 0 + zoff,
	]);
	var norms = new Float32Array([ 0, 1, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1, ]);
	var uvs   = new Float32Array([ 0, 0,      1, 0,      1, 1,      0, 1, ]);
	var faces = new Uint16Array( [ 0, 1, 2,   0, 2, 3 ]);
	
	this.addAttribute( 'index', new THREE.BufferAttribute( faces, 1 ) );
	this.addAttribute( 'position', new THREE.BufferAttribute( verts, 3 ) );
	this.addAttribute( 'normal', new THREE.BufferAttribute( norms, 3 ) );
	this.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
	
}
inherits(CharacterPlaneGeometry, THREE.BufferGeometry);




var VERT_SHADER = [
	// 'uniform mat4 modelViewMatrix;',
	// 'uniform mat4 projectionMatrix;',
	'uniform float rotation;',
	'uniform vec2 scale;',
	'uniform vec2 uvOffset;',
	'uniform vec2 uvScale;',
	
	'uniform float zoffset;',
	'uniform mat4 sheer;',

	// 'attribute vec2 position;',
	// 'attribute vec2 uv;',

	'varying vec2 vUV;',

	'void main() {',

		'vUV = uvOffset + uv * uvScale;',

		'vec2 alignedPosition = position.xy * scale;',

		'vec2 rotatedPosition;',
		'rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;',
		'rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;',
		
		// 'mat4 zsheer = mat4(1, 0, 0, 0,',
		// 	               '0, 1, 0, 0,',
		// 	               '0, 0, 1, position.y * zoffset,',
		// 	               '0, 0, 0, 1);',

		// 'vec4 sheerforce = modelViewMatrix * vec4(0, position.y, position.z, 1);',
		
		'vec4 finalPosition;',

		'finalPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );',
		// 'finalPosition.w += (sheerforce.z - finalPosition.z) * zoffset;',
		'finalPosition.xy += rotatedPosition;',
		// 'finalPosition = zsheer * finalPosition;',
		'finalPosition = projectionMatrix * finalPosition;',
		
		'gl_Position = finalPosition;',

	'}'
].join( '\n' );

var FRAG_SHADER = [
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
].join( '\n' );


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
