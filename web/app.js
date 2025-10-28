import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.set(0, 1.2, 4.5);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.3;
controls.enablePan = false;
controls.minDistance = 2.2;
controls.maxDistance = 7;

const ambient = new THREE.AmbientLight(0xe0b3ff, 0.6);
scene.add(ambient);

const pointLight = new THREE.PointLight(0xa855f7, 1.5, 12);
pointLight.position.set(3, 4, 2);
scene.add(pointLight);

const backLight = new THREE.PointLight(0x4f46e5, 1.2, 15);
backLight.position.set(-3, -4, -2);
scene.add(backLight);

const portalGeo = new THREE.TorusKnotGeometry(1.1, 0.36, 180, 32);
const portalMat = new THREE.MeshStandardMaterial({
  color: 0xa855f7,
  metalness: 0.45,
  roughness: 0.2,
  emissive: 0x321861,
  emissiveIntensity: 0.8,
  side: THREE.DoubleSide,
});
const portal = new THREE.Mesh(portalGeo, portalMat);
scene.add(portal);

const liquidGeo = new THREE.IcosahedronGeometry(0.8, 1);
const liquidMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0.15,
  metalness: 0.1,
  transmission: 0.8,
  thickness: 1.2,
  clearcoat: 0.6,
  clearcoatRoughness: 0.1,
});
const liquid = new THREE.Mesh(liquidGeo, liquidMat);
scene.add(liquid);

const sparkMaterial = new THREE.PointsMaterial({
  size: 0.015,
  transparent: true,
  color: 0xe0b3ff,
  opacity: 0.9,
  blending: THREE.AdditiveBlending,
});

function generateSparks(count = 900) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const radius = THREE.MathUtils.randFloat(2.4, 4.8);
    const theta = THREE.MathUtils.randFloatSpread(360);
    const phi = THREE.MathUtils.randFloatSpread(360);
    const x = radius * Math.sin(theta) * Math.cos(phi);
    const y = radius * Math.sin(phi);
    const z = radius * Math.cos(theta);
    positions.set([x, y, z], i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(geometry, sparkMaterial);
}

const sparks = generateSparks();
scene.add(sparks);

const crystalGroup = new THREE.Group();
const crystalColors = [0x8b5cf6, 0xf472b6, 0x38bdf8];

for (let i = 0; i < 12; i++) {
  const radius = THREE.MathUtils.randFloat(1.6, 2.6);
  const angle = (i / 12) * Math.PI * 2;
  const y = THREE.MathUtils.randFloat(-0.6, 0.6);

  const geometry = new THREE.ConeGeometry(0.12, 0.45, 5);
  const material = new THREE.MeshStandardMaterial({
    color: crystalColors[i % crystalColors.length],
    metalness: 0.6,
    roughness: 0.35,
    emissive: 0x120827,
    emissiveIntensity: 0.4,
  });

  const crystal = new THREE.Mesh(geometry, material);
  crystal.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
  crystal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  crystalGroup.add(crystal);
}

scene.add(crystalGroup);

const bloomPass = renderer.toneMappingExposure;
renderer.toneMappingExposure = 1.1;

function resize() {
  const { clientWidth, clientHeight } = canvas;
  const aspect = clientWidth / clientHeight;
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight, false);
}

const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(canvas);

let clock = new THREE.Clock();

function animate() {
  const elapsed = clock.getElapsedTime();
  portal.rotation.x = Math.sin(elapsed * 0.3) * 0.3;
  portal.rotation.y = elapsed * 0.4;

  liquid.rotation.x = elapsed * 0.6;
  liquid.rotation.y = elapsed * 0.4;

  crystalGroup.children.forEach((crystal, index) => {
    crystal.rotation.y += 0.01;
    crystal.position.y = Math.sin(elapsed * 0.8 + index) * 0.4;
  });

  sparks.rotation.y -= 0.0008;

  pointLight.intensity = 1.2 + Math.sin(elapsed * 2.1) * 0.3;

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

resize();
animate();

window.addEventListener("beforeunload", () => {
  resizeObserver.disconnect();
});
