// particle-system.js
// Definition for an event that runs a Particle System.
// Adapted from Lee Stemkoski's.   http://www.adelphi.edu/~stemkoski/

var Event = require("tpp-event");
var inherits = require("inherits");
var extend = require("extend");

function ParticleSystemEvent(base, opts) {
	Event.call(this, base, opts);
}
inherits(ParticleSystemEvent, Event);
extend(ParticleSystemEvent.prototype, {
	particlesPerSecond: 100,
	particleDeathAge: 1.0,
	particleSys: null,
	
	boundingSize: null,
	sprite: null,
	
	newParticle: function(p) {
		p.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
		p.velocity.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
		p.acceleration.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
		
		p.angle = Math.random() * 360;
		p.angleVelocity = (Math.random() - 0.5) * 180;
		p.angleAcceleration = Math.random() - 0.5;
		
		p.color.set(1, 1, 1);
		p.size = 1;
		p.opacity = 1;
	},
	
	getAvatar : function(map, gc){
		var self = this;
		this.particleSys = new ParticleEngine();
		this.particleSys.particlesPerSecond = this.particlesPerSecond;
		this.particleSys.particleDeathAge = this.particleDeathAge;
		this.particleSys.newParticle = this.newParticle;
		this.particleSys.particleTexture.image = DEF_TEXTURE_IMG;
		
		gc.collect(this.particleSys.particleTexture);
		gc.collect(this.particleSys.particleGeometry);
		gc.collect(this.particleSys.particleMaterial);
		
		// if ($.isArray(this.boundingSize)) {
		// 	var min = new THREE.Vector3(-this.boundingSize[0], 0, -this.boundingSize[1]);
		// 	var max = new THREE.Vector3( this.boundingSize[0], this.boundingSize[2], this.boundingSize[1]);
		// 	this.particleSys.particleGeometry.computeBoundingBox();
		// 	this.particleSys.particleGeometry.boundingBox.set(min, max);
		// }
		
		this.particleSys.initialize();
		
		map.markLoading("PARTICLE_"+self.id);
		map.loadSprite("_local", this.sprite, function(err, url){
			if (err) {
				console.error("ERROR LOADING PARTICLE: ", err);
				return;
			}
			
			var img = new Image();
			var f = function() {
				self.particleSys.particleTexture.image = img;
				self.particleSys.particleTexture.needsUpdate = true;
				map.markLoadFinished("PARTICLE_"+self.id);
				
				img.removeEventListener("load", f);
				img.removeEventListener("load", e);
			};
			var e = function() {
				console.error("Error while loading texture!", img.src);
				texture.needsUpdate = true; //update the missing texture pre-loaded
				map.markLoadFinished("PARTICLE_"+self.id);
				
				img.removeEventListener("load", f);
				img.removeEventListener("load", e);
			}
			img.on("load", f);
			img.on("error", e);
			
			img.src = url;
		});
		
		return this.particleSys.particleMesh;
	},
	
	onEvents: {
		tick: function(delta) {
			this.particleSys.update(delta * 0.1);
		},
	}
});
module.exports = ParticleSystemEvent;


////////////////////
// SHADERS 

var particleVertexShader = [
	"attribute vec3  customColor;",
	"attribute float customOpacity;",
	"attribute float customSize;",
	"attribute float customAngle;",
	"attribute float customVisible;",  // float used as boolean (0 = false, 1 = true)
	"varying vec4  vColor;",
	"varying float vAngle;",
	"void main()",
	"{",
		"if ( customVisible > 0.5 )", 				// true
			"vColor = vec4( customColor, customOpacity );", //     set color associated to vertex; use later in fragment shader.
		"else",							// false
			"vColor = vec4(0.0, 0.0, 0.0, 0.0);", 		//     make particle invisible.
			
		"vAngle = customAngle;",

		"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
		"gl_PointSize = customSize * ( 300.0 / length( mvPosition.xyz ) );",     // scale particles as objects in 3D space
		"gl_Position = projectionMatrix * mvPosition;",
	"}"
].join("\n");

var particleFragmentShader = [
	"uniform sampler2D texture;",
	"varying vec4 vColor;", 	
	"varying float vAngle;",   
	"void main()", 
	"{",
		"gl_FragColor = vColor;",
		
		"float c = cos(vAngle);",
		"float s = sin(vAngle);",
		"vec2 rotatedUV = vec2(c * (gl_PointCoord.x - 0.5) + s * (gl_PointCoord.y - 0.5) + 0.5,", 
		                      "c * (gl_PointCoord.y - 0.5) - s * (gl_PointCoord.x - 0.5) + 0.5);",  // rotate UV coordinates to rotate texture
	    	"vec4 rotatedTexture = texture2D( texture,  rotatedUV );",
		"gl_FragColor = gl_FragColor * rotatedTexture;",    // sets an otherwise white particle texture to desired color
	"}"
].join("\n");

///////////////////////////////////////////////////////////////////////////////

function Tween(timeArray, valueArray) {
	this.times  = timeArray || [];
	this.values = valueArray || [];
}

Tween.prototype.lerp = function(t) {
	var i = 0;
	var n = this.times.length;
	while (i < n && t > this.times[i])  
		i++;
	if (i == 0) return this.values[0];
	if (i == n)	return this.values[n-1];
	var p = (t - this.times[i-1]) / (this.times[i] - this.times[i-1]);
	if (this.values[0] instanceof THREE.Vector3)
		return this.values[i-1].clone().lerp( this.values[i], p );
	else // its a float
		return this.values[i-1] + p * (this.values[i] - this.values[i-1]);
}

///////////////////////////////////////////////////////////////////////////////

function Particle() {
	this.position     = new THREE.Vector3();
	this.velocity     = new THREE.Vector3(); // units per second
	this.acceleration = new THREE.Vector3();

	this.angle             = 0;
	this.angleVelocity     = 0; // degrees per second
	this.angleAcceleration = 0; // degrees per second, per second
	
	this.size = 1.0;

	this.color   = new THREE.Color();
	this.opacity = 1.0;
			
	this.age   = 0;
	this.alive = 0; // use float instead of boolean for shader purposes	
}
extend(Particle.prototype, {
	sizeTween: new Tween(),
	colorTween: new Tween(),
	opacityTween: new Tween(),
	
	update : function(dt) {
		this.position.add( this.velocity.clone().multiplyScalar(dt) );
		this.velocity.add( this.acceleration.clone().multiplyScalar(dt) );
		
		// convert from degrees to radians: 0.01745329251 = Math.PI/180
		this.angle         += this.angleVelocity     * 0.01745329251 * dt;
		this.angleVelocity += this.angleAcceleration * 0.01745329251 * dt;

		this.age += dt;
		
		// if the tween for a given attribute is nonempty,
		//  then use it to update the attribute's value

		if ( this.sizeTween.times.length > 0 )
			this.size = this.sizeTween.lerp( this.age );
					
		if ( this.colorTween.times.length > 0 )
		{
			var colorHSL = this.colorTween.lerp( this.age );
			this.color = new THREE.Color().setHSL( colorHSL.x, colorHSL.y, colorHSL.z );
		}
		
		if ( this.opacityTween.times.length > 0 )
			this.opacity = this.opacityTween.lerp( this.age );
	}
});


///////////////////////////////////////////////////////////////////////////////

function ParticleEngine() {
	this.particleArray = [];
	
	this.particleGeometry = new THREE.Geometry();
	this.particleTexture = new THREE.Texture();
	this.particleMaterial = new THREE.ShaderMaterial( 
	{
		uniforms: 
		{
			texture:   { type: "t", value: this.particleTexture },
		},
		attributes:     
		{
			customVisible:	{ type: 'f',  value: [] },
			customAngle:	{ type: 'f',  value: [] },
			customSize:		{ type: 'f',  value: [] },
			customColor:	{ type: 'c',  value: [] },
			customOpacity:	{ type: 'f',  value: [] }
		},
		vertexShader:   particleVertexShader,
		fragmentShader: particleFragmentShader,
		transparent: true, //alphaTest: 0.5,  // if having transparency issues, try including: alphaTest: 0.5, 
		blending: THREE.NormalBlending, depthTest: true,
		
	});
}
extend(ParticleEngine.prototype, {
	blendStyle: THREE.NormalBlending,
	
	particleArray: null,
	particlesPerSecond: 100,
	particleDeathAge: 1.0,
	particleCount: 0, // How many particles could be active at any time?
	
	emitterAge : 0.0,
	emitterCreated: 0, //number of particles emited in this system's lifetime
	emitterAlive : true,
	
	particleGeometry: null,
	particleTexture: null,
	particleMaterial: null,
	particleMesh: null,
	
	randomValue: function(base, spread){
		return base + spread * (Math.random() - 0.5);
	},
	randomVector3 : function(base, spread) {
		var rand3 = new THREE.Vector3( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 );
		return new THREE.Vector3().addVectors( base, new THREE.Vector3().multiplyVectors( spread, rand3 ) );
	},
	
	// Note: This method is meant to be replaced
	newParticle: function(p) {},
	
	initialize : function() {
		this.particleCount = this.particlesPerSecond * (this.particleDeathAge + 0.5);
		
		// link particle data with geometry/material data
		for (var i = 0; i < this.particleCount; i++)
		{
			// remove duplicate code somehow, here and in update function below.
			this.particleArray[i] = new Particle();
			this.particleGeometry.vertices[i] = this.particleArray[i].position;
			this.particleMaterial.attributes.customVisible.value[i] = this.particleArray[i].alive;
			this.particleMaterial.attributes.customColor.value[i]   = this.particleArray[i].color;
			this.particleMaterial.attributes.customOpacity.value[i] = this.particleArray[i].opacity;
			this.particleMaterial.attributes.customSize.value[i]    = this.particleArray[i].size;
			this.particleMaterial.attributes.customAngle.value[i]   = this.particleArray[i].angle;
		}
		
		this.particleMaterial.blending = this.blendStyle;
		if ( this.blendStyle != THREE.NormalBlending) 
			this.particleMaterial.depthTest = false;
		
		this.particleMesh = new THREE.PointCloud( this.particleGeometry, this.particleMaterial );
		this.particleMesh.sortParticles = true;
		this.particleMesh.renderDepth = -80;
		// scene.add( this.particleMesh );
	},
	
	update : function(dt) {
		var recycleIndices = [];
		
		var numNewParticles = 
			Math.floor(this.particlesPerSecond * (this.emitterAge + dt)) - this.emitterCreated;
			// Math.floor(this.particlesPerSecond * (this.emitterAge + dt)) -
			// Math.floor(this.particlesPerSecond * (this.emitterAge + 0));
		
		// update particle data
		for (var i = 0; i < this.particleCount; i++)
		{
			if ( this.particleArray[i].alive )
			{
				this.particleArray[i].update(dt);

				// check if particle should expire
				// could also use: death by size<0 or alpha<0.
				if ( this.particleArray[i].age > this.particleDeathAge ) 
				{
					this.particleArray[i].alive = 0.0;
					if (this.emitterAlive && recycleIndices.length < numNewParticles)
						recycleIndices.push(i);
				}
				// update particle properties in shader
				this.particleMaterial.attributes.customVisible.value[i] = this.particleArray[i].alive;
				this.particleMaterial.attributes.customColor.value[i]   = this.particleArray[i].color;
				this.particleMaterial.attributes.customOpacity.value[i] = this.particleArray[i].opacity;
				this.particleMaterial.attributes.customSize.value[i]    = this.particleArray[i].size;
				this.particleMaterial.attributes.customAngle.value[i]   = this.particleArray[i].angle;
			} else {
				if (this.emitterAlive && recycleIndices.length < numNewParticles)
					recycleIndices.push(i);
			}
		}

		// check if particle emitter is still running
		if ( !this.emitterAlive ) return;

		// activate particles
		for (var j = 0; j < recycleIndices.length; j++)
		{
			var i = recycleIndices[j];
			this.newParticle(this.particleArray[i], this.randomValue); //positions a new particle
			this.particleArray[i].age = 0;
			this.particleArray[i].alive = 1.0; // activate right away
			this.particleGeometry.vertices[i] = this.particleArray[i].position;
			this.emitterCreated++;
		}

		this.emitterAge += dt;
		if ((this.emitterAge > this.particleDeathAge)) {
			// console.log("BOUNDING RESIZE");
			this.particleGeometry.computeBoundingBox();
			this.particleGeometry.computeBoundingSphere();
		}
	}
});




