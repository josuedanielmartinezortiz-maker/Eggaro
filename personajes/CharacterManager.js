import * as THREE from "https://unpkg.com/three@0.180.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

const OLD_REPO="https://raw.githubusercontent.com/josuedanielmartinezortiz-maker/Game/main/3D/";

export class CharacterManager{
  constructor(scene){
    this.scene=scene;
    this.loader=new GLTFLoader();
    this.characters={};
  }

  async loadAll(){
    await Promise.all([
      this.load("Mike","mike.glb"),
      this.load("Micaela","micaela.glb")
    ]);
  }

  load(name,file){
    return new Promise((resolve,reject)=>{
      this.loader.load(OLD_REPO+file,gltf=>{
        const root=gltf.scene;
        root.position.set(0,0,0);
        root.scale.setScalar(.72);

        root.traverse(o=>{
          if(o.isMesh){
            o.castShadow=true;
            o.receiveShadow=true;
          }
        });

        const mixer=gltf.animations?.length?new THREE.AnimationMixer(root):null;
        const clips=gltf.animations||[];
        const bones=[];
        root.traverse(o=>{if(o.isBone)bones.push(o);});

        this.addClothes(name,root);
        this.scene.add(root);

        this.characters[name]={
          root,animations:clips,mixer,currentAction:null,
          bones,
          proceduralWalk:false,
          walkClock:0
        };
        resolve(root);
      },undefined,reject);
    });
  }

  mat(color,roughness=.8){
    return new THREE.MeshStandardMaterial({color,roughness});
  }

  addClothes(name,root){
    const box=new THREE.Box3().setFromObject(root);
    const size=new THREE.Vector3();
    const center=new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const h=Math.max(size.y,.1);
    const w=Math.max(size.x,.1);
    const d=Math.max(size.z,.1);
    const clothes=new THREE.Group();
    clothes.name=name+"Clothes";

    if(name==="Mike"){
      const shirt=new THREE.Mesh(new THREE.CylinderGeometry(w*.52,w*.58,h*.30,16),this.mat(0xf1c94a));
      shirt.position.set(center.x,box.min.y+h*.58,center.z);
      shirt.scale.z=.82;
      clothes.add(shirt);

      const stripe1=new THREE.Mesh(new THREE.TorusGeometry(w*.34,w*.025,8,24),this.mat(0x3d78c9));
      stripe1.rotation.x=Math.PI/2;
      stripe1.position.copy(shirt.position);
      stripe1.position.y+=h*.025;
      stripe1.scale.set(1,.75,1);
      clothes.add(stripe1);

      const shorts=new THREE.Mesh(new THREE.BoxGeometry(w*.82,h*.30,d*.68),this.mat(0x3f6fb0));
      shorts.position.set(center.x,box.min.y+h*.38,center.z);
      clothes.add(shorts);

      this.addBoots(clothes,center,box,w,h,d,0x3b8ac4);
    }else{
      const blouse=new THREE.Mesh(new THREE.CylinderGeometry(w*.50,w*.58,h*.30,16),this.mat(0xf4a6bd));
      blouse.position.set(center.x,box.min.y+h*.60,center.z);
      blouse.scale.z=.82;
      clothes.add(blouse);

      const collar=new THREE.Mesh(new THREE.TorusGeometry(w*.27,w*.035,8,24),this.mat(0xffd0df));
      collar.rotation.x=Math.PI/2;
      collar.position.copy(blouse.position);
      collar.position.y+=h*.035;
      collar.scale.set(1,.72,1);
      clothes.add(collar);

      const skirt=new THREE.Mesh(new THREE.ConeGeometry(w*.62,h*.36,16),this.mat(0xd86b9b));
      skirt.position.set(center.x,box.min.y+h*.39,center.z);
      skirt.scale.z=.65;
      clothes.add(skirt);

      this.addBoots(clothes,center,box,w,h,d,0xe989b1);
    }

    root.add(clothes);
  }

  addBoots(group,center,box,w,h,d,color){
    const bootMat=this.mat(color);
    for(const side of [-1,1]){
      const boot=new THREE.Mesh(new THREE.BoxGeometry(w*.16,h*.10,d*.28),bootMat);
      boot.position.set(center.x+side*w*.22,box.min.y+h*.09,center.z+d*.02);
      group.add(boot);
    }
  }

  play(name,pattern){
    const c=this.characters[name];
    if(!c)return false;
    const clip=c.animations.find(a=>new RegExp(pattern,"i").test(a.name));
    if(c.mixer&&clip){
      const next=c.mixer.clipAction(clip);
      if(c.currentAction&&c.currentAction!==next)c.currentAction.fadeOut(.18);
      next.reset().fadeIn(.18).play();
      c.currentAction=next;
      c.proceduralWalk=false;
      return true;
    }
    c.proceduralWalk=true;
    c.walkClock=0;
    return false;
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
    const s=Math.sin(c.walkClock*8.0);
    const s2=Math.sin(c.walkClock*8.0+Math.PI);

    c.root.position.y=Math.max(0,c.root.position.y)+Math.abs(s)*.025;
    c.root.rotation.z=Math.sin(c.walkClock*4)*.018;

    const find=(patterns)=>c.bones.find(b=>patterns.some(p=>p.test(b.name)));
    const lArm=find([/left.*arm/i,/arm.*left/i,/brazo.*izq/i,/l.*arm/i]);
    const rArm=find([/right.*arm/i,/arm.*right/i,/brazo.*der/i,/r.*arm/i]);
    const lLeg=find([/left.*leg/i,/left.*thigh/i,/leg.*left/i,/pierna.*izq/i,/l.*leg/i]);
    const rLeg=find([/right.*leg/i,/right.*thigh/i,/leg.*right/i,/pierna.*der/i,/r.*leg/i]);

    if(lArm)lArm.rotation.x=s*.35;
    if(rArm)rArm.rotation.x=s2*.35;
    if(lLeg)lLeg.rotation.x=s2*.28;
    if(rLeg)rLeg.rotation.x=s*.28;
  }

  setVisible(selected){
    for(const key in this.characters)this.characters[key].root.visible=key===selected;
  }
}