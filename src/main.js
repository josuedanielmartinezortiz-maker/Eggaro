import * as THREE from "three";

const canvas = document.querySelector("#scene");
const stage = document.querySelector("#stage");
const intro = document.querySelector("#intro");
const startButton = document.querySelector("#start");
const playButton = document.querySelector("#play");
const restartButton = document.querySelector("#restart");
const timeline = document.querySelector("#timeline");
const timecode = document.querySelector("#timecode");
const shotLabel = document.querySelector("#shot-label");
const statusLabel = document.querySelector("#status");

const DURATION = 24;
const scene = new THREE.Scene();
scene.background = new THREE.Color("#a8cfda");
scene.fog = new THREE.FogExp2("#b8d1ce", 0.012);

const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 240);
camera.position.set(0, 5, 21);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "low-power" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

scene.add(new THREE.HemisphereLight("#d9efff", "#52613b", 2.0));
const sun = new THREE.DirectionalLight("#ffe0a1", 3.1);
sun.position.set(-12, 22, 9);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -32; sun.shadow.camera.right = 32;
sun.shadow.camera.top = 32; sun.shadow.camera.bottom = -32;
scene.add(sun);

const mat = (color, roughness = 1) => new THREE.MeshStandardMaterial({ color, roughness });
const groundMat = mat("#587747");
const pathMat = mat("#a88a60");
const grassMats = ["#6c8a4c", "#799651", "#4f713f"].map(c => mat(c));
const trunkMat = mat("#59402b");
const leafMats = ["#294f3d", "#356448", "#46744c"].map(c => mat(c));
const roofMat = mat("#76503a");
const wallMat = mat("#d5b789");
const darkMat = mat("#3b3026");
const windowMat = new THREE.MeshStandardMaterial({ color: "#8ab7c0", roughness: .35, metalness: .05 });
const goldMat = new THREE.MeshStandardMaterial({ color: "#e6bd70", roughness: .6, metalness: .08 });

function mesh(geometry, material, parent = scene) {
  const object = new THREE.Mesh(geometry, material);
  object.castShadow = true; object.receiveShadow = true; parent.add(object);
  return object;
}

// El escenario se genera con geometría sencilla: así aprendemos antes de depender de assets.
const ground = mesh(new THREE.PlaneGeometry(220, 220), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.08;
ground.castShadow = false;

const path = mesh(new THREE.PlaneGeometry(5.5, 90), pathMat);
path.rotation.x = -Math.PI / 2;
path.position.set(0, -0.035, -18);
path.castShadow = false;

const rng = (() => { let s = 6102026; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); })();
for (let i = 0; i < 145; i++) {
  const side = rng() > .5 ? 1 : -1;
  const z = 15 - rng() * 86;
  const x = side * (4.5 + rng() * 24);
  const h = 2.5 + rng() * 5.5;
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  scene.add(group);
  const trunk = mesh(new THREE.CylinderGeometry(.13, .28, h * .48, 7), trunkMat, group);
  trunk.position.y = h * .24;
  const crown = mesh(new THREE.ConeGeometry(1.1 + rng() * .8, h * .7, 7), leafMats[Math.floor(rng() * leafMats.length)], group);
  crown.position.y = h * .65;
  crown.rotation.y = rng() * Math.PI;
}

for (let i = 0; i < 260; i++) {
  const side = rng() > .5 ? 1 : -1;
  const z = 14 - rng() * 72;
  const x = side * (2.8 + rng() * 5);
  const flower = mesh(new THREE.SphereGeometry(.08 + rng() * .08, 5, 4), i % 4 === 0 ? goldMat : grassMats[Math.floor(rng() * grassMats.length)]);
  flower.position.set(x, .06, z);
  flower.scale.y = .7;
}

function makeCabin(x, z, scale = 1) {
  const cabin = new THREE.Group();
  cabin.position.set(x, 0, z); cabin.scale.setScalar(scale); scene.add(cabin);
  const body = mesh(new THREE.BoxGeometry(4.6, 2.8, 3.6), wallMat, cabin);
  body.position.y = 1.4;
  const roof = mesh(new THREE.ConeGeometry(3.5, 2.3, 4), roofMat, cabin);
  roof.position.y = 3.75; roof.rotation.y = Math.PI / 4; roof.scale.z = .82;
  const door = mesh(new THREE.BoxGeometry(.85, 1.7, .1), darkMat, cabin);
  door.position.set(.65, .85, 1.86);
  const knob = mesh(new THREE.SphereGeometry(.07, 8, 6), goldMat, cabin);
  knob.position.set(.38, .88, 1.94);
  for (const wx of [-1.25, 1.55]) {
    const win = mesh(new THREE.BoxGeometry(.68, .7, .08), windowMat, cabin);
    win.position.set(wx, 1.65, 1.85);
  }
  const step = mesh(new THREE.BoxGeometry(1.35, .22, .48), pathMat, cabin);
  step.position.set(.65, .11, 2.05);
  return cabin;
}
makeCabin(-1.6, -34, 1.1);

// A tiny procedural character placeholder; replaceable by a rigged/AI-assisted GLB later.
const character = new THREE.Group();
scene.add(character);
const skin = mat("#c58e68"), shirt = mat("#496b78"), pants = mat("#35434a"), hair = mat("#3b3027");
const torso = mesh(new THREE.CapsuleGeometry(.38, .72, 4, 8), shirt, character);
torso.position.y = 1.25;
const head = mesh(new THREE.SphereGeometry(.31, 12, 10), skin, character);
head.position.y = 2.05;
const hairCap = mesh(new THREE.SphereGeometry(.32, 12, 7, 0, Math.PI * 2, 0, Math.PI * .55), hair, character);
hairCap.position.y = 2.13;
const legs = [];
for (const x of [-.17, .17]) {
  const leg = mesh(new THREE.CapsuleGeometry(.13, .56, 3, 6), pants, character);
  leg.position.set(x, .48, 0); legs.push(leg);
}
const arms = [];
for (const x of [-.48, .48]) {
  const arm = mesh(new THREE.CapsuleGeometry(.105, .52, 3, 6), skin, character);
  arm.position.set(x, 1.35, 0); arms.push(arm);
}
character.position.set(0, 0, 6);
character.visible = false;

// Camera shots are data, not hard-coded scene changes. We'll later add an editor for these keyframes.
const shots = [
  { at: 0, name: "PLANO 01 · ESTABLECIMIENTO", cam: [0, 5.2, 22], look: [0, 2, -20], actor: [0, 0, 8], show: false },
  { at: 5, name: "PLANO 02 · DOLLY IN", cam: [0, 4.4, 13], look: [0, 2, -23], actor: [0, 0, 6], show: true },
  { at: 11, name: "PLANO 03 · SEGUIMIENTO", cam: [1.4, 3.3, 7], look: [0, 1.6, -16], actor: [0, 0, 2], show: true },
  { at: 17, name: "PLANO 04 · REVELACIÓN", cam: [3.6, 3.4, 1.5], look: [-1.4, 2.1, -30], actor: [0, 0, -1], show: true },
  { at: 24, name: "PLANO 05 · CIERRE", cam: [1.2, 4.6, -8], look: [-1.6, 2.2, -32], actor: [0, 0, -3], show: true }
];

const smooth = t => t * t * (3 - 2 * t);
function sampleShot(time) {
  let a = shots[0], b = shots[shots.length - 1];
  for (let i = 0; i < shots.length - 1; i++) {
    if (time >= shots[i].at && time <= shots[i + 1].at) { a = shots[i]; b = shots[i + 1]; break; }
  }
  const t = smooth(THREE.MathUtils.clamp((time - a.at) / Math.max(.001, b.at - a.at), 0, 1));
  const lerp3 = (p, q) => new THREE.Vector3(...p).lerp(new THREE.Vector3(...q), t);
  return { cam: lerp3(a.cam, b.cam), look: lerp3(a.look, b.look), actor: lerp3(a.actor, b.actor), show: time >= 4.4, shot: time < 5 ? shots[0] : time < 11 ? shots[1] : time < 17 ? shots[2] : time < 24 ? shots[3] : shots[4] };
}

let elapsed = 0;
let playing = false;
let lastStamp = 0;
function setTime(t) {
  elapsed = THREE.MathUtils.clamp(t, 0, DURATION);
  timeline.value = String(elapsed);
  const pose = sampleShot(elapsed);
  camera.position.copy(pose.cam);
  camera.lookAt(pose.look);
  character.position.copy(pose.actor);
  character.visible = pose.show;
  const walk = elapsed > 5 && elapsed < 18 ? Math.sin(elapsed * 5.5) : 0;
  legs[0].rotation.x = walk * .65; legs[1].rotation.x = -walk * .65;
  arms[0].rotation.x = -walk * .42; arms[1].rotation.x = walk * .42;
  torso.rotation.y = elapsed > 17 ? -.16 : 0;
  shotLabel.textContent = pose.shot.name;
  timecode.textContent = "00:" + String(Math.floor(elapsed)).padStart(2, "0");
  statusLabel.textContent = playing ? "PLAY" : elapsed >= DURATION ? "FIN" : "PAUSA";
}
function start() { intro.classList.add("hidden"); playing = true; playButton.textContent = "Ⅱ"; statusLabel.textContent = "PLAY"; }
startButton.addEventListener("click", start);
playButton.addEventListener("click", () => {
  if (elapsed >= DURATION) setTime(0);
  playing = !playing;
  if (playing) intro.classList.add("hidden");
  playButton.textContent = playing ? "Ⅱ" : "▶";
  statusLabel.textContent = playing ? "PLAY" : "PAUSA";
});
restartButton.addEventListener("click", () => { setTime(0); playing = false; playButton.textContent = "▶"; intro.classList.remove("hidden"); });
timeline.addEventListener("input", () => { setTime(Number(timeline.value)); playing = false; playButton.textContent = "▶"; statusLabel.textContent = "PAUSA"; });

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  camera.aspect = w / h; camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
window.addEventListener("resize", resize, { passive: true });
resize();
setTime(0);

function frame(stamp) {
  requestAnimationFrame(frame);
  if (!lastStamp) lastStamp = stamp;
  const dt = Math.min((stamp - lastStamp) / 1000, .05);
  lastStamp = stamp;
  if (playing) {
    if (elapsed < DURATION) setTime(elapsed + dt);
    else { playing = false; playButton.textContent = "▶"; statusLabel.textContent = "FIN"; }
  }
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);