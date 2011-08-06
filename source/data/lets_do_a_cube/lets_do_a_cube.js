// This source is the javascript needed to build a simple moving
// cube in **three.js**. It is the source about this [blog post](/blog/2011/08/06/lets-do-a-cube/)

// ## Now lets start

// declare a bunch of variable we will need later
var startTime	= Date.now();
var container;
var camera, scene, renderer;
var cube;

// ## bootstrap functions
// initialiaze everything
init();
// make it move			
animate();

// ## Initialize everything
function init() {
	// create the camera
	camera = new THREE.Camera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.y = 150;
	camera.position.z = 350;
	camera.target.position.y = 150;

	// create the Scene
	scene = new THREE.Scene();

	// create the Cube
	cube = new THREE.Mesh( new THREE.CubeGeometry( 200, 200, 200 ), new THREE.MeshNormalMaterial() );
	cube.position.y = 150;

	// add the object to the scene
	scene.addObject( cube );

	// create the container element
	container = document.createElement( 'div' );
	document.body.appendChild( container );

	// init the WebGL renderer and append it to the Dom
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );
}

// ## Animate and Display the Scene
function animate() {
	// render the 3D scene
	render();
	// relaunch the 'timer' 
	requestAnimationFrame( animate );
}


// ## Render the 3D Scene
function render() {
	// animate the cube
	cube.rotation.x += 0.02;
	cube.rotation.y += 0.0225;
	cube.rotation.z += 0.0175;
	// make the cube bounce
	var dtime	= Date.now() - startTime;
	cube.scale.x	= 1.0 + 0.3*Math.sin(dtime/300);
	cube.scale.y	= 1.0 + 0.3*Math.sin(dtime/300);
	cube.scale.z	= 1.0 + 0.3*Math.sin(dtime/300);
	// actually display the scene in the Dom element
	renderer.render( scene, camera );
}
