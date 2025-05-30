import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { universityData } from './data';
import { showExperiencePanel } from './experience-panel';

// Create the scene
const scene = new THREE.Scene();

// Create the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);

// Create the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('globe-container').appendChild(renderer.domElement);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// Load the Earth texture
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load('path/to/earth_texture.jpg');
const earthBumpMap = textureLoader.load('path/to/earth_bump_map.jpg');
const earthSpecularMap = textureLoader.load('path/to/earth_specular_map.jpg');

// Create the Earth geometry and material
const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture,
    bumpMap: earthBumpMap,
    bumpScale: 0.05,
    specularMap: earthSpecularMap,
    specular: new THREE.Color('grey')
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Add light to the scene
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 3, 5);
scene.add(directionalLight);

// Add location markers
const markerGeometry = new THREE.SphereGeometry(0.02, 16, 16);
const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

universityData.forEach(university => {
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    const { latitude, longitude } = university.coordinates;
    const phi = (90 - latitude) * (Math.PI / 180);
    const theta = (longitude + 180) * (Math.PI / 180);

    marker.position.set(
        1 * Math.sin(phi) * Math.cos(theta),
        1 * Math.cos(phi),
        1 * Math.sin(phi) * Math.sin(theta)
    );

    marker.userData = university;
    scene.add(marker);
});

// Handle marker interactions
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        if (intersectedObject.userData) {
            const university = intersectedObject.userData;
            animateCameraToLocation(intersectedObject.position);
            showExperiencePanel(university);
        }
    }
}

function animateCameraToLocation(position) {
    const duration = 2000;
    const startPosition = camera.position.clone();
    const endPosition = position.clone().multiplyScalar(1.5);

    new TWEEN.Tween(startPosition)
        .to(endPosition, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            camera.position.copy(startPosition);
            camera.lookAt(earth.position);
        })
        .start();
}

window.addEventListener('mousemove', onMouseMove);
window.addEventListener('click', onClick);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    earth.rotation.y += 0.001;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    intersects.forEach(intersect => {
        if (intersect.object.userData) {
            const university = intersect.object.userData;
            // Display university name and country on hover
            // This can be implemented using a tooltip or similar UI element
        }
    });

    renderer.render(scene, camera);
}

animate();
