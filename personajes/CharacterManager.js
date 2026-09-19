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
      this.loader.load(
        OLD_REPO+file,
        gltf=>{
          const root=gltf.scene;
          root.position.set(x,0,0);
          root.scale.setScalar(1.8);
          root.traverse(o=>{
            if(o.isMesh){
              o.castShadow=true;
              o.receiveShadow=true;
            }
          });
          this.scene.add(root);
          this.characters[name]={root,animations:gltf.animations};
          resolve(root);
        },
        undefined,
        reject
      );
    });
  }
}
