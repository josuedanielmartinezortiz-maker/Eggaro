import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';
import {GLTFExporter} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/exporters/GLTFExporter.js';
import {SkeletonHelper} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/src/helpers/SkeletonHelper.js';

const $=id=>document.getElementById(id), V=$('view'), status=$('status');
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x0b0f15);
const camera=new THREE.PerspectiveCamera(45,1,.01,100); camera.position.set(3,2.4,5);
const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); V.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true;
scene.add(new THREE.HemisphereLight(0xffffff,0x405060,2.5)); const grid=new THREE.GridHelper(12,24); scene.add(grid);
function resize(){const r=V.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()} addEventListener('resize',resize);resize();
(function loop(){requestAnimationFrame(loop);controls.update();renderer.render(scene,camera)})();

const specs=[
['Cuerpo','sphere'],['Cabeza','sphere'],['Pico','cone'],['Cresta','cone'],['Ojo izquierdo','eye'],['Ojo derecho','eye'],
['Ala izquierda','wing'],['Ala derecha','wing'],['Pata izquierda','leg'],['Pata derecha','leg'],['Cola','tail'],
['Gafas','glasses'],['Sombrero','hat'],['Corona','crown'],['Mochila','box'],['Armadura','armor'],
['Cuerno izquierdo','horn'],['Cuerno derecho','horn'],['Bigote','mustache'],['Bufanda','scarf'],
['Halo','halo'],['Capa','cape'],['Escudo','shield'],['Pluma','feather'],['Flor','flower'],['Caparazón','shell']
];
const partsEl=$('parts'); specs.forEach(([n,t])=>{const b=document.createElement('button');b.textContent='+ '+n;b.onclick=()=>addPart(n,t);partsEl.appendChild(b)});
let root=null, bones=[], helper=null, selected=null, skeleton=null, rigCreated=false;
const boneNames=['Root','Spine','Head','LeftWing','RightWing','LeftLeg','RightLeg','Tail'];

function mat(c=$('color').value){return new THREE.MeshStandardMaterial({color:c,roughness:.72,metalness:.05})}
function geometry(t){
 if(t==='sphere')return new THREE.SphereGeometry(.5,24,16);
 if(t==='cone'||t==='crest')return new THREE.ConeGeometry(.3,.65,20);
 if(t==='leg')return new THREE.CylinderGeometry(.11,.14,.7,16);
 if(t==='wing')return new THREE.SphereGeometry(.38,20,12);
 if(t==='tail')return new THREE.ConeGeometry(.22,.65,18);
 if(t==='eye')return new THREE.SphereGeometry(.11,16,12);
 if(t==='glasses'||t==='mustache'||t==='scarf'||t==='halo'||t==='crown')return new THREE.TorusGeometry(.3,.075,12,24);
 if(t==='hat')return new THREE.CylinderGeometry(.34,.42,.35,20);
 if(t==='horn'||t==='feather')return new THREE.ConeGeometry(.16,.55,16);
 if(t==='cape')return new THREE.PlaneGeometry(.9,.9);
 if(t==='shield')return new THREE.CylinderGeometry(.42,.42,.12,20);
 if(t==='flower')return new THREE.TorusGeometry(.18,.07,10,16);
 if(t==='shell')return new THREE.SphereGeometry(.58,24,16);
 if(t==='armor')return new THREE.BoxGeometry(.75,.55,.4);
 return new THREE.BoxGeometry(.55,.4,.3);
}
function ensureRoot(){if(!root){root=new THREE.Group();root.name=$('name').value;scene.add(root);buildRig()}}
function buildRig(){bones=boneNames.map(n=>{const b=new THREE.Bone();b.name=n;return b});bones[0].add(bones[1],bones[5],bones[6],bones[7]);bones[1].add(bones[2],bones[3],bones[4]);bones[1].position.y=.6;bones[2].position.y=.55;bones[3].position.x=-.6;bones[4].position.x=.6;bones[5].position.set(-.25,-.65,0);bones[6].position.set(.25,-.65,0);bones[7].position.set(0,.15,-.55);root.add(bones[0]);fillBones()}
function fillBones(){$('bones').innerHTML='';bones.forEach((b,i)=>{const o=document.createElement('option');o.value=i;o.textContent=b.name;$('bones').appendChild(o)});loadBone()}
function loadBone(){const b=bones[+$('bones').value];if(!b)return;$('bpx').value=b.position.x.toFixed(2);$('bpy').value=b.position.y.toFixed(2);$('bpz').value=b.position.z.toFixed(2);$('bx').value=Math.round(THREE.MathUtils.radToDeg(b.rotation.x));$('by').value=Math.round(THREE.MathUtils.radToDeg(b.rotation.y));$('bz').value=Math.round(THREE.MathUtils.radToDeg(b.rotation.z))}
$('bones').onchange=loadBone;
function addPart(n,t){
 ensureRoot(); const m=new THREE.Mesh(geometry(t),mat());m.name=n;m.userData.type=t;m.userData.id=crypto.randomUUID();
 const map={'Cabeza':2,'Ojo izquierdo':2,'Ojo derecho':2,'Ala izquierda':3,'Ala derecha':4,'Pata izquierda':5,'Pata derecha':6,'Cola':7};
 const bi=map[n]??1; bones[bi].add(m);
 const pos={Cuerpo:[0,1,0],Cabeza:[0,1.65,0],Pico:[0,1.55,.48],Cresta:[0,2.05,0],['Ojo izquierdo']:[-.18,1.7,.45],['Ojo derecho']:[.18,1.7,.45],['Ala izquierda']:[-.55,1.25,0],['Ala derecha']:[.55,1.25,0],['Pata izquierda']:[-.25,.35,0],['Pata derecha']:[.25,.35,0],Cola:[0,1.15,-.55]}[n];
 if(pos)m.position.set(...pos); else m.position.set(0,1.3,0);
 selected=m; refreshObjects(); status.textContent=n+' añadido';
}
function refreshObjects(){const s=$('objects');s.innerHTML='';if(!root)return;root.traverse(o=>{if(o.isMesh){const opt=document.createElement('option');opt.value=o.userData.id;opt.textContent=o.name;s.appendChild(opt)}});if(selected){s.value=selected.userData.id;loadSelected()}}
function findSelected(){let id=$('objects').value, found=null;root?.traverse(o=>{if(o.isMesh&&o.userData.id===id)found=o});return found}
function loadSelected(){selected=findSelected();if(!selected)return;selected.updateMatrixWorld(true);$('px').value=selected.position.x.toFixed(2);$('py').value=selected.position.y.toFixed(2);$('pz').value=selected.position.z.toFixed(2);$('scale').value=selected.scale.x.toFixed(2);$('ox').value=Math.round(THREE.MathUtils.radToDeg(selected.rotation.x));$('oy').value=Math.round(THREE.MathUtils.radToDeg(selected.rotation.y));$('oz').value=Math.round(THREE.MathUtils.radToDeg(selected.rotation.z));$('color').value='#'+selected.material.color.getHexString()}
$('objects').onchange=loadSelected;
$('applyObj').onclick=()=>{selected=findSelected();if(!selected)return;selected.position.set(+$('px').value,+$('py').value,+$('pz').value);const sc=+$('scale').value;selected.scale.set(sc,sc,sc);selected.rotation.set(THREE.MathUtils.degToRad(+$('ox').value),THREE.MathUtils.degToRad(+$('oy').value),THREE.MathUtils.degToRad(+$('oz').value));selected.material.color.set($('color').value);status.textContent='Pieza actualizada'};
$('duplicateBtn').onclick=()=>{selected=findSelected();if(!selected)return;const c=selected.clone();c.userData={...selected.userData,id:crypto.randomUUID()};c.position.x+=.2;c.name=selected.name+' copia';selected.parent.add(c);refreshObjects();status.textContent='Pieza duplicada'};
$('deleteBtn').onclick=()=>{selected=findSelected();if(!selected)return;selected.parent.remove(selected);refreshObjects();status.textContent='Pieza eliminada'};
$('newBtn').onclick=()=>{if(root)scene.remove(root);root=new THREE.Group();root.name=$('name').value;scene.add(root);buildRig();['Cuerpo','Cabeza','Pico','Cresta','Ojo izquierdo','Ojo derecho','Ala izquierda','Ala derecha','Pata izquierda','Pata derecha','Cola'].forEach(n=>addPart(n,specs.find(x=>x[0]===n)[1]));status.textContent='Pollo nuevo creado'};
$('applyBone').onclick=()=>{const b=bones[+$('bones').value];if(!b)return;b.position.set(+$('bpx').value,+$('bpy').value,+$('bpz').value);b.rotation.set(THREE.MathUtils.degToRad(+$('bx').value),THREE.MathUtils.degToRad(+$('by').value),THREE.MathUtils.degToRad(+$('bz').value));if(skeleton)skeleton.calculateInverses();status.textContent='Hueso actualizado'};
$('bones').onchange=loadBone;
$('resetBone').onclick=()=>{bones.forEach(b=>b.rotation.set(0,0,0));if(rigCreated)buildAutoSkeleton();loadBone();status.textContent='Rig restaurado'};
$('toggleSkeleton').onclick=()=>{if(!root)return;if(helper){scene.remove(helper);helper=null}else{helper=new SkeletonHelper(root);scene.add(helper)}};
$('color').oninput=()=>{selected=findSelected();if(selected)selected.material.color.set($('color').value)};
async function loadGLBData(buffer,name){
 status.textContent='Cargando '+name+'...';
 new GLTFLoader().parse(buffer,'',g=>{
   if(root)scene.remove(root);
   root=g.scene; root.name=name.replace(/\.glb$/i,''); scene.add(root);
   bones=[]; skeleton=null; rigCreated=false;
   root.traverse(o=>{if(o.isBone)bones.push(o);if(o.isMesh&&!o.userData.id)o.userData.id=crypto.randomUUID()});
   fillBones(); refreshObjects();
   status.textContent='✅ '+name+' cargado · '+bones.length+' huesos · pulsa Crear rig automático';
 },err=>{console.error(err);status.textContent='❌ No se pudo cargar '+name});
}
$('file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{await loadGLBData(await f.arrayBuffer(),f.name)}catch(err){console.error(err);status.textContent='❌ Archivo GLB inválido'}};
async function loadRepoGLB(url,name){
 try{const res=await fetch(url,{cache:'no-store'});if(!res.ok)throw new Error('HTTP '+res.status);await loadGLBData(await res.arrayBuffer(),name)}
 catch(err){console.error(err);status.textContent='❌ No se pudo descargar '+name}
}
$('loadMike').onclick=()=>loadRepoGLB('../mike-optimized.glb','mike-optimized.glb');
$('loadMicaela').onclick=()=>loadRepoGLB('../micaela-optimized.glb','micaela-optimized.glb');


// ===== RIG AUTOMÁTICO EDITABLE =====
function collectMeshes(){const a=[];root?.traverse(o=>{if(o.isMesh)a.push(o)});return a}
function modelBounds(){const box=new THREE.Box3();root.updateMatrixWorld(true);collectMeshes().forEach(m=>box.expandByObject(m));return box}
function clearRig(){if(helper){scene.remove(helper);helper=null}bones=[];skeleton=null;root?.traverse(o=>{if(o.isSkinnedMesh)o.bindMode='attached'})}
function buildAutoSkeleton(){
 if(!root)return;
 clearRig();
 const box=modelBounds(), min=box.min,max=box.max, h=Math.max(max.y-min.y,.5), cx=(min.x+max.x)/2, cz=(min.z+max.z)/2;
 const names=['Root','Spine','Chest','Neck','Head','LeftShoulder','LeftArm','LeftHand','RightShoulder','RightArm','RightHand','LeftLeg','LeftFoot','RightLeg','RightFoot'];
 bones=names.map(n=>{const b=new THREE.Bone();b.name=n;return b});
 bones[0].position.set(cx,min.y,cz);
 bones[1].position.set(0,h*.28,0); bones[2].position.set(0,h*.48,0); bones[3].position.set(0,h*.66,0); bones[4].position.set(0,h*.82,0);
 bones[5].position.set(-(max.x-min.x)*.22,0,0);bones[6].position.set(-(max.x-min.x)*.34,0,0);bones[7].position.set(-(max.x-min.x)*.45,0,0);
 bones[8].position.set((max.x-min.x)*.22,0,0);bones[9].position.set((max.x-min.x)*.34,0,0);bones[10].position.set((max.x-min.x)*.45,0,0);
 bones[11].position.set(-(max.x-min.x)*.12,-h*.32,0);bones[12].position.set(0,-h*.12,(max.z-min.z)*.02);
 bones[13].position.set((max.x-min.x)*.12,-h*.32,0);bones[14].position.set(0,-h*.12,(max.z-min.z)*.02);
 bones[0].add(bones[1],bones[11],bones[13]);bones[1].add(bones[2]);bones[2].add(bones[3]);bones[3].add(bones[4],bones[5],bones[8]);bones[5].add(bones[6]);bones[6].add(bones[7]);bones[8].add(bones[9]);bones[9].add(bones[10]);bones[11].add(bones[12]);bones[13].add(bones[14]);root.add(bones[0]);
 skeleton=new THREE.Skeleton(bones);rigCreated=true;fillBones();makeWeights();status.textContent='Rig creado · ajusta huesos y vuelve a vincular';
 if(helper)scene.remove(helper);helper=new SkeletonHelper(root);scene.add(helper);
}
function makeWeights(){
 const meshes=collectMeshes();root.updateMatrixWorld(true);
 const boneWorld=bones.map(b=>{const v=new THREE.Vector3();b.getWorldPosition(v);return v});
 meshes.forEach(mesh=>{
   if(mesh.isSkinnedMesh)return;
   const geo=mesh.geometry.clone(); const pos=geo.getAttribute('position'); if(!pos)return;
   const idx=[],wei=[],v=new THREE.Vector3(),wp=new THREE.Vector3();
   for(let i=0;i<pos.count;i++){
     v.fromBufferAttribute(pos,i);wp.copy(v);mesh.localToWorld(wp);
     root.worldToLocal(wp);
     const ranked=bones.map((b,k)=>({k,d:wp.distanceTo(boneWorld[k])})).sort((a,b)=>a.d-b.d).slice(0,4);
     const inv=ranked.map(x=>1/Math.max(x.d,.001));const sum=inv.reduce((a,b)=>a+b,0);
     for(let k=0;k<4;k++){idx.push(ranked[k].k,0,0,0);wei.push(inv[k]/sum,0,0,0)}
   }
   geo.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(idx,4));geo.setAttribute('skinWeight',new THREE.Float32BufferAttribute(wei,4));
   const sm=new THREE.SkinnedMesh(geo,mesh.material);sm.name=mesh.name;sm.userData={...mesh.userData,id:mesh.userData.id||crypto.randomUUID(),rigged:true};sm.position.copy(mesh.position);sm.quaternion.copy(mesh.quaternion);sm.scale.copy(mesh.scale);
   const parent=mesh.parent;parent.add(sm);parent.remove(mesh);sm.bind(skeleton,sm.matrixWorld); 
 });
 status.textContent='Malla vinculada · pesos automáticos creados';
}
$('autoRig').onclick=()=>buildAutoSkeleton();
$('bindRig').onclick=()=>{if(!rigCreated){status.textContent='Primero crea el rig automático';return}makeWeights()};
function projectData(){const parts=[];root?.traverse(o=>{if(o.isMesh)parts.push({name:o.name,type:o.userData.type||'box',position:o.position.toArray(),rotation:[o.rotation.x,o.rotation.y,o.rotation.z],scale:o.scale.toArray(),color:'#'+o.material.color.getHexString(),parentBone:o.parent?.name||'Spine'})});return {version:3,name:root?.name||$('name').value,bones:bones.map(b=>({name:b.name,rotation:[b.rotation.x,b.rotation.y,b.rotation.z]})),parts}}
$('saveProject').onclick=()=>{if(!root)return;const blob=new Blob([JSON.stringify(projectData(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(root.name||'Eggaro')+'.eggaro.json';a.click();status.textContent='Proyecto guardado'};
$('projectFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{const d=JSON.parse(rd.result);if(root)scene.remove(root);root=new THREE.Group();root.name=d.name||'Pollo';scene.add(root);buildRig();(d.parts||[]).forEach(p=>{const m=new THREE.Mesh(geometry(p.type),mat(p.color));m.name=p.name;m.userData={type:p.type,id:crypto.randomUUID()};m.position.fromArray(p.position);m.rotation.set(...p.rotation);m.scale.fromArray(p.scale);(bones.find(b=>b.name===p.parentBone)||bones[1]).add(m)});(d.bones||[]).forEach(x=>{const b=bones.find(b=>b.name===x.name);if(b)b.rotation.set(...x.rotation)});refreshObjects();status.textContent='Proyecto abierto'}catch(err){console.error(err);status.textContent='JSON inválido'}};rd.readAsText(f)};

function download(data,name){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'model/gltf-binary'}));a.download=name;a.click()}
$('exportBtn').onclick=()=>{if(!root){status.textContent='Crea o carga un pollo';return}status.textContent='Exportando Draco...';new GLTFExporter().parse(root,async data=>{try{const {WebIO}=await import('https://esm.sh/@gltf-transform/core');const {draco}=await import('https://esm.sh/@gltf-transform/functions');const io=new WebIO();const doc=await io.readBinary(new Uint8Array(data));await doc.transform(draco({method:'edgebreaker',encodeSpeed:5,decodeSpeed:5}));download(await io.writeBinary(doc),(root.name||'Eggaro')+'_Draco.glb');status.textContent='GLB Draco exportado'}catch(e){console.error(e);download(data,(root.name||'Eggaro')+'.glb');status.textContent='GLB exportado sin Draco'}} ,e=>{console.error(e);status.textContent='Error de exportación'},{binary:true,trs:true})};

$('newBtn').click();