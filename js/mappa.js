import * as THREE from 'https://cdn.skypack.dev/three@v0.129.0-oVPEZFilCYUpzWgJBZqM/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@v0.129.0-oVPEZFilCYUpzWgJBZqM/examples/jsm/loaders/GLTFLoader.js';


var scene, camera, renderer, mesh;
var plane, ambientLight, light;

var keyboard = {};
var player = { height:1.8, speed:0.2, turnSpeed:Math.PI*0.02 };
var USE_WIREFRAME = false;


var crate, crateTexture, crateNormalMap, crateBumpMap;

var loadingScreen = {
    scene : new THREE.Scene(),
    camera : new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 1.0, 1000.0 ),
    box: new THREE.Mesh(
		new THREE.BoxGeometry(0.5,0.5,0.5),
		new THREE.MeshBasicMaterial({ color:0x4444ff })
	)
};

var loadingManager = null;
var RESOURCES_LOADED = false;

var models = {
    female_police: {
        obj: '../models/female_police/scene.gltf',
        scale: 0.01,
        mesh: null
    },
    monster: {
        obj: '../models/monster/scene.gltf',
        scale: 0.01,
        mesh: null
    }
};

var meshes = {};

function init() {
    scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 1.0, 1000.0 );

    loadingScreen.box.position.set(0,0,5);
    loadingScreen.camera.lookAt(loadingScreen.box.position);
    loadingScreen.scene.add(loadingScreen.box);

    loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = function(item, loaded, total){
		console.log(item, loaded, total);
	}; //onProgress is triggered every time one resource is loaded.
    loadingManager.onLoad = function(){
		console.log("loaded all resources");
		RESOURCES_LOADED = true;
	}; //onLoad is when all resources are loaded

    //CREATION OF THE PLANE (GRASS)
    const textureLoader = new THREE.TextureLoader();

    const tilesBaseColor = textureLoader.load('../texture_grass2/Ground037_1K_Color.jpg');
    const tilesNormalMap = textureLoader.load('../texture_grass2/Ground037_1K_NormalDX.jpg');
    const tilesHeightMap = textureLoader.load('../texture_grass2/Ground037_1K_Displacement.jpg');
    const tilesRoughness = textureLoader.load('../texture_grass2/Ground037_1K_HRoughness.jpg');
    const tilesAmbientOcclusionMap = textureLoader.load('../texture_grass2/Ground037_1K_AmbientOcclusion.jpg');

    plane = new THREE.Mesh(
        new THREE.BoxGeometry(8,0.1,7),
        new THREE.MeshLambertMaterial(
            {
                //BUMP MAPPING
                map: tilesBaseColor,
                normalMap: tilesNormalMap,
                displacementMap: tilesHeightMap,
                roughnessMap: tilesRoughness, //define which areas are rough
                roughness: 0.5,
                aoMap: tilesAmbientOcclusionMap //put the shadow areas
            }
    ));
    plane.position.x = -5;
    plane.position.y = 0;
    plane.position.z = 4;
    //plane.rotation.x -= Math.PI / 2;
    plane.geometry.attributes.uv2 = plane.geometry.attributes.uv; //this because the aoMap requires a second set of UVs 
                                                              // => Uvs are used to map the texture to a point of the geometry
    //plane.rotation.x = 10;
    //plane.rotation.y = 0.0;
    scene.add(plane);

    light = new THREE.AmbientLight(0xffffff);
    scene.add(light);

    _loadModel('../models/female_police/scene.gltf',1.3,-5,0,1);

    _loadModel('../models/monster/scene.gltf',0.15,-5,0,4);


    camera.position.set(0, player.height, -5);
	camera.lookAt(new THREE.Vector3(0,player.height,0));

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth,window.innerHeight); //render resolution
    renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;
    document.body.appendChild(renderer.domElement);

    animate();

}

function _loadModel(path,scaleValue,position_x,position_y,position_z) {
    var loaderGLTF = new GLTFLoader(loadingManager);
    loaderGLTF.load(path, function(gltf){
        mesh = gltf.scene;
        mesh.position.set(position_x,position_y,position_z);
        mesh.scale.setScalar(scaleValue);
        mesh.rotation.set(0, 10, 0);
        //models[monster].mesh = mesh;
        scene.add(mesh);
    });
}

function animate(){

	// Play the loading screen until resources are loaded.
	if( RESOURCES_LOADED == false ){
		requestAnimationFrame(animate);
		
		loadingScreen.box.position.x -= 0.05;
		if( loadingScreen.box.position.x < -10 ) loadingScreen.box.position.x = 10;
		loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);
		
		renderer.render(loadingScreen.scene, loadingScreen.camera);
		return;
	}

	requestAnimationFrame(animate);
	
	//mesh.rotation.x += 0.01;
	//mesh.rotation.y += 0.02;
	//crate.rotation.y += 0.01;
	// Uncomment for absurdity!
	// meshes["pirateship"].rotation.z += 0.01;
	
	if(keyboard[87]){ // W key
		camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
		camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[83]){ // S key
		camera.position.x += Math.sin(camera.rotation.y) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[65]){ // A key
		camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
	}
	if(keyboard[68]){ // D key
		camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
	}
	//rotate the camera on the Y (vertical) axis when left or right arrow keys are held
	if(keyboard[37]){ // left arrow key 
		camera.rotation.y -= player.turnSpeed;
	}
	if(keyboard[39]){ // right arrow key
		camera.rotation.y += player.turnSpeed;
	}
	
	renderer.render(scene, camera);
}

function keyDown(event){
	keyboard[event.keyCode] = true;
}

function keyUp(event){
	keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

window.onload = init;

