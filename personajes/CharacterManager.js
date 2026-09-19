import * as THREE from "https://unpkg.com/three@0.180.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

const OLD_REPO="https://raw.githubusercontent.com/josuedanielmartinezortiz-maker/Game/main/3D/";

export class CharacterManager{
  constructor(scene){this.scene=scene;this.loader=new GLTFLoader();this.characters={};}

  async loadAll(){
    await Promise.all([this.load("Mike","mike.glb"),this.load("Micaela","micaela.glb")]);
  }

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
        if(Number.isFinite(bottom) && bottom<0)root.position.y=-bottom;
        root.updateMatrixWorld(true);

        const mixer=gltf.animations?.length?new THREE.AnimationMixer(root):null;
        const clips=gltf.animations||[];
        const bones=[];
        root.traverse(o=>{if(o.isBone)bones.push(o);});

        this.addClothes(name,root);

        this.scene.add(root);
        this.characters[name]={root,animations:clips,mixer,currentAction:null,bones,
          proceduralWalk:false,walkClock:0,groundY:root.position.y};
        resolve(root);
      },undefined,reject);
    });
  }

  mat(color,roughness=.82){return new THREE.MeshStandardMaterial({color,roughness});}

  addClothes(name,root){
    root.updateMatrixWorld(true);
    const box=new THREE.Box3().setFromObject(root);
    const centerWorld=box.getCenter(new THREE.Vector3());
    const localCenter=root.worldToLocal(centerWorld.clone());
    const minWorld=new THREE.Vector3(box.min.x,box.min.y,box.min.z);
    const maxWorld=new THREE.Vector3(box.max.x,box.max.y,box.max.z);
    const p0=root.worldToLocal(minWorld.clone());
    const p1=root.worldToLocal(maxWorld.clone());
    const h=Math.max(Math.abs(p1.y-p0.y),1);
    const w=Math.max(Math.abs(p1.x-p0.x),.5);
    const d=Math.max(Math.abs(p1.z-p0.z),.5);
    const bottom=Math.min(p0.y,p1.y);

    const clothes=new THREE.Group();
    clothes.name=name+"Clothes";

    if(name==="Mike"){
      const shirt=new THREE.Mesh(new THREE.CylinderGeometry(w*.31,w*.37,h*.19,16),this.mat(0xf1c94a));
      shirt.position.set(localCenter.x,bottom+h*.57,localCenter.z);
      shirt.scale.z=.88;
      clothes.add(shirt);

      const stripe=new THREE.Mesh(new THREE.TorusGeometry(w*.35,w*.025,8,32),this.mat(0x3d78c9));
      stripe.rotation.x=Math.PI/2; stripe.position.copy(shirt.position); stripe.position.y+=h*.035;
      stripe.scale.set(1,.78,1); clothes.add(stripe);

      const shorts=new THREE.Mesh(new THREE.BoxGeometry(w*.64,h*.20,d*.56),this.mat(0x3f6fb0));
      shorts.position.set(localCenter.x,bottom+h*.38,localCenter.z); clothes.add(shorts);

      this.addBoots(clothes,localCenter,bottom,w,h,d,0x3b8ac4);
    }else{
      const blouse=new THREE.Mesh(new THREE.CylinderGeometry(w*.30,w*.37,h*.19,16),this.mat(0xf4a6bd));
      blouse.position.set(localCenter.x,bottom+h*.59,localCenter.z); blouse.scale.z=.88; clothes.add(blouse);

      const collar=new THREE.Mesh(new THREE.TorusGeometry(w*.27,w*.035,8,32),this.mat(0xffd0df));
      collar.rotation.x=Math.PI/2; collar.position.copy(blouse.position); collar.position.y+=h*.035;
      collar.scale.set(1,.75,1); clothes.add(collar);

      const skirt=new THREE.Mesh(new THREE.ConeGeometry(w*.43,h*.24,16),this.mat(0xd86b9b));
      skirt.position.set(localCenter.x,bottom+h*.39,localCenter.z); skirt.scale.z=.72; clothes.add(skirt);

      this.addBoots(clothes,localCenter,bottom,w,h,d,0xe989b1);
    }
    root.add(clothes);
  }

  addBoots(group,center,bottom,w,h,d,color){
    const m=this.mat(color);
    for(const side of[-1,1]){
      const boot=new THREE.Mesh(new THREE.BoxGeometry(w*.18,h*.11,d*.30),m);
      boot.position.set(center.x+side*w*.18,bottom+h*.09,center.z+d*.03);
      group.add(boot);
    }
  }

  play(name,pattern){
    const c=this.characters[name]; if(!c)return false;
    const clip=c.animations.find(a=>new RegExp(pattern,"i").test(a.name));
    if(c.mixer&&clip){
      const action=c.mixer.clipAction(clip);
      if(c.currentAction&&c.currentAction!==action)c.currentAction.fadeOut(.15);
      action.reset().setLoop(THREE.LoopRepeat,Infinity).fadeIn(.15).play();
      c.currentAction=action;c.proceduralWalk=false;return true;
    }
    c.proceduralWalk=true;c.walkClock=0;return false;
  }

  update(dt){
    for(const key in this.characters){
      const c=this.characters[key];
      if(c.mixer)c.mixer.update(dt);
      if(c.proceduralWalk)this.proceduralWalk(c,dt);
    }
  }

  proceduralWalk(c,dt){
    c.walkClock+=dt;
    const s=Math.sin(c.walkClock*7.5);
    const s2=-s;
    c.root.position.y=c.groundY+Math.abs(s)*.018;

    const bones=c.bones;
    const find=tests=>bones.find(b=>tests.some(t=>t.test(b.name)));
    const la=find([/left.*(arm|shoulder)/i,/(arm|shoulder).*left/i,/l[_ .-]?arm/i,/brazo.*izq/i]);
    const ra=find([/right.*(arm|shoulder)/i,/(arm|shoulder).*right/i,/r[_ .-]?arm/i,/brazo.*der/i]);
    const ll=find([/left.*(leg|thigh|upper)/i,/(leg|thigh).*left/i,/l[_ .-]?(leg|thigh)/i,/pierna.*izq/i]);
    const rl=find([/right.*(leg|thigh|upper)/i,/(leg|thigh).*right/i,/r[_ .-]?(leg|thigh)/i,/pierna.*der/i]);
    if(la)la.rotation.x=s*.42;
    if(ra)ra.rotation.x=s2*.42;
    if(ll)ll.rotation.x=s2*.32;
    if(rl)rl.rotation.x=s*.32;
  }

  setVisible(selected){
    for(const key in this.characters)this.characters[key].root.visible=key===selected;
  }
}