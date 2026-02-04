import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/PointerLockControls.js";

const overlay = document.getElementById("overlay");
const button = overlay.querySelector("button");
const overlayMessage = document.getElementById("overlay-message");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f1a);
scene.fog = new THREE.Fog(0x0b0f1a, 20, 120);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, document.body);

const tryLock = () => {
  if (!document.body.requestPointerLock) {
    overlayMessage.textContent = "Pointer Lock не поддерживается в этом браузере.";
    return;
  }
  controls.lock();
};

button.addEventListener("click", (event) => {
  event.preventDefault();
  tryLock();
});

overlay.addEventListener("click", (event) => {
  if (event.target === button) return;
  tryLock();
});

controls.addEventListener("lock", () => {
  overlay.classList.add("hidden");
  overlayMessage.textContent = "";
});

controls.addEventListener("unlock", () => {
  overlay.classList.remove("hidden");
  overlayMessage.textContent = "Кликните, чтобы снова захватить курсор.";
});

controls.addEventListener("error", () => {
  overlayMessage.textContent = "Не удалось захватить курсор. Попробуйте еще раз.";
});

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 5);
scene.add(dirLight);

const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
const materials = [
  new THREE.MeshStandardMaterial({ color: 0x4dab6d }),
  new THREE.MeshStandardMaterial({ color: 0x8b5a2b }),
  new THREE.MeshStandardMaterial({ color: 0x9ea8b8 }),
  new THREE.MeshStandardMaterial({ color: 0xd3d3d3 })
];

const world = new Map();

const keyFromPosition = (x, y, z) => `${x}|${y}|${z}`;

const addBlock = (x, y, z, materialIndex = 0) => {
  const key = keyFromPosition(x, y, z);
  if (world.has(key)) return;
  const block = new THREE.Mesh(blockGeometry, materials[materialIndex]);
  block.position.set(x, y, z);
  scene.add(block);
  world.set(key, block);
};

const removeBlock = (x, y, z) => {
  const key = keyFromPosition(x, y, z);
  const block = world.get(key);
  if (!block) return;
  scene.remove(block);
  world.delete(key);
};

const groundSize = 20;
for (let x = -groundSize; x <= groundSize; x += 1) {
  for (let z = -groundSize; z <= groundSize; z += 1) {
    addBlock(x, -1, z, (x + z) % 2 === 0 ? 0 : 1);
    if (Math.random() < 0.05) {
      addBlock(x, 0, z, 2);
    }
  }
}

camera.position.set(0, 2, 5);

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  sprint: false,
  jump: false
};

const onKeyChange = (event, isDown) => {
  switch (event.code) {
    case "KeyW":
      keys.forward = isDown;
      break;
    case "KeyS":
      keys.backward = isDown;
      break;
    case "KeyA":
      keys.left = isDown;
      break;
    case "KeyD":
      keys.right = isDown;
      break;
    case "ShiftLeft":
    case "ShiftRight":
      keys.sprint = isDown;
      break;
    case "Space":
      keys.jump = isDown;
      break;
    default:
      break;
  }
};

document.addEventListener("keydown", (event) => onKeyChange(event, true));
document.addEventListener("keyup", (event) => onKeyChange(event, false));

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const getIntersect = () => {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects([...world.values()]);
  return intersects[0];
};

const handleClick = (event) => {
  if (!controls.isLocked) return;
  event.preventDefault();
  const intersect = getIntersect();
  if (!intersect) return;
  const { point, face } = intersect;
  const normal = face.normal.clone();
  const position = intersect.object.position.clone();
  if (event.button === 0) {
    removeBlock(position.x, position.y, position.z);
  }
  if (event.button === 2) {
    const newPosition = position.add(normal);
    addBlock(newPosition.x, newPosition.y, newPosition.z, 3);
  }
};

document.addEventListener("mousedown", handleClick);
document.addEventListener("contextmenu", (event) => event.preventDefault());

const clock = new THREE.Clock();

const animate = () => {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 10.0 * delta;
  velocity.y -= 9.8 * 5.0 * delta;

  direction.z = Number(keys.forward) - Number(keys.backward);
  direction.x = Number(keys.right) - Number(keys.left);
  direction.normalize();

  const speed = keys.sprint ? 12 : 6;
  if (keys.forward || keys.backward) velocity.z -= direction.z * speed * delta;
  if (keys.left || keys.right) velocity.x -= direction.x * speed * delta;

  if (keys.jump && Math.abs(velocity.y) < 0.01 && camera.position.y <= 2) {
    velocity.y = 6;
  }

  controls.moveRight(-velocity.x * delta);
  controls.moveForward(-velocity.z * delta);
  camera.position.y += velocity.y * delta;

  if (camera.position.y < 2) {
    velocity.y = 0;
    camera.position.y = 2;
  }

  renderer.render(scene, camera);
};

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
