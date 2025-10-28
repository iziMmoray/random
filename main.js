import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x040414, 0.6);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050817, 0.08);

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  120
);
camera.position.set(0, 2.2, 10);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.maxDistance = 18;
controls.minDistance = 4;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.85;
controls.addEventListener('start', () => {
  controls.autoRotate = false;
});
controls.addEventListener('end', () => {
  controls.autoRotate = true;
});

const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0x7b5cfa, 1.5);
keyLight.position.set(-4, 6, 7);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0x0ff4c6, 1.2, 40);
rimLight.position.set(6, 4, -6);
scene.add(rimLight);

const rig = new THREE.Group();
scene.add(rig);

const group = new THREE.Group();
rig.add(group);

const animatedMeshes = [];

const starField = createStarField();
scene.add(starField);

function createStarField() {
  const starGeometry = new THREE.BufferGeometry();
  const count = 700;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const radius = 30 * Math.random() + 8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const starMaterial = new THREE.PointsMaterial({
    size: 0.3,
    sizeAttenuation: true,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
  });

  return new THREE.Points(starGeometry, starMaterial);
}

function disposeMesh(mesh) {
  if (mesh.geometry) mesh.geometry.dispose();
  if (mesh.material) {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((material) => material.dispose());
    } else {
      mesh.material.dispose();
    }
  }
}

function paletteFromSeed(seed) {
  const baseHue = (seed * 360) % 360;
  const palette = [
    new THREE.Color(`hsl(${baseHue}, 85%, 60%)`),
    new THREE.Color(`hsl(${(baseHue + 40) % 360}, 90%, 65%)`),
    new THREE.Color(`hsl(${(baseHue + 200) % 360}, 90%, 62%)`),
    new THREE.Color(`hsl(${(baseHue + 260) % 360}, 85%, 58%)`),
  ];
  return palette;
}

function randomMaterial(palette) {
  const color = palette[Math.floor(Math.random() * palette.length)].clone();
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.32,
    metalness: 0.25,
    clearcoat: 0.65,
    clearcoatRoughness: 0.18,
    transmission: 0.2,
    opacity: 0.92,
    transparent: true,
    emissive: color.clone().multiplyScalar(0.25),
    emissiveIntensity: 0.6,
  });
}

function randomGeometry() {
  const geometries = [
    new THREE.IcosahedronGeometry(THREE.MathUtils.randFloat(1.2, 2.5), 1),
    new THREE.TorusKnotGeometry(
      THREE.MathUtils.randFloat(0.8, 1.8),
      THREE.MathUtils.randFloat(0.22, 0.45),
      140,
      18,
      Math.floor(THREE.MathUtils.randInt(1, 4)),
      Math.floor(THREE.MathUtils.randInt(2, 5))
    ),
    new THREE.CapsuleGeometry(
      THREE.MathUtils.randFloat(0.8, 1.4),
      THREE.MathUtils.randFloat(0.4, 1.2),
      12,
      32
    ),
    new THREE.DodecahedronGeometry(THREE.MathUtils.randFloat(1.1, 2.2), 0),
    new THREE.ConeGeometry(
      THREE.MathUtils.randFloat(1.1, 2.1),
      THREE.MathUtils.randFloat(2.5, 4),
      32
    ),
  ];
  return geometries[Math.floor(Math.random() * geometries.length)];
}

function randomSpinComponent() {
  const sign = Math.random() < 0.5 ? -1 : 1;
  return sign * THREE.MathUtils.randFloat(0.008, 0.028);
}

function randomizeScene(seed = Math.random()) {
  animatedMeshes.splice(0, animatedMeshes.length);

  const children = [...group.children];
  children.forEach((child) => {
    group.remove(child);
    disposeMesh(child);
  });

  group.rotation.set(0, 0, 0);
  rig.rotation.set(0, 0, 0);

  const palette = paletteFromSeed(seed);

  const clusterCount = 9 + Math.floor(Math.random() * 6);
  for (let i = 0; i < clusterCount; i++) {
    const mesh = new THREE.Mesh(randomGeometry(), randomMaterial(palette));
    mesh.position.set(
      THREE.MathUtils.randFloatSpread(8),
      THREE.MathUtils.randFloatSpread(5),
      THREE.MathUtils.randFloatSpread(8)
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    const scale = THREE.MathUtils.randFloat(0.7, 1.5);
    mesh.scale.setScalar(scale);

    mesh.userData.spin = new THREE.Vector3(
      randomSpinComponent(),
      randomSpinComponent(),
      randomSpinComponent()
    );
    mesh.userData.bob = {
      amp: THREE.MathUtils.randFloat(0.18, 0.6),
      speed: THREE.MathUtils.randFloat(0.6, 1.8),
      offset: Math.random() * Math.PI * 2,
      axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
      base: mesh.position.clone(),
    };

    group.add(mesh);
    animatedMeshes.push(mesh);
  }

  const glowGeometry = new THREE.SphereGeometry(5, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: palette[0].clone().multiplyScalar(0.6),
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide,
  });

  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  group.add(glow);
}

randomizeScene();

document.getElementById('shuffle').addEventListener('click', () => {
  const seed = Math.random();
  randomizeScene(seed);
});

const clock = new THREE.Clock();
const pointer = new THREE.Vector2();

window.addEventListener('pointermove', (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  animatedMeshes.forEach((mesh) => {
    mesh.rotation.x += mesh.userData.spin.x * 1.5;
    mesh.rotation.y += mesh.userData.spin.y * 1.5;
    mesh.rotation.z += mesh.userData.spin.z;

    const { amp, speed, offset, axis, base } = mesh.userData.bob;
    const time = elapsed * speed + offset;
    const displacement = Math.sin(time) * amp;
    mesh.position.copy(base).addScaledVector(axis, displacement);
  });

  starField.rotation.y += 0.0009;
  starField.rotation.x += 0.00045;

  rig.rotation.y += 0.0035;
  rig.rotation.x = THREE.MathUtils.lerp(rig.rotation.x, pointer.y * 0.25, 0.05);
  rig.rotation.z = THREE.MathUtils.lerp(rig.rotation.z, pointer.x * 0.18, 0.05);

  keyLight.intensity = 1.25 + Math.sin(elapsed * 0.9) * 0.35;
  rimLight.intensity = 1.1 + Math.cos(elapsed * 1.4) * 0.4;

  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
