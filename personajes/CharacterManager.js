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
        if(Number.isFinite(bottom)&&bottom<0)root.position.y=-bottom;
        root.updateMatrixWorld(true);

        const mixer=gltf.animations?.length?new THREE.AnimationMixer(root):null;
        const clips=gltf.animations||[];
        const bones=[]; root.traverse(o=>{if(o.isBone)bones.push(o);});

        // Ropa de EGGARO: una sola pieza por prenda, centrada en el cuerpo.
        this.addClothes(name,root);

        this.scene.add(root);
        this.characters[name]={root,animations:clips,mixer,currentAction:null,bones,
          proceduralWalk:true,walkClock:0,groundY:root.position.y,baseRotations:new Map()};
        for(const b of bones)this.characters[name].baseRotations.set(b,b.rotation.clone());
        resolve(root);
      },undefined,reject);
    });
  }

  mat(color){return new THREE.MeshStandardMaterial({color,roughness:.84});}

  addClothes(name,root){
    root.updateMatrixWorld(true);
    const box=new THREE.Box3().setFromObject(root);
    const h=Math.max(box.max.y-box.min.y,1);
    const w=Math.max(box.max.x-box.min.x,.7);
    const d=Math.max(box.max.z-box.min.z,.7);
    const cx=(box.min.x+box.max.x)/2;
    const cz=(box.min.z+box.max.z)/2;
    const y=box.min.y;

    const clothes=new THREE.Group();
    clothes.name=name+"Clothes";
    // Se elimina cualquier ropa procedural anterior antes de crearla.
    if(name==="Mike"){
      const shirt=new THREE.Mesh(new THREE.CapsuleGeometry(w*.18,h*.115,6,16),this.mat(0xf2c94c));
      shirt.scale.z=.78; shirt.position.set(cx,y+h*.59,cz); clothes.add(shirt);

      const stripe=new THREE.Mesh(new THREE.TorusGeometry(w*.19,w*.014,8,32),this.mat(0x3d78c9));
      stripe.rotation.x=Math.PI/2; stripe.position.set(cx,y+h*.595,cz); stripe.scale.z=.78; clothes.add(stripe);

      const shorts=new THREE.Mesh(new THREE.BoxGeometry(w*.43,h*.17,d*.40),this.mat(0x3f6fb0));
      shorts.position.set(cx,y+h*.39,cz); clothes.add(shorts);
      this.addBoots(clothes,cx,cz,y,w,h,d,0x3b8ac4);
    }else{
      const blouse=new THREE.Mesh(new THREE.CapsuleGeometry(w*.18,h*.115,6,16),this.mat(0xf3a5bd));
      blouse.scale.z=.78; blouse.position.set(cx,y+h*.60,cz); clothes.add(blouse);

      const collar=new THREE.Mesh(new THREE.TorusGeometry(w*.17,w*.016,8,32),this.mat(0xffd6e3));
      collar.rotation.x=Math.PI/2; collar.position.set(cx,y+h*.615,cz); collar.scale.z=.78; clothes.add(collar);

      const skirt=new THREE.Mesh(new THREE.ConeGeometry(w*.27,h*.22,20),this.mat(0xd96f9f));
      skirt.scale.z=.70; skirt.position.set(cx,y+h*.40,cz); clothes.add(skirt);
      this.addBoots(clothes,cx,cz,y,w,h,d,0xe989b1);
    }
    root.add(clothes);
  }

  addBoots(group,cx,cz,y,w,h,d,color){
    const m=this.mat(color);
    for(const side of[-1,1]){
      const boot=new THREE.Mesh(new THREE.BoxGeometry(w*.115,h*.10,d*.22),m);
      boot.position.set(cx+side*w*.105,y+h*.075,cz+d*.06);
      group.add(boot);
    }
  }

  play(name,pattern){
    const c=this.characters[name]; if(!c)return false;
    const clip=c.animations.find(a=>new RegExp(pattern,"i").test(a.name));
    if(c.mixer&&clip){
      const action=c.mixer.clipAction(clip);
      if(c.currentAction&&c.currentAction!==action)c.currentAction.fadeOut(.12);
      action.reset().setLoop(THREE.LoopRepeat,Infinity).fadeIn(.12).play();
      c.currentAction=action;
      c.proceduralWalk=false;
      return true;
    }
    // El GLB puede traer solo esqueleto. En ese caso la caminata sigue siendo 3D.
    c.proceduralWalk=true;c.walkClock=0;return false;
  }

  update(dt){
    for(const key in this.characters){
      const c=this.characters[key];
      if(c.mixer&&!c.proceduralWalk)c.mixer.update(dt);
      if(c.proceduralWalk)this.proceduralWalk(c,dt);
    }
  }

  findBone(c,patterns){
    return c.bones.find(b=>patterns.some(p=>p.test(b.name)));
  }

  proceduralWalk(c,dt){
    c.walkClock+=dt;
    const s=Math.sin(c.walkClock*6.8);
    const s2=-s;
    c.root.position.y=c.groundY+Math.abs(s)*.012;

    const la=this.findBone(c,[/left.*(arm|shoulder|upperarm)/i,/(arm|shoulder).*left/i,/l[_ .-]?arm/i,/brazo.*izq/i]);
    const ra=this.findBone(c,[/right.*(arm|shoulder|upperarm)/i,/(arm|shoulder).*right/i,/r[_ .-]?arm/i,/brazo.*der/i]);
    const ll=this.findBone(c,[/left.*(leg|thigh|upperleg)/i,/(leg|thigh).*left/i,/l[_ .-]?(leg|thigh)/i,/pierna.*izq/i]);
    const rl=this.findBone(c,[/right.*(leg|thigh|upperleg)/i,/(leg|thigh).*right/i,/r[_ .-]?(leg|thigh)/i,/pierna.*der/i]);
    const hip=this.findBone(c,[/hips?/i,/pelvis/i,/root/i]);
    const spine=this.findBone(c,[/spine|chest|torso/i]);
    const head=this.findBone(c,[/head|neck/i]);

    const set=(b,x,y=0,z=0)=>{if(!b)return;const base=c.baseRotations.get(b);if(!base)return;b.rotation.copy(base);b.rotation.x+=x;b.rotation.y+=y;b.rotation.z+=z;};

    set(la,s*.38,0,s*.05);
    set(ra,s2*.38,0,-s*.05);
    set(ll,s2*.48);
    set(rl,s*.48);
    set(hip,0,0,s*.025);
    set(spine,s*.035);
    set(head,-s*.025);
  }

  setVisible(selected){for(const key in this.characters)this.characters[key].root.visible=key===selected;}
}