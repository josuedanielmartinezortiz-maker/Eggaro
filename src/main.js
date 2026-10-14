import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/DRACOLoader.js";

const $ = s => document.querySelector(s);
const canvas = $("#scene"), stage = $("#stage"), intro = $("#intro");
const startButton = $("#start"), playButton = $("#play"), restartButton = $("#restart");
const timeline = $("#timeline"), timecode = $("#timecode"), shotLabel = $("#shot-label"), statusLabel = $("#status");
const DURATION = 24;
const scene = new THREE.Scene();
const provisionalWorld = new THREE.Group();
provisionalWorld.name = "escenario_provisional_respaldo";
scene.add(provisionalWorld);
scene.background = new THREE.Color("#a8cfda");
scene.fog = new THREE.FogExp2("#b8d1ce", .009);

const camera = new THREE.PerspectiveCamera(48, 1, .1, 220);
camera.position.set(0, 7, 28);
const mobile = matchMedia("(max-width: 700px)").matches;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.15 : 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

scene.add(new THREE.HemisphereLight("#d9efff", "#52613b", 1.8));
const sun = new THREE.DirectionalLight("#ffe0a1", 2.6);
sun.position.set(-12, 22, 9);
sun.castShadow = true;
sun.shadow.mapSize.set(mobile ? 512 : 768, mobile ? 512 : 768);
Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 70 });
sun.shadow.bias = -.00025;
sun.shadow.camera.updateProjectionMatrix();
scene.add(sun);

const mat = (color, roughness = 1) => new THREE.MeshStandardMaterial({ color, roughness });
const groundMat = mat("#587747"), pathMat = mat("#a88a60");
const roofMat = mat("#76503a"), wallMat = mat("#d5b789"), darkMat = mat("#3b3026");
const windowMat = new THREE.MeshStandardMaterial({ color: "#8ab7c0", roughness: .35, metalness: .05 });
const goldMat = new THREE.MeshStandardMaterial({ color: "#e6bd70", roughness: .6, metalness: .08 });

function mesh(geometry, material, parent = scene, castsShadow = true) {
  const m = new THREE.Mesh(geometry, material);
  m.castShadow = castsShadow;
  m.receiveShadow = false;
  parent.add(m);
  return m;
}

const ground = mesh(new THREE.PlaneGeometry(220, 220), groundMat, provisionalWorld, false);
ground.rotation.x = -Math.PI / 2; ground.position.y = -.08; ground.receiveShadow = true;
const path = mesh(new THREE.PlaneGeometry(5.5, 90), pathMat, provisionalWorld, false);
path.rotation.x = -Math.PI / 2; path.position.set(0, -.035, -18);

// Reproducible world generation: identical layout each time, but with variation in scale and color.
const rng = (() => { let seed = 6102026; return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); })();
const dummy = new THREE.Object3D();
const TREE_COUNT = 145;
const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(.13, .28, 1, 7), mat("#59402b"), TREE_COUNT);
const crownGeometry = new THREE.ConeGeometry(1, 1, 7);
const crownMaterial = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1 });
const crowns = new THREE.InstancedMesh(crownGeometry, crownMaterial, TREE_COUNT);
const crownTops = new THREE.InstancedMesh(crownGeometry, crownMaterial, TREE_COUNT);
trunks.castShadow = crowns.castShadow = crownTops.castShadow = false;
const leafColors = ["#294f3d", "#356448", "#46744c", "#527b49"].map(c => new THREE.Color(c));
const tint = new THREE.Color();

for (let i = 0; i < TREE_COUNT; i++) {
  const side = rng() > .5 ? 1 : -1, z = 15 - rng() * 86;
  const x = side * (4.5 + rng() * 24), h = 2.8 + rng() * 5.1, yaw = rng() * Math.PI;
  dummy.position.set(x, h * .24, z); dummy.rotation.set(0, yaw, 0);
  dummy.scale.set(1, h * .48, 1); dummy.updateMatrix(); trunks.setMatrixAt(i, dummy.matrix);

  const size = 1.1 + rng() * .75;
  dummy.position.set(x, h * .65, z); dummy.rotation.set(0, yaw, 0);
  dummy.scale.set(size, h * .68, size); dummy.updateMatrix(); crowns.setMatrixAt(i, dummy.matrix);
  crowns.setColorAt(i, leafColors[Math.floor(rng() * leafColors.length)]);

  dummy.position.set(x, h * .78, z); dummy.rotation.set(0, yaw + .35, 0);
  dummy.scale.set(size * .72, h * .48, size * .72); dummy.updateMatrix(); crownTops.setMatrixAt(i, dummy.matrix);
  tint.copy(leafColors[Math.floor(rng() * leafColors.length)]).multiplyScalar(1.12);
  crownTops.setColorAt(i, tint);
}
for (const instanced of [trunks, crowns, crownTops]) instanced.instanceMatrix.needsUpdate = true;
crowns.instanceColor.needsUpdate = true; crownTops.instanceColor.needsUpdate = true;
provisionalWorld.add(trunks, crowns, crownTops);

// Flowers are also instanced instead of creating 260 separate draw calls.
const FLOWER_COUNT = 260;
const flowers = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 5, 4),
  new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1 }), FLOWER_COUNT);
flowers.castShadow = false;
const flowerColors = ["#e9c887", "#6c8a4c", "#799651", "#4f713f"].map(c => new THREE.Color(c));
for (let i = 0; i < FLOWER_COUNT; i++) {
  const side = rng() > .5 ? 1 : -1, z = 14 - rng() * 72;
  const x = side * (2.8 + rng() * 5), size = .08 + rng() * .08;
  dummy.position.set(x, .06, z); dummy.rotation.set(0, rng() * Math.PI, 0);
  dummy.scale.set(size, size * .7, size); dummy.updateMatrix();
  flowers.setMatrixAt(i, dummy.matrix); flowers.setColorAt(i, flowerColors[i % flowerColors.length]);
}
flowers.instanceMatrix.needsUpdate = true; flowers.instanceColor.needsUpdate = true;
provisionalWorld.add(flowers);

function makeCabin(x, z, scale = 1) {
  const cabin = new THREE.Group();
  cabin.position.set(x, 0, z); cabin.scale.setScalar(scale); provisionalWorld.add(cabin);
  const body = mesh(new THREE.BoxGeometry(4.6, 2.8, 3.6), wallMat, cabin); body.position.y = 1.4;
  const roof = mesh(new THREE.ConeGeometry(3.5, 2.3, 4), roofMat, cabin);
  roof.position.y = 3.75; roof.rotation.y = Math.PI / 4; roof.scale.z = .82;
  const door = mesh(new THREE.BoxGeometry(.85, 1.7, .1), darkMat, cabin); door.position.set(.65, .85, 1.86);
  const knob = mesh(new THREE.SphereGeometry(.07, 8, 6), goldMat, cabin); knob.position.set(.38, .88, 1.94);
  for (const wx of [-1.25, 1.55]) {
    const win = mesh(new THREE.BoxGeometry(.68, .7, .08), windowMat, cabin); win.position.set(wx, 1.65, 1.85);
  }
  const step = mesh(new THREE.BoxGeometry(1.35, .22, .48), pathMat, cabin); step.position.set(.65, .11, 2.05);
  return cabin;
}
const cabin = makeCabin(-1.6, -34, 1.1);

// Temporary character; later this group can be replaced with a rigged GLB.
const character = new THREE.Group(); scene.add(character);
const skin = mat("#c58e68"), shirt = mat("#496b78"), pants = mat("#35434a"), hair = mat("#3b3027");
const torso = mesh(new THREE.CapsuleGeometry(.38, .72, 4, 8), shirt, character); torso.position.y = 1.25;
const head = mesh(new THREE.SphereGeometry(.31, 14, 12), skin, character); head.position.y = 2.05;
const hairCap = mesh(new THREE.SphereGeometry(.32, 12, 7, 0, Math.PI * 2, 0, Math.PI * .55), hair, character);
hairCap.position.y = 2.13;
const eyesMat = new THREE.MeshStandardMaterial({ color: "#171b1b", roughness: .8 });
for (const x of [-.105, .105]) {
  const eye = mesh(new THREE.SphereGeometry(.035, 7, 6), eyesMat, character, false);
  eye.position.set(x, 2.06, .285);
}
const legs = [], arms = [];
for (const x of [-.17, .17]) {
  const leg = mesh(new THREE.CapsuleGeometry(.13, .56, 3, 6), pants, character);
  leg.position.set(x, .48, 0); legs.push(leg);
}
for (const x of [-.48, .48]) {
  const arm = mesh(new THREE.CapsuleGeometry(.105, .52, 3, 6), skin, character);
  arm.position.set(x, 1.35, 0); arms.push(arm);
}
character.position.set(0, 0, 8); character.visible = false;

// Carga los diseños originales de Mike y Micaela del repositorio GAMERPRO GAME.
const heroMike = new THREE.Group();
const heroMicaela = new THREE.Group();
heroMike.name = "Mike_modelo_original";
heroMicaela.name = "Micaela_modelo_original";
scene.add(heroMike, heroMicaela);
heroMike.visible = heroMicaela.visible = false;
const mixers = [];
const modelLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/libs/draco/");
modelLoader.setDRACOLoader(dracoLoader);

// Prioriza el mapa 3D original del proyecto; el segundo archivo es respaldo.
const MAP_URLS = [
  "https://raw.githubusercontent.com/josuedanielmartinezortiz-maker/Eggaro/87f4dc4b8c1a58f5799cc6b8889c42d73f7f7290/Forbidden_Village_3D_Realista.glb",
  "https://raw.githubusercontent.com/josuedanielmartinezortiz-maker/Eggaro/87f4dc4b8c1a58f5799cc6b8889c42d73f7f7290/Forbidden%20Village%20Path_Meshy_AI_2026-09-29_66c9cc.glb"
];
async function loadDesignedMap() {
  for (const url of MAP_URLS) {
    try {
      statusLabel.textContent = "CARGANDO MAPA ORIGINAL…";
      const gltf = await modelLoader.loadAsync(url);
      const map = gltf.scene;
      map.name = "EGGARO_MAPA_ORIGINAL";
      map.updateMatrixWorld(true);
      let bounds = new THREE.Box3().setFromObject(map);
      let size = bounds.getSize(new THREE.Vector3());
      // Si el camino quedó orientado a lo ancho, gira el escenario para que avance en Z.
      if (size.x > size.z * 1.15) {
        map.rotation.y = Math.PI / 2;
        map.updateMatrixWorld(true);
        bounds = new THREE.Box3().setFromObject(map);
        size = bounds.getSize(new THREE.Vector3());
      }
      const longest = Math.max(size.x, size.z);
      if (!Number.isFinite(longest) || longest < 1 || !Number.isFinite(size.y)) {
        throw new Error("El mapa no tiene dimensiones válidas");
      }
      // Escala uniforme, centra el terreno y coloca su punto más bajo en Y=0.
      const scale = 92 / longest;
      const center = bounds.getCenter(new THREE.Vector3());
      map.scale.setScalar(scale);
      map.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
      map.traverse(object => {
        if (!object.isMesh) return;
        object.castShadow = false;
        object.receiveShadow = true;
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          for (const material of materials) {
            if ("roughness" in material) material.roughness = Math.max(material.roughness ?? .75, .55);
          }
      }
      });
      scene.add(map);
      provisionalWorld.visible = false;
      statusLabel.textContent = "MAPA ORIGINAL CARGADO";
      return true;
    } catch (error) {
      console.warn("No se pudo cargar el mapa EGGARO; se probará el siguiente archivo.", error);
    }
  }
  statusLabel.textContent = "MAPA NO DISPONIBLE · ESCENARIO DE RESPALDO";
  return false;
}
loadDesignedMap();

const modelURLs = {
  mike: "https://raw.githubusercontent.com/josuedanielmartinezortiz-maker/Game/main/3D/mike.glb",
  micaela: "https://raw.githubusercontent.com/josuedanielmartinezortiz-maker/Game/main/3D/micaela.glb"
};
const modelReady = { mike: false, micaela: false };

async function loadDesignedCharacter(name, wrapper) {
  try {
    const gltf = await modelLoader.loadAsync(modelURLs[name]);
    const model = gltf.scene;
    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(model);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    if (!Number.isFinite(size.y) || size.y < .01) throw new Error("Modelo sin altura válida");
    const scale = 2.15 / size.y;
    model.scale.setScalar(scale);
    model.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
    model.traverse(object => {
      if (!object.isMesh) return;
      object.castShadow = false;
      object.receiveShadow = false;
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if ("roughness" in material) material.roughness = Math.max(material.roughness ?? .7, .45);
        }
      }
    });
    wrapper.add(model);
    wrapper.rotation.y = Math.PI;
    if (gltf.animations?.length) {
      const mixer = new THREE.AnimationMixer(model);
      const clip = gltf.animations.find(item => /walk|caminar|idle|mixamo/i.test(item.name)) || gltf.animations[0];
      mixer.clipAction(clip).play();
      mixers.push(mixer);
    }
    modelReady[name] = true;
    heroMike.visible = elapsed >= 4.35 && modelReady.mike;
    heroMicaela.visible = elapsed >= 4.35 && modelReady.micaela;
    character.visible = elapsed >= 4.35 && !(modelReady.mike || modelReady.micaela);
  } catch (error) {
    console.warn("No se pudo cargar el modelo original de " + name, error);
  }
}
Promise.all([
  loadDesignedCharacter("mike", heroMike),
  loadDesignedCharacter("micaela", heroMicaela)
]);

// Camera and actor keyframes share the same timeline. Each target is close to the action.
const shots = [
  { at: 0,  name: "PLANO 01 · ESTABLECIMIENTO", cam: [0, 8, 29],    look: [0, 2, -25],   actor: [0, 0, 8] },
  { at: 3,  name: "PLANO 01 · ESTABLECIMIENTO", cam: [0, 7, 25],    look: [0, 2, -22],   actor: [0, 0, 8] },
  { at: 5,  name: "PLANO 02 · DOLLY IN",         cam: [0, 4.7, 14],  look: [0, 1.7, 3],   actor: [0, 0, 6] },
  { at: 8,  name: "PLANO 03 · SEGUIMIENTO",      cam: [0, 3.5, 10],  look: [0, 1.5, 1],   actor: [0, 0, 2] },
  { at: 13, name: "PLANO 03 · SEGUIMIENTO",      cam: [1.8, 3.1, 4], look: [0, 1.6, -6],  actor: [0, 0, -6] },
  { at: 17, name: "PLANO 04 · REVELACIÓN",       cam: [2.8, 3.4, -3],look: [-.5, 1.8, -15],actor: [0, 0, -15] },
  { at: 20, name: "PLANO 05 · CABAÑA",           cam: [1.8, 4, -15],look: [-1.2, 2, -29], actor: [0, 0, -23] },
  { at: 24, name: "PLANO 05 · CABAÑA",           cam: [1.2, 4.8, -19],look: [-1.6, 2.2, -32],actor: [0, 0, -27] }
];
const clamp01 = n => THREE.MathUtils.clamp(n, 0, 1);
const vec = a => new THREE.Vector3(a[0], a[1], a[2]);

// Hermite cúbico con tangentes temporales: mantiene la velocidad entre keyframes.
function sampleVector(property, index, t) {
  const previous = shots[Math.max(0, index - 1)];
  const a = shots[index], b = shots[index + 1];
  const next = shots[Math.min(shots.length - 1, index + 2)];
  const span = Math.max(.001, b.at - a.at);
  const slopeA = index === 0
    ? vec(b[property]).sub(vec(a[property])).multiplyScalar(1 / span)
    : vec(b[property]).sub(vec(previous[property])).multiplyScalar(1 / Math.max(.001, b.at - previous.at));
  const slopeB = index + 1 === shots.length - 1
    ? vec(b[property]).sub(vec(a[property])).multiplyScalar(1 / span)
    : vec(next[property]).sub(vec(a[property])).multiplyScalar(1 / Math.max(.001, next.at - a.at));
  const p0 = vec(a[property]), p1 = vec(b[property]);
  const t2 = t * t, t3 = t2 * t;
  return p0.multiplyScalar(2*t3 - 3*t2 + 1)
    .addScaledVector(slopeA, (t3 - 2*t2 + t) * span)
    .addScaledVector(p1, -2*t3 + 3*t2)
    .addScaledVector(slopeB, (t3 - t2) * span);
}

function sampleShot(time) {
  let i = shots.length - 2;
  for (let n = 0; n < shots.length - 1; n++) {
    if (time <= shots[n + 1].at) { i = n; break; }
  }
  const a = shots[i], b = shots[i + 1];
  const raw = clamp01((time - a.at) / Math.max(.001, b.at - a.at));
  const label = time < 4 ? shots[0] : time < 7 ? shots[2] : time < 14 ? shots[3] : time < 19 ? shots[5] : shots[6];
  return { cam: sampleVector("cam", i, raw), look: sampleVector("look", i, raw),
    actor: sampleVector("actor", i, raw), show: time >= 4.35, shot: label };
}

let elapsed = 0, playing = false, lastStamp = 0;
function setTime(time) {
  elapsed = THREE.MathUtils.clamp(time, 0, DURATION);
  timeline.value = String(elapsed);
  const pose = sampleShot(elapsed);
  camera.position.copy(pose.cam);
  camera.lookAt(pose.look);
  character.position.copy(pose.actor);
  character.visible = pose.show && !(modelReady.mike || modelReady.micaela);
  const walking = elapsed >= 5 && elapsed <= 23.5;
  const stride = walking ? Math.sin((elapsed - 5) * 7.6) : 0;
  legs[0].rotation.x = stride * .58; legs[1].rotation.x = -stride * .58;
  arms[0].rotation.x = -stride * .38; arms[1].rotation.x = stride * .38;
  torso.rotation.y = elapsed >= 17 ? -.12 : 0;

  const forward = new THREE.Vector3().subVectors(pose.look, pose.cam);
  forward.y = 0;
  if (forward.lengthSq() > .001) forward.normalize();
  const side = new THREE.Vector3(forward.z, 0, -forward.x).normalize();
  heroMike.position.copy(pose.actor).addScaledVector(side, -.68);
  heroMicaela.position.copy(pose.actor).addScaledVector(side, .68);
  heroMike.position.y += walking ? Math.abs(Math.sin((elapsed - 5) * 7.6)) * .045 : Math.sin(elapsed * 1.6) * .012;
  heroMicaela.position.y += walking ? Math.abs(Math.sin((elapsed - 5) * 7.6 + .18)) * .04 : Math.sin(elapsed * 1.6 + .2) * .008;
  heroMike.visible = pose.show && modelReady.mike;
  heroMicaela.visible = pose.show && modelReady.micaela;
  shotLabel.textContent = pose.shot.name;
  timecode.textContent = "00:" + String(Math.floor(elapsed)).padStart(2, "0");
  statusLabel.textContent = playing ? "PLAY" : elapsed >= DURATION ? "FIN" : "PAUSA";
}

function start() {
  if (elapsed >= DURATION) setTime(0);
  intro.classList.add("hidden"); playing = true;
  playButton.textContent = "Ⅱ"; statusLabel.textContent = "PLAY";
}
startButton.addEventListener("click", start);
playButton.addEventListener("click", () => {
  if (elapsed >= DURATION) setTime(0);
  playing = !playing;
  if (playing) intro.classList.add("hidden");
  playButton.textContent = playing ? "Ⅱ" : "▶";
  statusLabel.textContent = playing ? "PLAY" : "PAUSA";
});
restartButton.addEventListener("click", () => {
  setTime(0); playing = false; playButton.textContent = "▶"; intro.classList.remove("hidden");
});
timeline.addEventListener("input", () => {
  playing = false; setTime(Number(timeline.value)); playButton.textContent = "▶";
  statusLabel.textContent = elapsed >= DURATION ? "FIN" : "PAUSA";
});

function resize() {
  const w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight), aspect = w / h;
  camera.aspect = aspect; camera.fov = aspect < .75 ? 58 : 48; camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
window.addEventListener("resize", resize, { passive: true });
resize(); setTime(0);

function frame(stamp) {
  requestAnimationFrame(frame);
  if (!lastStamp) lastStamp = stamp;
  const dt = Math.min((stamp - lastStamp) / 1000, .05); lastStamp = stamp;
  if (playing) {
    for (const mixer of mixers) mixer.update(dt);
    const next = elapsed + dt;
    if (next >= DURATION) {
      setTime(DURATION); playing = false; playButton.textContent = "▶"; statusLabel.textContent = "FIN";
    } else setTime(next);
  }
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
canvas.addEventListener("webglcontextlost", event => {
  event.preventDefault(); statusLabel.textContent = "RENDER INTERRUMPIDO";
});
