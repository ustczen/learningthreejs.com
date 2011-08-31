var THREEx	= THREEx 		|| {};
THREEx.Particle	= THREEx.Particle	|| {};

THREEx.Particle.Emitter	= function(opts)
{
	this._params	= opts.params	|| console.assert(false);
	this._nbItems	= opts.nbItems !== undefined ? opts.nbItems : 5000;

	this._items	= [];

	this._buildObject3d();
	this._createGeometry();
}

THREEx.Particle.Emitter.prototype._createMaterial	= function()
{
	var attributes = {
		aRotation	: { type: 'f', value: [] },
		aSize		: { type: 'f', value: [] },
		aColor		: { type: 'c', value: [] },
		aOpacity	: { type: 'f', value: [] }
	};

	var uniforms = {
		color		: { type: "c", value: new THREE.Color( 0xFFFFFF ) },
		//texture		: { type: "t", value: 0, texture: THREE.ImageUtils.loadTexture( "images/lensFlare/Flare1.png" ) }
		//texture		: { type: "t", value: 0, texture: THREE.ImageUtils.loadTexture( "images/ball.png" ) }
		texture		: { type: "t", texture: THREE.ImageUtils.loadTexture( "images/lensFlare/Shine1.png" ) }
	};

	var material = new THREE.MeshShaderMaterial({
		uniforms	: uniforms,
		attributes	: attributes,
		vertexShader	: document.getElementById( 'vertexshader' ).textContent,
		fragmentShader	: document.getElementById( 'fragmentshader' ).textContent,

		blending	: THREE.AdditiveBlending,
		depthTest	: false,
		transparent	: true
	});

	for(var i = 0; i < this._nbItems; i++ ){
		attributes.aSize	.value[i]	= 8;
		attributes.aRotation	.value[i]	= 0;
		attributes.aColor	.value[i]	= new THREE.Color( 0x000000 );
		attributes.aOpacity	.value[i]	= 1.0;
	}
	return material;
}

THREEx.Particle.Emitter.prototype._buildObject3d	= function()
{
	var geometry	= new THREE.Geometry();
	var material	= this._createMaterial();	
	this._particleSys	= new THREE.ParticleSystem( geometry, material );
}

THREEx.Particle.Emitter.prototype._createGeometry	= function()
{
	var geometry	= this._particleSys.geometry;	
	for(var i = 0; i < this._nbItems; i++){
		var item	= new THREEx.Particle.item();
		this._items.push(item);
		geometry.vertices.push( new THREE.Vertex( item.position() ) );
	}
}

THREEx.Particle.Emitter.prototype._emitItem	= function(itemIdx)
{
	var item	= this._items[itemIdx];
	var opts	= {};
	var randomValue	= function(value, range) {
		return (value-range) + Math.random()*(2*range); 
	};

	opts.position	= new THREE.Vector3( 0,0,0 );

	var originAz	= randomValue(this._params.originAzValue, this._params.originAzRange);
	opts.position.x	= Math.cos(originAz);
	opts.position.y	= Math.sin(originAz);
	opts.position.z	= 0;

	var originOffset= randomValue(this._params.originOffsetValue, this._params.originOffsetRange)
	opts.position.normalize().multiplyScalar( originOffset );

	opts.deleteIn	= this._params.timeToLive;

	var speedScalar	= randomValue(this._params.speedValue, this._params.speedRange);
	opts.speed	= new THREE.Vector3();
	opts.speed.copy(opts.position).normalize().multiplyScalar( speedScalar );


	opts.speedMul	= new THREE.Vector3(1.0, 1.0, 1.0);
	opts.speedInc	= new THREE.Vector3(0, 0, 0);
	opts.speedInc.addSelf(new THREE.Vector3(0, - this._params.gravity, 0));

	opts.color	= this._params.color.clone();
	opts.colorInc	= this._params.colorInc.clone();
	
	opts.rotation	= this._params.rotationSrc;
	opts.rotationInc= this._params.rotationInc;

	opts.size	= this._params.sizeSrc;
	opts.sizeInc	= this._params.sizeInc;

	opts.opacity	= this._params.opacitySrc;
	opts.opacityInc	= this._params.opacityInc;

	item.start(opts);
}

THREEx.Particle.Emitter.prototype.update	= function()
{
	var geometry	= this._particleSys.geometry;
	var material	= this._particleSys.materials[0];
	var attributes	= material.attributes;
	
	// compute the deltaTime since the last update - with 60hz by default
	if( ! this._lastUpdateAt )	this._lastUpdateAt = Date.now() - 1/60 * 1000;
	var deltaTime		= Date.now() - this._lastUpdateAt;
	this._lastUpdateAt	= Date.now();

	// emit particle if needed
	for(var i = 0, nbEmitted = 0; i < this._nbItems && nbEmitted < this._params.emitRate; i++){
		var item	= this._items[i];
		if( item.isDead() === false )	continue;
		this._emitItem(i);
		nbEmitted++;
	}
	
	// update each item
	for(var i = 0; i < this._nbItems; i++){
		var item	= this._items[i];
		item.update(deltaTime);

		var vertex	= geometry.vertices[i];
		vertex.position.copy( item.position() );

		// update the attributes
		attributes.aSize	.value[i]	= item.size();
		attributes.aRotation	.value[i]	= item.rotation();
		attributes.aColor	.value[i]	= item.color();
		attributes.aOpacity	.value[i]	= item.opacity();
	}

	// mark the attributes as dirty
	attributes.aSize	.needsUpdate	= true;
	attributes.aRotation	.needsUpdate	= true;
	attributes.aColor	.needsUpdate	= true;
	attributes.aOpacity	.needsUpdate	= true;

	// mark geometry as dirty
	geometry.__dirtyVertices = true;
}

THREEx.Particle.Emitter.prototype.container	= function()
{
	return this._particleSys;
}
