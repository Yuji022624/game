
import * as THREE from 'three';

// ---------------- SCENE ----------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf3a28b);
scene.fog = new THREE.Fog(0xf3a28b, 45, 125);

const camera = new THREE.PerspectiveCamera(
  65, innerWidth / innerHeight, 0.1, 300
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffe7e0, 0x43513d, 2.2));

const sunLight = new THREE.DirectionalLight(0xffe2b7, 2.5);
sunLight.position.set(-10, 20, 10);
sunLight.castShadow = true;
scene.add(sunLight);

const material = (color) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.8 });

function box(x, y, z, w, h, d, color) {
  const obj = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    material(color)
  );
  obj.position.set(x, y, z);
  obj.castShadow = true;
  obj.receiveShadow = true;
  scene.add(obj);
  return obj;
}

// ---------------- SUNSET WORLD ----------------
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(4, 24, 24),
  new THREE.MeshBasicMaterial({ color: 0xffdf9b })
);
sun.position.set(-14, 15, -45);
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(130, 180),
  material(0x63865b)
);
ground.rotation.x = -Math.PI / 2;
ground.position.set(0, -0.15, -45);
ground.receiveShadow = true;
scene.add(ground);

// Main walking path
box(0, -0.02, -28, 7, 0.2, 68, 0xc5a17f);

// Trees
function tree(x, z) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.32, 2.4, 8),
    material(0x765039)
  );
  trunk.position.set(x, 1.2, z);
  scene.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 12, 12),
    material(0x286447)
  );
  leaves.position.set(x, 3, z);
  leaves.castShadow = true;
  scene.add(leaves);
}

for (let z = 5; z > -100; z -= 5) {
  tree(-7 - Math.random() * 4, z);
  tree(7 + Math.random() * 4, z);
}

// ---------------- 3D CHARACTERS ----------------
function createCharacter(shirtColor, pantsColor, hairColor) {
  const root = new THREE.Group();

  const shirt = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.42, 0.65, 5, 12),
    material(shirtColor)
  );
  shirt.position.y = 1.4;
  shirt.castShadow = true;
  root.add(shirt);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 20, 20),
    material(0xffd0ad)
  );
  head.position.y = 2.35;
  root.add(head);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2
    ),
    material(hairColor)
  );
  hair.position.y = 2.55;
  root.add(hair);

  // Eyes
  for (const x of [-0.12, 0.12]) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x201820 })
    );
    eye.position.set(x, 2.37, 0.34);
    root.add(eye);
  }

  const legs = [];
  for (const x of [-0.19, 0.19]) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.65, 0.23),
      material(pantsColor)
    );
    leg.position.set(x, 0.5, 0);
    root.add(leg);
    legs.push(leg);
  }

  const arms = [];
  for (const x of [-0.52, 0.52]) {
    const arm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.11, 0.5, 4, 8),
      material(shirtColor)
    );
    arm.position.set(x, 1.45, 0);
    root.add(arm);
    arms.push(arm);
  }

  root.userData.legs = legs;
  root.userData.arms = arms;
  scene.add(root);
  return root;
}

const player = createCharacter(0x427cf5, 0x283959, 0x38251d);
player.position.set(0, 0, 4);

// Girlfriend is created now but remains invisible until the ending.
const girlfriend = createCharacter(0xff76ad, 0x713d72, 0x38251d);
girlfriend.visible = false;
girlfriend.position.set(0, 0, -63);

// ---------------- FIVE OBSTACLES ----------------
// Jump over each barrier to continue the journey.
const barriers = [];
const barrierZ = [-7, -17, -27, -37, -47];

barrierZ.forEach((z, i) => {
  const height = i === 2 ? 1.25 : 0.9;
  const mesh = box(0, height / 2, z, 6.2, height, 0.65,
    [0xd27a8f, 0x9475c9, 0x638fba, 0xe4a75e, 0xb46b91][i]);

  barriers.push({
    mesh,
    z,
    height,
    cleared: false
  });

  // Decorative flags beside each challenge
  for (const x of [-3.7, 3.7]) {
    box(x, 1, z, 0.12, 2, 0.12, 0xffdf9b);
    const flag = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffd96a })
    );
    flag.position.set(x, 2.15, z);
    scene.add(flag);
  }
});

// Final garden
box(0, -0.01, -60, 12, 0.25, 15, 0x9dba83);

for (let i = 0; i < 16; i++) {
  const angle = (i / 16) * Math.PI * 2;
  const flower = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 10, 10),
    new THREE.MeshBasicMaterial({
      color: i % 2 ? 0xff6ba8 : 0xffe2a1
    })
  );
  flower.position.set(
    Math.cos(angle) * 4,
    0.3,
    -60 + Math.sin(angle) * 4
  );
  scene.add(flower);
}

// ---------------- COLLECTIBLE HEARTS ----------------
const hearts = [];
const heartShape = new THREE.Shape();

heartShape.moveTo(0, 0.25);
heartShape.bezierCurveTo(-0.7, 0.8, -0.8, 0.1, 0, -0.45);
heartShape.bezierCurveTo(0.8, 0.1, 0.7, 0.8, 0, 0.25);

const heartGeometry = new THREE.ExtrudeGeometry(heartShape, {
  depth: 0.12,
  bevelEnabled: true,
  bevelSegments: 2,
  bevelSize: 0.03,
  bevelThickness: 0.03
});

for (const [x, z] of [
  [-1.5, -3],
  [1.5, -13],
  [-1.5, -23],
  [1.5, -33],
  [0, -43]
]) {
  const heart = new THREE.Mesh(
    heartGeometry,
    new THREE.MeshStandardMaterial({
      color: 0xff267b,
      emissive: 0x6b092e
    })
  );
  heart.position.set(x, 1.4, z);
  heart.scale.setScalar(0.65);
  scene.add(heart);
  hearts.push({ mesh: heart, collected: false });
}

// ---------------- CONTROLS ----------------
const keys = {};
let started = false;
let finished = false;
let score = 0;
let jumpVelocity = 0;
let onGround = true;
let cameraAngle = 0;
let dragging = false;
let previousX = 0;

addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;

  if (e.code === 'Space') {
    e.preventDefault();
    jump();
  }
});

addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

addEventListener('blur', () => {
  for (const key in keys) keys[key] = false;
});

function jump() {
  if (started && !finished && onGround) {
    jumpVelocity = 8.5;
    onGround = false;
  }
}

document.querySelectorAll('[data-key]').forEach(button => {
  const key = button.dataset.key;

  button.addEventListener('pointerdown', e => {
    e.preventDefault();
    keys[key] = true;
    button.setPointerCapture(e.pointerId);
  });

  const release = () => keys[key] = false;
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
});

document.getElementById('jumpBtn').addEventListener('pointerdown', e => {
  e.preventDefault();
  jump();
});

renderer.domElement.addEventListener('pointerdown', e => {
  dragging = true;
  previousX = e.clientX;
  renderer.domElement.setPointerCapture(e.pointerId);
});

renderer.domElement.addEventListener('pointermove', e => {
  if (!dragging) return;
  cameraAngle -= (e.clientX - previousX) * 0.006;
  previousX = e.clientX;
});

renderer.domElement.addEventListener('pointerup', () => dragging = false);
renderer.domElement.addEventListener('pointercancel', () => dragging = false);

// ---------------- GAME UI ----------------
const intro = document.getElementById('intro');
const ending = document.getElementById('ending');
const hint = document.getElementById('hint');
const stageLabel = document.getElementById('stage');
const progressBar = document.getElementById('progressBar');

document.getElementById('startBtn').onclick = () => {
  started = true;
  intro.classList.add('hidden');
  hint.textContent = 'Jump over obstacle 1. Your love awaits!';
};

document.getElementById('againBtn').onclick = () => location.reload();

setTimeout(() => {
  document.getElementById('loading').classList.add('hidden');
}, 700);

// ---------------- GAME LOOP ----------------
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;

  if (started && !finished) {
    const oldX = player.position.x;
    const oldZ = player.position.z;

    const forward = new THREE.Vector3(
      -Math.sin(cameraAngle), 0, -Math.cos(cameraAngle)
    );
    const right = new THREE.Vector3(
      Math.cos(cameraAngle), 0, -Math.sin(cameraAngle)
    );
    const direction = new THREE.Vector3();

    if (keys.w || keys.arrowup) direction.add(forward);
    if (keys.s || keys.arrowdown) direction.sub(forward);
    if (keys.a || keys.arrowleft) direction.sub(right);
    if (keys.d || keys.arrowright) direction.add(right);

    const moving = direction.lengthSq() > 0;

    if (moving) {
      direction.normalize();
      player.position.x += direction.x * 5 * delta;
      player.position.z += direction.z * 5 * delta;
      player.rotation.y = Math.atan2(direction.x, direction.z);
    }

    // Jump gravity
    jumpVelocity -= 20 * delta;
    player.position.y += jumpVelocity * delta;

    if (player.position.y <= 0) {
      player.position.y = 0;
      jumpVelocity = 0;
      onGround = true;
    }

    player.position.x = THREE.MathUtils.clamp(
      player.position.x, -2.8, 2.8
    );
    player.position.z = THREE.MathUtils.clamp(
      player.position.z, -65, 5
    );

    // Collision with each barrier. Jump high enough to clear it.
    let hitBarrier = false;

    for (const barrier of barriers) {
      const nearZ = Math.abs(player.position.z - barrier.z) < 0.65;
      const nearX = Math.abs(player.position.x) < 3.35;
      const tooLow = player.position.y < barrier.height + 0.15;

      if (nearZ && nearX && tooLow) {
        hitBarrier = true;
        break;
      }
    }

    if (hitBarrier) {
      player.position.x = oldX;
      player.position.z = oldZ;
      hint.textContent = 'Obstacle ahead! Jump with SPACE ⤴';
    }

    // Run animation
    const swing = moving ? Math.sin(time * 11) * 0.6 : 0;
    player.userData.legs[0].rotation.x = swing;
    player.userData.legs[1].rotation.x = -swing;
    player.userData.arms[0].rotation.x = -swing * 0.5;
    player.userData.arms[1].rotation.x = swing * 0.5;

    // Detect cleared obstacles
    let clearedCount = 0;

    barriers.forEach((barrier, index) => {
      if (!barrier.cleared && player.position.z < barrier.z - 0.9) {
        barrier.cleared = true;
        hint.textContent = `Obstacle ${index + 1} cleared! Keep going ❤️`;
      }
      if (barrier.cleared) clearedCount++;
    });

    stageLabel.textContent = `LEVEL ${Math.min(clearedCount + 1, 5)} OF 5`;
    progressBar.style.width = `${clearedCount / 5 * 100}%`;

    // Collect hearts
    hearts.forEach(heart => {
      if (heart.collected) return;

      heart.mesh.rotation.y += delta * 2;
      heart.mesh.position.y = 1.4 + Math.sin(time * 3) * 0.15;

      if (player.position.distanceTo(heart.mesh.position) < 1.25) {
        heart.collected = true;
        scene.remove(heart.mesh);
        score++;
      }
    });

    // Reveal girlfriend only after all five obstacles
    if (clearedCount === 5 && player.position.z < -57) {
      finished = true;
      girlfriend.visible = true;
      girlfriend.position.set(0, 0, -62);
      girlfriend.rotation.y = 0;

      ending.classList.remove('hidden');
      document.getElementById('endingMessage').textContent =
        `You found your love! You collected ${score} hearts. ❤️🧿`;

      hint.textContent = 'You found her. ❤️';
    }
  }

  // Camera follows player
  const offset = new THREE.Vector3(
    Math.sin(cameraAngle) * 7,
    3.7,
    Math.cos(cameraAngle) * 7
  );

  const target = player.position.clone().add(offset);
  camera.position.lerp(target, Math.min(delta * 5, 1));
  camera.lookAt(
    player.position.x,
    player.position.y + 1.2,
    player.position.z - 1
  );

  renderer.render(scene, camera);
}

camera.position.set(0, 4, 12);
animate();

// ---------------- RESIZE ----------------
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
