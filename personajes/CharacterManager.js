import * as THREE from "https://unpkg.com/three@0.180.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

const OLD_REPO = "https://raw.githubusercontent.com/josuedanielmartinezortiz-maker/Game/main/3D/";

export class CharacterManager {
  constructor(scene){
    this.scene=scene;
    this.loader=new GLTFLoader();
    this.characters={};
  }

  async loadAll(){
    await Promise.all([
      this.load("Mike","mike.glb",-2.1),
      this.load("Micaela","micaela.glb",2.1)
    ]);
  }

  load(name,file,x){
    return new Promise((resolve,reject)=>{
      this.loader.load(OLD_REPO+file,gltf=>{
        const root=gltf.scene;

        root.position.set(x,0,0);
        root.scale.setScalar(1.8);

        root.traverse(o=>{
          if(o.isMesh){
            o.castShadow=true;
            o.receiveShadow=true;
          }
        });

        // Ropa ajustada al tamaño REAL del GLB, no a coordenadas fijas.
        // Cada prenda se crea dentro del mismo root para que conserve
        // exactamente la escala/posición del personaje.
        const box=new THREE.Box3().setFromObject(root);
        const size=box.getSize(new THREE.Vector3());
        const center=box.getCenter(new THREE.Vector3());
        const h=size.y;
        const w=size.x;

        if(name==="Mike") this.addMikeClothes(root,center,size);
        else this.addMicaelaClothes(root,center,size);

        this.scene.add(root);
        this.characters[name]={
          root,
          animations:gltf.animations,
          mixer:gltf.animations?.length ? new THREE.AnimationMixer(root) : null
        };

        resolve(root);
      },undefined,reject);
    });
  }
}
