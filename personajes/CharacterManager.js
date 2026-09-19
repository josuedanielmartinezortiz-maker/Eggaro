import * as THREE from "https://unpkg.com/three@0.180.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

const OLD_REPO = "https://raw.githubusercontent.com/josuedanielmartinezortiz-maker/Game/main/3D/";

export class CharacterManager {
  constructor(scene){this.scene=scene;this.loader=new GLTFLoader();this.characters={}}
  async loadAll(){await Promise.all([this.load("Mike","mike.glb",-2.1),this.load("Micaela","micaela.glb",2.1)])}
  load(name,file,x){
    return new Promise((resolve,reject)=>{
      this.loader.load(OLD_REPO+file,gltf=>{
        const root=gltf.scene; root.position.set(x,0,0); root.scale.setScalar(1.8);
        root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
        if(name==="Mike") this.addMikeClothes(root); else this.addMicaelaClothes(root);
        this.scene.add(root); this.characters[name]={root,animations:gltf.animations}; resolve(root);
      },undefined,reject);
    });
  }
  mesh(g,m,p,pos,s=[1,1,1]){
    const x=new THREE.Mesh(g,m); x.position.set(...pos); x.scale.set(...s); x.castShadow=true;x.receiveShadow=true;p.add(x);return x;
  }
  addMikeClothes(root){
    const yellow=new THREE.MeshStandardMaterial({color:0xf4c542,roughness:.9});
    const blue=new THREE.MeshStandardMaterial({color:0x3f72b5,roughness:.95});
    const orange=new THREE.MeshStandardMaterial({color:0xf08a32,roughness:.9});
    const pink=new THREE.MeshStandardMaterial({color:0xe78bb2,roughness:.9});
    this.mesh(new THREE.CapsuleGeometry(.48,.72,5,10),yellow,root,[0,1.18,0],[1,.8,.65]);
    this.mesh(new THREE.BoxGeometry(.76,.12,.72),blue,root,[0,1.24,.01]);
    this.mesh(new THREE.BoxGeometry(.76,.12,.72),orange,root,[0,1.03,.01]);
    this.mesh(new THREE.BoxGeometry(.82,.34,.62),blue,root,[0,.63,0],[1,1,.95]);
    this.mesh(new THREE.BoxGeometry(.18,.09,.05),pink,root,[0,.84,.34]);
  }
  addMicaelaClothes(root){
    const blouse=new THREE.MeshStandardMaterial({color:0xf3b7cf,roughness:.9});
    const skirt=new THREE.MeshStandardMaterial({color:0xe77fae,roughness:.95});
    const pink=new THREE.MeshStandardMaterial({color:0xf08db7,roughness:.9});
    this.mesh(new THREE.CapsuleGeometry(.5,.68,5,10),blouse,root,[0,1.17,0],[1,.8,.67]);
    this.mesh(new THREE.TorusGeometry(.28,.055,8,20),blouse,root,[0,1.48,.02],[1,.55,1]);
    this.mesh(new THREE.SphereGeometry(.12,10,8),pink,root,[0,1.18,.37],[1,.7,.45]);
    this.mesh(new THREE.ConeGeometry(.58,.55,12),skirt,root,[0,.69,0],[1,1,.9]);
    this.mesh(new THREE.CylinderGeometry(.22,.25,.45,10),pink,root,[-.24,.28,.02]);
    this.mesh(new THREE.CylinderGeometry(.22,.25,.45,10),pink,root,[.24,.28,.02]);
  }
}