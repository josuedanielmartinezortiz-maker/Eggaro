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
        root.scale.setScalar(.72);
        root.updateMatrixWorld(true);
        root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});

        const box=new THREE.Box3().setFromObject(root);
        const bottom=box.min.y;
        if(Number.isFinite(bottom))root.position.y-=bottom;
        root.updateMatrixWorld(true);

        const bones=[];
        root.traverse(o=>{if(o.isBone)bones.push(o);});
        const mixer=gltf.animations?.length?new THREE.AnimationMixer(root):null;

        this.scene.add(root);
        this.characters[name]={
          root,animations:gltf.animations||[],mixer,currentAction:null,bones,
          proceduralWalk:true,walkClock:0,groundY:root.position.y,
          baseRotations:new Map()
        };
        for(const b of bones)this.characters[name].baseRotations.set(b,b.rotation.clone());
        resolve(root);
      },undefined,reject);
    });
  }

  findBone(c,patterns){
    return c.bones.find(b=>patterns.some(p=>p.test(b.name)));
  }

  play(name,pattern){
    const c=this.characters[name]; if(!c)return false;
    const clip=c.animations.find(a=>new RegExp(pattern,"i").test(a.name));
    if(c.mixer&&clip){
      const action=c.mixer.clipAction(clip);
      if(c.currentAction&&c.currentAction!==action)c.currentAction.fadeOut(.12);
      action.reset().setLoop(THREE.LoopRepeat,Infinity).fadeIn(.12).play();
      c.currentAction=action;c.proceduralWalk=false;return true;
    }
    c.proceduralWalk=true;c.walkClock=0;return false;
  }

  update(dt){
    for(const key in this.characters){
      const c=this.characters[key];
      if(c.mixer&&!c.proceduralWalk)c.mixer.update(dt);
      if(c.proceduralWalk)this.proceduralWalk(c,dt);
    }
  }

  proceduralWalk(c,dt){
    c.walkClock+=dt;
    const s=Math.sin(c.walkClock*7.2);
    const half=-s;
    c.root.position.y=c.groundY+Math.abs(Math.sin(c.walkClock*7.2))*.008;

    const set=(b,x=0,y=0,z=0)=>{
      if(!b)return;
      const base=c.baseRotations.get(b); if(!base)return;
      b.rotation.copy(base);
      b.rotation.x+=x;b.rotation.y+=y;b.rotation.z+=z;
    };

    const la=this.findBone(c,[/left.*(arm|shoulder)/i,/(arm|shoulder).*left/i,/mixamorig.*leftarm/i,/l[_ .-]?arm/i]);
    const ra=this.findBone(c,[/right.*(arm|shoulder)/i,/(arm|shoulder).*right/i,/mixamorig.*rightarm/i,/r[_ .-]?arm/i]);
    const ll=this.findBone(c,[/left.*(up.?leg|thigh|leg)/i,/(up.?leg|thigh|leg).*left/i,/mixamorig.*leftupleg/i,/l[_ .-]?(leg|thigh)/i]);
    const rl=this.findBone(c,[/right.*(up.?leg|thigh|leg)/i,/(up.?leg|thigh|leg).*right/i,/mixamorig.*rightupleg/i,/r[_ .-]?(leg|thigh)/i]);
    const lf=this.findBone(c,[/left.*(foot|ankle)/i,/mixamorig.*leftfoot/i]);
    const rf=this.findBone(c,[/right.*(foot|ankle)/i,/mixamorig.*rightfoot/i]);
    const hip=this.findBone(c,[/hips?/i,/pelvis/i,/mixamorig.*hips/i]);
    const spine=this.findBone(c,[/spine|chest|torso/i]);

    // Brazos: giro Z suele ser el eje natural de rigs humanoides.
    set(la,0,0,s*.55);
    set(ra,0,0,half*.55);
    // Piernas: balanceo X.
    set(ll,half*.62);
    set(rl,s*.62);
    set(lf,half*.18);
    set(rf,s*.18);
    set(hip,0,0,s*.035);
    set(spine,s*.025,0,0);
  }

  setVisible(selected){
    for(const key in this.characters)this.characters[key].root.visible=key===selected;
  }
}