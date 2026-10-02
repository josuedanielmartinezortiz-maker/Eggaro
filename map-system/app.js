import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// EGGARO Map System — controles suaves y objetos con más detalle geométrico.
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8d5ef);
scene.fog = new THREE.Fog(0xa8d5ef, 95, 230);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, .1, 400);
camera.position.set(40, 38, 52);
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
// Perfil Android: limita resolución interna para evitar caídas de FPS.
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.15));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = .09;
controls.rotateSpeed = .42;
controls.zoomSpeed = .55;
controls.panSpeed = .35;
controls.minPolarAngle = .18;
controls.maxPolarAngle = Math.PI / 2.04;
controls.minDistance = 13;
controls.maxDistance = 105;
controls.screenSpacePanning = false;
scene.add(new THREE.HemisphereLight(0xdaf1ff, 0x665039, 1.55));
const sun = new THREE.DirectionalLight(0xffedc4, 1.8);
sun.position.set(-38, 72, 34); sun.castShadow = true;
sun.shadow.mapSize.set(768, 768);
sun.shadow.camera.left = -85; sun.shadow.camera.right = 85;
sun.shadow.camera.top = 85; sun.shadow.camera.bottom = -85;
sun.shadow.bias = -.00025; scene.add(sun);
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
const objects = new THREE.Group(); scene.add(objects);
const map = []; let selected = 'wheat';
const mat = (color, roughness=1, extra={}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const M = {
 grass:mat(0x65994c), grass2:mat(0x82ad5c), dirt:mat(0x987047), pathEdge:mat(0x6e5238),
 wood:mat(0x67432d), wood2:mat(0x98704b), woodLight:mat(0xb58a5d), bark:mat(0x59402d),
 stone:mat(0x858178), stoneDark:mat(0x55534d), dark:mat(0x241d18), water:mat(0x329fca,.24,{metalness:.08}),
 roof:mat(0x70442f), thatch:mat(0x9c7540), wheat:mat(0xd5ad4d), leaf:mat(0x34743b),
 leaf2:mat(0x568c42), leaf3:mat(0x759e4a), apple:mat(0xc52e28), metal:mat(0x777c7b,.45),
 glass:mat(0x9ccbd0,.18,{metalness:.2}), flower:mat(0xf3d9a0),
};
function mesh(geo, material, x=0,y=0,z=0, parent=objects){const o=new THREE.Mesh(geo,material);o.position.set(x,y,z);o.castShadow=false;o.receiveShadow=false;parent.add(o);return o;}
function box(w,h,d,m,x=0,y=h/2,z=0,p=objects){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,p)}
function cyl(rt,rb,h,m,x=0,y=h/2,z=0,seg=12,p=objects){return mesh(new THREE.CylinderGeometry(rt,rb,h,seg),m,x,y,z,p)}
function sphere(r,m,x=0,y=0,z=0,p=objects,seg=10){return mesh(new THREE.SphereGeometry(r,seg,Math.max(6,seg-2)),m,x,y,z,p)}
function group(x=0,y=0,z=0){const g=new THREE.Group();g.position.set(x,y,z);objects.add(g);return g}
function ground(){const geo=new THREE.PlaneGeometry(140,105,48,36);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getY(i);p.setZ(i,.27*Math.sin(x*.12)*Math.cos(z*.13)+.12*Math.sin(z*.31));}geo.rotateX(-Math.PI/2);const o=mesh(geo,M.grass,0,0,0);o.receiveShadow=true;o.castShadow=false}
function path(x,z,w,d,rot=0){const g=group(x,.045,z);const edge=box(w+.45,.06,d+.5,M.pathEdge,0,0,0,g);edge.rotation.y=rot;const top=box(w,.065,d,M.dirt,0,.035,0,g);top.rotation.y=rot;return g}
function pebble(x,y,z,r=.2,p=objects){const o=mesh(new THREE.DodecahedronGeometry(r,1),M.stone,x,y,z,p);o.scale.set(1.25,.65,.85);o.rotation.set(Math.random(),Math.random(),Math.random());return o}
function grassTuft(x,z,p=objects){const g=new THREE.Group();for(let i=0;i<5;i++){const blade=mesh(new THREE.ConeGeometry(.07,.55+Math.random()*.35,4),i%2?M.grass2:M.leaf2,(Math.random()-.5)*.35,.25,(Math.random()-.5)*.35,g);blade.rotation.z=(Math.random()-.5)*.45}g.position.set(x,.04,z);p.add(g)}
function water(){const g=new THREE.PlaneGeometry(140,19,40,8);const o=mesh(g,M.water,0,.07,42);o.rotation.x=-Math.PI/2;o.castShadow=false;for(let i=0;i<42;i++){const x=(Math.random()-.5)*70,z=34+Math.random()*15;pebble(x,.12,z,.18+Math.random()*.38)}for(let i=0;i<30;i++)grassTuft((Math.random()-.5)*68,32+Math.random()*3)}
function wheat(x,z){const g=group(x,.06,z);for(let i=0;i<9;i++){const sx=(Math.random()-.5)*1.25,sz=(Math.random()-.5)*1.25,h=1.15+Math.random()*.8;const stem=cyl(.025,.035,h,M.wheat,sx,h/2,sz,5,g);stem.rotation.z=(Math.random()-.5)*.12;stem.rotation.x=(Math.random()-.5)*.1;const head=sphere(.105,M.thatch,sx,h+.04,sz,g,7);head.scale.set(.65,1.8,.65);const grain=sphere(.05,M.thatch,sx,h+.08,sz,g,6);grain.scale.set(.7,1.35,.7)}return g}
function tree(x,z,appleTree=false){const g=group(x,.05,z);cyl(.34,.48,2.6,M.bark,0,1.3,0,9,g);for(let i=0;i<4;i++){const b=cyl(.13,.24,1.2,M.bark,0,2.1,0,7,g);b.position.set((Math.random()-.5)*.8,2.1+Math.random()*.5,(Math.random()-.5)*.8);b.rotation.z=(Math.random()-.5)*.9}for(let i=0;i<9;i++){const a=i*Math.PI*2/9,rad=.85+Math.random()*.5,y=2.7+Math.random()*1.1,s=.85+Math.random()*.45;const crown=mesh(new THREE.IcosahedronGeometry(s,1),[M.leaf,M.leaf2,M.leaf3][i%3],Math.cos(a)*rad,y,Math.sin(a)*rad,g);crown.scale.y=.82;crown.rotation.set(Math.random(),Math.random(),Math.random());if(appleTree&&i%2===0)for(let j=0;j<3;j++)sphere(.12,M.apple,crown.position.x+(Math.random()-.5)*.9,crown.position.y-.2+Math.random()*.25,crown.position.z+(Math.random()-.5)*.9,g,8)}return g}
function gabledRoof(w,d,h,m,p){const g=new THREE.Group();const ridge=box(w,.18,.2,m,0,h,0,g);for(const side of [-1,1]){const panel=box(w*.72,.16,d*1.02,m,0,h-.42,side*d*.25,g);panel.rotation.x=side*.65}p.add(g);return g}
function building(x,z,w,d,h,type='house'){const g=group(x,0,z);const wall=type==='shop'?mat(0xb49a73):M.wood2;box(w,h,d,wall,0,h/2,0,g);gabledRoof(w,d,h*.75,type==='shop'?M.roof:M.thatch,g);box(w*.16,h*.52,.12,M.dark,0,h*.26,d/2+.07,g);box(w*.19,.12,.18,M.wood,0,h*.53,d/2+.12,g);sphere(.055,M.metal,w*.055,h*.27,d/2+.15,g,8);for(const side of [-1,1]){box(w*.18,h*.2,.1,M.glass,side*w*.29,h*.58,d/2+.065,g);box(w*.2,.1,.16,M.wood,side*w*.29,h*.58,d/2+.13,g);box(.1,h*.23,.16,M.wood,side*w*.29,h*.58,d/2+.14,g)}for(let i=0;i<Math.ceil(w/1.2);i++){const x0=-w/2+.5+i*1.2;box(.035,h,.04,M.wood,x0,h/2,d/2+.025,g)}for(let i=0;i<Math.ceil(w/.8);i++)box(.72,.28,d+.25,M.stone,-w/2+.4+i*.8,.14,0,g);box(1.4,.18,.55,M.stone,0,.09,d/2+.3,g);return g}
function sawmill(x,z){const g=group(x,0,z);box(6,2,4,M.wood2,0,1,0,g);gabledRoof(6,4,2.9,M.roof,g);for(let i=0;i<5;i++){const log=cyl(.28,.32,2.6,M.bark,-2.4+i*.55,.38,2.25,10,g);log.rotation.z=Math.PI/2;for(let e of [-1,1])cyl(.29,.29,.06,M.woodLight,-2.4+i*.55+e*1.31,.38,2.25,10,g).rotation.z=Math.PI/2}const axle=cyl(.15,.15,.4,M.metal,-1.5,1.35,2.25,12,g);axle.rotation.x=Math.PI/2;const blade=mesh(new THREE.CylinderGeometry(.85,.85,.13,20),M.metal,-1.5,1.35,2.5,g);blade.rotation.x=Math.PI/2;for(let i=0;i<8;i++){const tooth=box(.12,.18,.08,M.dark,-1.5+Math.cos(i*Math.PI/4)*.85,1.35+Math.sin(i*Math.PI/4)*.85,2.6,g);tooth.rotation.z=i*Math.PI/4}return g}
function mill(x,z){const g=group(x,0,z);cyl(2.05,2.6,5,M.stone,0,2.5,0,16,g);cyl(2.12,2.12,.25,M.stoneDark,0,4.65,0,16,g);const roof=mesh(new THREE.ConeGeometry(2.65,2.2,8),M.roof,0,6,0,g);roof.rotation.y=Math.PI/8;box(.75,1.65,.12,M.dark,0,.83,2.08,g);for(const side of [-1,1])box(.75,.7,.1,M.glass,side*.85,3.25,1.83,g);const hub=sphere(.35,M.woodLight,0,4.6,2.18,g,10);for(let i=0;i<4;i++){const a=i*Math.PI/2;const arm=box(.3,4.3,.16,M.wood,Math.sin(a)*2.15,4.6+Math.cos(a)*2.15,2.25,g);arm.rotation.z=-a;const sail=box(1.2,2.5,.12,M.woodLight,Math.sin(a)*3.05,4.6+Math.cos(a)*3.05,2.28,g);sail.rotation.z=-a}return g}
function well(x,z){const g=group(x,0,z);for(let i=0;i<16;i++){const a=i*Math.PI*2/16,stone=cyl(.27,.3,.62,M.stone,Math.cos(a)*1.25,.31,Math.sin(a)*1.25,8,g);stone.rotation.y=a}cyl(1.04,1.04,.1,M.water,0,.64,0,20,g);for(const s of [-1,1])box(.16,2.4,.16,M.wood,s*1.25,1.3,0,g);const beam=cyl(.12,.12,2.8,M.woodLight,0,2.3,0,8,g);beam.rotation.z=Math.PI/2;const roof=mesh(new THREE.ConeGeometry(1.5,.9,4),M.roof,0,3.1,0,g);roof.rotation.y=Math.PI/4;return g}
function cave(x,z){const g=group(x,0,z);for(let i=0;i<9;i++){const a=Math.PI+i*Math.PI/8,r=3.1+Math.random()*.35,s=.75+Math.random()*.4;const b=mesh(new THREE.DodecahedronGeometry(s,1),i%2?M.stone:M.stoneDark,Math.cos(a)*r,2.6+Math.sin(a)*2.0,0,g);b.scale.set(1.15,1.2,.9)}box(4.7,3.1,1.2,M.dark,0,1.55,.25,g);box(3.8,2.65,.18,M.wood,-.1,1.35,.95,g);for(let i=0;i<5;i++)box(.1,2.7,.12,M.woodLight,-1.8+i*.85,1.35,1.08,g);box(4.2,.18,.2,M.woodLight,0,2.72,1.08,g);box(4.2,.18,.2,M.woodLight,0,.08,1.08,g);box(2.1,.65,.18,M.woodLight,0,4.8,.1,g);return g}
function rock(x,z){const s=.5+Math.random()*1.1;const o=mesh(new THREE.DodecahedronGeometry(s,1),M.stone,x,s*.45,z);o.scale.set(1.2,.7,.9);o.rotation.set(Math.random()*.3,Math.random()*3,Math.random()*.3);return o}
function flowers(x,z){const g=group(x,.03,z);for(let i=0;i<5;i++){const a=Math.random()*Math.PI*2,r=Math.random()*.5;const px=Math.cos(a)*r,pz=Math.sin(a)*r;cyl(.025,.03,.3,M.leaf2,px,.15,pz,5,g);for(let j=0;j<5;j++){const t=j*Math.PI*2/5;sphere(.065,j%2?M.flower:mat(0xf0c5a8),px+Math.cos(t)*.09,.34,pz+Math.sin(t)*.09,g,6)}sphere(.05,mat(0xe7b93b),px,.34,pz,g,6)}return g}

function deadWheat(x,z){const g=group(x,.05,z);for(let i=0;i<7;i++){const sx=(Math.random()-.5)*1.3,sz=(Math.random()-.5)*1.3,h=.55+Math.random()*.45;const stem=cyl(.025,.035,h,M.thatch,sx,h/2,sz,5,g);stem.rotation.z=(Math.random()-.5)*.45;stem.rotation.x=(Math.random()-.5)*.2}return g}
function ruinedMill(x,z){const g=group(x,0,z);cyl(2.05,2.55,3.5,M.stone,0,1.75,0,16,g);cyl(2.12,2.12,.22,M.stoneDark,0,3.35,0,16,g);box(3.8,.22,.35,M.wood,-.4,3.55,0,g).rotation.z=-.16;for(let i=0;i<3;i++){const a=i*2.1;const arm=box(.22,3.1,.16,M.wood,Math.sin(a)*1.55,3.2+Math.cos(a)*1.55,2.05,g);arm.rotation.z=-a}box(1.4,1.2,.15,M.dark,0,.6,2.05,g);return g}
function ruinedSawmill(x,z){const g=group(x,0,z);box(6,1.6,4,M.wood2,0,.8,0,g);for(let i=0;i<4;i++){const post=box(.22,2.8,.22,M.wood,-2.5+i*1.65,1.4,1.8,g);post.rotation.z=(i%2?-1:1)*.18}box(6.3,.22,1.2,M.wood,-.3,2.2,0,g).rotation.z=-.12;for(let i=0;i<4;i++){const log=cyl(.25,.3,2.5,M.bark,-2+i*.65,.35,2.25,10,g);log.rotation.z=Math.PI/2}return g}
function coop(x,z){const g=group(x,0,z);box(6,2.8,5,M.wood2,0,1.4,0,g);gabledRoof(6,5,3.5,M.thatch,g);box(1.5,1.8,.15,M.dark,0,.9,2.56,g);for(let i=-2;i<=2;i++)box(.18,2.1,.18,M.wood,i*1.1,1.05,2.7,g);box(6.4,.2,.2,M.woodLight,0,2.5,2.7,g);return g}
function hole(x,z){const g=group(x,.01,z);const ring=new THREE.RingGeometry(1.8,3.1,24);const r=mesh(ring,M.stone,0,.03,0,g);r.rotation.x=-Math.PI/2;const pit=mesh(new THREE.CircleGeometry(1.8,24),M.dark,0,.02,0,g);pit.rotation.x=-Math.PI/2;return g}
function sealedHole(x,z){const g=hole(x,z);for(let i=0;i<6;i++){const b=box(.28,2.5,.18,M.woodLight,-1.25+i*.5,1.25,2.72,g);b.rotation.z=(i%2?-.08:.08)}box(3.2,.18,.22,M.wood,0,2.6,2.72,g);return g}
function dryApple(x,z){const g=group(x,.05,z);cyl(.42,.58,3.4,M.bark,0,1.7,0,9,g);for(let i=0;i<5;i++){const b=cyl(.13,.22,1.7,M.bark,0,2.4,0,7,g);b.position.set((Math.random()-.5)*1.5,2.5+Math.random()*.5,(Math.random()-.5)*1.5);b.rotation.z=(Math.random()-.5)*1.1;for(let j=0;j<2;j++)sphere(.16,M.apple,b.position.x+(Math.random()-.5)*.45,b.position.y-.15+Math.random()*.35,b.position.z+(Math.random()-.5)*.45,g,8)}return g}
function markStatic(g){g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});return g}
function clearScene(){while(objects.children.length)objects.remove(objects.children[0])}
function buildBase(){clearScene();map.length=0;ground();for(let x=-29;x<=-8;x+=2.5)for(let z=-34;z<=-9;z+=2.3)wheat(x+Math.random()*.55,z+Math.random()*.55);for(let x=-20;x<=-8;x+=2.8)for(let z=-30;z<-8;z+=3.1)deadWheat(x+Math.random()*.5,z+Math.random()*.5);ruinedMill(17,-4);ruinedSawmill(-19,-2);building(-14,9,12,8,5,'house');coop(17,10);well(-4,20);sealedHole(26,-34);dryApple(16,-24);
  // Solo los edificios reciben sombra: reduce mucho el coste en móviles.
  objects.traverse(o=>{if(o.isMesh && o.parent && o.parent.parent===objects)o.castShadow=false;});
}
function add(type,x,z){const before=objects.children.length;let o=null;if(type==='wheat')o=wheat(x,z);else if(type==='deadWheat')o=deadWheat(x,z);else if(type==='ruinedMill')o=ruinedMill(x,z);else if(type==='ruinedSawmill')o=ruinedSawmill(x,z);else if(type==='house')o=building(x,z,8,6,4.5);else if(type==='coop')o=coop(x,z);else if(type==='well')o=well(x,z);else if(type==='hole')o=hole(x,z);else if(type==='sealedHole')o=sealedHole(x,z);else if(type==='dryApple')o=dryApple(x,z);if(o){for(let i=before;i<objects.children.length;i++)objects.children[i].userData.editable=true;map.push({type,x,z});toast(type+' colocado')}}
function toast(t){const e=document.getElementById('toast');if(!e)return;e.textContent=t;e.style.opacity=1;clearTimeout(window.egToast);window.egToast=setTimeout(()=>e.style.opacity=0,1000)}
let pointerStart=null;
renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;pointerStart={x:e.clientX,y:e.clientY,id:e.pointerId}});
renderer.domElement.addEventListener('pointerup',e=>{if(!pointerStart||pointerStart.id!==e.pointerId)return;const moved=Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y);pointerStart=null;if(moved>9)return;mouse.x=e.clientX/innerWidth*2-1;mouse.y=-(e.clientY/innerHeight)*2+1;ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(objects.children,true).find(h=>h.object!==undefined);if(!hit)return;const p=hit.point;if(selected==='erase'){let target=hit.object;while(target.parent&&target.parent!==objects)target=target.parent;if(target.parent===objects&&target.userData.editable){objects.remove(target);toast('Objeto borrado')}else toast('Solo puedes borrar objetos que agregaste');return}add(selected,Math.round(p.x),Math.round(p.z))});
renderer.domElement.addEventListener('pointercancel',()=>pointerStart=null);
document.querySelectorAll('#palette button').forEach(b=>b.onclick=()=>{selected=b.dataset.type;document.querySelectorAll('#palette button').forEach(x=>x.classList.remove('active'));b.classList.add('active')});
const first=document.querySelector('#palette button');if(first)first.classList.add('active');
document.getElementById('refBtn')?.addEventListener('click',()=>document.getElementById('reference')?.classList.add('show'));
document.getElementById('closeRef')?.addEventListener('click',()=>document.getElementById('reference')?.classList.remove('show'));
document.getElementById('saveBtn')?.addEventListener('click',()=>{localStorage.setItem('eggaroMap',JSON.stringify(map));toast('Mapa guardado en este dispositivo')});
document.getElementById('exportBtn')?.addEventListener('click',()=>{const b=new Blob([JSON.stringify({version:2,objects:map},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='eggaro-map.json';a.click();URL.revokeObjectURL(a.href);toast('JSON exportado')});
buildBase();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false)});
(function loop(){requestAnimationFrame(loop);controls.update();renderer.render(scene,camera)})();