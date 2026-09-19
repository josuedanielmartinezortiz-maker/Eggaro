import * as THREE from "https://unpkg.com/three@0.180.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";
const OLD_REPO="https://raw.githubusercontent.com/josuedanielmartinezortiz-maker/Game/main/3D/";

export class CharacterManager{
  constructor(scene){this.scene=scene;this.loader=new GLTFLoader();this.characters={};}
  async loadAll(){await Promise.all([this.load("Mike","mike.glb"),this.load("Micaela","micaela.glb")]);}
  load(name,file){
    return new Promise((resolve,reject)=>{
      this.loader.load(OLD_REPO+file,gltf=>{
        const root=gltf.scene;
        root.position.set(0,0,0);
        root.scale.setScalar(.92);
        root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
        const mixer=gltf.animations?.length?new THREE.AnimationMixer(root):null;
        const clips=gltf.animations||[];
        this.scene.add(root);
        this.characters[name]={root,animations:clips,mixer,currentAction:null};
        resolve(root);
      },undefined,reject);
    });
  }
  play(name,pattern){
    const c=this.characters[name]; if(!c?.mixer||!c.animations?.length)return false;
    const clip=c.animations.find(a=>new RegExp(pattern,"i").test(a.name)); if(!clip)return false;
    const next=c.mixer.clipAction(clip);
    if(c.currentAction&&c.currentAction!==next)c.currentAction.fadeOut(.2);
    next.reset().fadeIn(.2).play(); c.currentAction=next; return true;
  }
  setVisible(selected){for(const key in this.characters)this.characters[key].root.visible=key===selected;}
  update(dt){for(const key in this.characters){const m=this.characters[key].mixer;if(m)m.update(dt);}}
}