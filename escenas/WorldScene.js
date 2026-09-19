import * as THREE from "https://unpkg.com/three@0.180.0/build/three.module.js";

export class WorldScene{
  constructor(scene,camera){this.scene=scene;this.camera=camera;this.t=0}
  start(){
    const hemi=new THREE.HemisphereLight(0xcfe8ff,0x203018,2.2); this.scene.add(hemi);
    const sun=new THREE.DirectionalLight(0xfff0d0,3.5);
    sun.position.set(8,14,6); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
    sun.shadow.camera.left=-30;sun.shadow.camera.right=30;sun.shadow.camera.top=30;sun.shadow.camera.bottom=-30;
    this.scene.add(sun);
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x29452b,roughness:.95}));
    ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;this.scene.add(ground);
    this.addPath(); this.addTrees(); this.addRocks();
    this.addTitle();
  }
  addPath(){
    const path=new THREE.Mesh(new THREE.PlaneGeometry(7,70),new THREE.MeshStandardMaterial({color:0x806448,roughness:1}));
    path.rotation.x=-Math.PI/2;path.position.y=.012;this.scene.add(path);
  }
  addTrees(){
    for(let z=-28;z<=28;z+=5){
      for(const x of [-8,-6.2,6.2,8]){
        const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.22,.3,2.3,8),new THREE.MeshStandardMaterial({color:0x5b3924}));
        trunk.position.set(x+(z%10)*.06,1.15,z);trunk.castShadow=true;this.scene.add(trunk);
        const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(1.35,1),new THREE.MeshStandardMaterial({color:0x245b32,roughness:.9}));
        crown.position.set(trunk.position.x,2.7,z);crown.castShadow=true;this.scene.add(crown);
      }
    }
  }
  addRocks(){
    for(let i=0;i<18;i++){
      const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.35+Math.random()*.45,0),new THREE.MeshStandardMaterial({color:0x53605b,roughness:1}));
      rock.position.set((Math.random()<.5?-1:1)*(4.5+Math.random()*5),.3, -30+Math.random()*60);
      rock.rotation.y=Math.random()*6;rock.castShadow=true;this.scene.add(rock);
    }
  }
  addTitle(){
    const el=document.createElement("div");el.textContent="GAMERPRO GAME";el.style.cssText="position:absolute;top:18px;left:50%;transform:translateX(-50%);font-weight:900;letter-spacing:5px;text-shadow:0 3px 15px #000;pointer-events:none;z-index:2";document.getElementById("game").appendChild(el);this.title=el;
  }
  update(dt){this.t+=dt;this.camera.position.x=7+Math.sin(this.t*.18)*.6;this.camera.lookAt(0,1.2,0)}
}
