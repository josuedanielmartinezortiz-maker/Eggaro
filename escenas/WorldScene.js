import * as THREE from "https://unpkg.com/three@0.180.0/build/three.module.js";
import { CharacterManager } from "../personajes/CharacterManager.js";

export class WorldScene{
  constructor(scene,camera,selectedCharacter="Mike"){
    this.scene=scene;
    this.camera=camera;
    this.t=0;
    this.characters=new CharacterManager(scene);
    this.cinematic=true;
    this.cineTime=0;
    // En la cinemática aparecen los dos personajes.
    for(const key in this.characters.characters)this.characters.characters[key].root.visible=true;
    this.dialogIndex=-1;
    this.dialogTimer=0;
    this.dialogs=[
      ["MICAELA","¿Qué hacemos aquí, Mike?"],
      ["MIKE","No sé."],
      ["MICAELA","¿Qué es eso, Mike?"],
      ["MIKE","No sé, deberíamos averiguarlo."]
    ];
  }

  async start(){
    const hemi=new THREE.HemisphereLight(0xcfe8ff,0x203018,2.2);
    this.scene.add(hemi);

    const sun=new THREE.DirectionalLight(0xfff0d0,3.5);
    sun.position.set(8,14,6);
    sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);
    sun.shadow.camera.left=-30;
    sun.shadow.camera.right=30;
    sun.shadow.camera.top=30;
    sun.shadow.camera.bottom=-30;
    this.scene.add(sun);

    const ground=new THREE.Mesh(
      new THREE.PlaneGeometry(80,80),
      new THREE.MeshStandardMaterial({color:0x29452b,roughness:.95})
    );
    ground.rotation.x=-Math.PI/2;
    ground.receiveShadow=true;
    this.scene.add(ground);

    this.addPath();
    this.addTrees();
    this.addRocks();
    this.addEgg();
    this.addCinematicUI();

    try{
      await this.characters.loadAll(this.selectedCharacter);
      this.startCinematic();
    }catch(e){
      console.warn("No se pudieron cargar Mike/Micaela:",e);
      this.cinematic=false;
    }
  }

  addPath(){
    const path=new THREE.Mesh(
      new THREE.PlaneGeometry(5,70),
      new THREE.MeshStandardMaterial({color:0x806448,roughness:1})
    );
    path.rotation.x=-Math.PI/2;
    path.position.y=.012;
    this.scene.add(path);
  }

  addTrees(){
    for(let z=-28;z<=28;z+=4.5){
      for(const x of [-6.5,6.5]){
        const trunk=new THREE.Mesh(
          new THREE.CylinderGeometry(.22,.3,2.3,8),
          new THREE.MeshStandardMaterial({color:0x5b3924})
        );
        trunk.position.set(x+(z%9)*.05,1.15,z);
        trunk.castShadow=true;
        this.scene.add(trunk);

        const crown=new THREE.Mesh(
          new THREE.IcosahedronGeometry(1.35,1),
          new THREE.MeshStandardMaterial({color:0x245b32,roughness:.9})
        );
        crown.position.set(trunk.position.x,2.7,z);
        crown.castShadow=true;
        this.scene.add(crown);
      }
    }
  }

  addRocks(){
    for(let i=0;i<18;i++){
      const rock=new THREE.Mesh(
        new THREE.DodecahedronGeometry(.35+Math.random()*.45,0),
        new THREE.MeshStandardMaterial({color:0x53605b,roughness:1})
      );
      rock.position.set(
        (Math.random()<.5?-1:1)*(3.5+Math.random()*4),
        .3,
        -30+Math.random()*60
      );
      rock.rotation.y=Math.random()*6;
      rock.castShadow=true;
      this.scene.add(rock);
    }
  }

  addEgg(){
    const group=new THREE.Group();
    group.name="CinematicEgg";
    group.position.set(0,.75,-1.8);

    const egg=new THREE.Mesh(
      new THREE.SphereGeometry(.7,32,20),
      new THREE.MeshStandardMaterial({color:0xf4dfb0,roughness:.72})
    );
    egg.scale.set(.78,1.12,.78);
    egg.castShadow=true;
    group.add(egg);

    const crackMat=new THREE.MeshStandardMaterial({color:0x7d5b3c});
    for(let i=0;i<3;i++){
      const crack=new THREE.Mesh(
        new THREE.BoxGeometry(.045,.28,.025),
        crackMat
      );
      crack.position.set((i-1)*.15,.8,.68);
      crack.rotation.z=(i-1)*.45;
      group.add(crack);
    }

    this.scene.add(group);
    this.egg=group;
  }

  addCinematicUI(){
    const ui=document.createElement("div");
    ui.id="cinematic-ui";
    ui.style.cssText=[
      "position:absolute","inset:0","pointer-events:none","z-index:10",
      "font-family:system-ui,sans-serif","color:white"
    ].join(";");

    const top=document.createElement("div");
    top.style.cssText="position:absolute;left:0;right:0;top:0;height:10%;background:#000;opacity:.9";
    ui.appendChild(top);

    const bottom=document.createElement("div");
    bottom.style.cssText="position:absolute;left:0;right:0;bottom:0;height:14%;background:#000;opacity:.9";
    ui.appendChild(bottom);

    const box=document.createElement("div");
    box.style.cssText=[
      "position:absolute","left:7%","right:7%","bottom:17%","min-height:70px",
      "padding:14px 18px","border-radius:14px","background:rgba(0,0,0,.58)",
      "backdrop-filter:blur(5px)","font-size:clamp(16px,3vw,25px)",
      "line-height:1.3","text-shadow:0 2px 5px #000"
    ].join(";");
    ui.appendChild(box);

    const name=document.createElement("div");
    name.style.cssText="font-weight:900;letter-spacing:2px;font-size:.7em;margin-bottom:5px";
    box.appendChild(name);

    const text=document.createElement("div");
    box.appendChild(text);

    const skip=document.createElement("div");
    skip.textContent="Toca para continuar";
    skip.style.cssText="position:absolute;right:5%;bottom:4%;font-size:12px;opacity:.65";
    ui.appendChild(skip);

    document.getElementById("game").appendChild(ui);
    this.cineUI={ui,name,text,skip};

    ui.addEventListener("pointerdown",()=>{
      if(this.cinematic) this.nextDialogue(true);
    });
  }

  startCinematic(){
    this.cinematic=true;
    this.cineTime=0;
    this.dialogIndex=-1;
    this.dialogTimer=0;

    const mike=this.characters.characters.Mike?.root;
    const micaela=this.characters.characters.Micaela?.root;

    if(mike) mike.position.set(-1.15,0,-.2);
    if(micaela) micaela.position.set(1.15,0,.2);

    this.camera.position.set(0,3.2,8.5);
    this.camera.lookAt(0,1,-1);
    this.nextDialogue(false);
  }

  nextDialogue(force){
    if(!this.cinematic)return;

    if(this.dialogIndex>=this.dialogs.length-1){
      this.finishCinematic();
      return;
    }

    this.dialogIndex++;
    this.dialogTimer=0;

    const [who,line]=this.dialogs[this.dialogIndex];
    this.cineUI.name.textContent=who;
    this.cineUI.text.textContent=line;
  }

  finishCinematic(){
    this.cinematic=false;
    this.dialogIndex=-1;

    if(this.cineUI){
      this.cineUI.ui.remove();
      this.cineUI=null;
    }

    this.camera.position.set(7,5,9);
    this.camera.lookAt(0,1.2,0);
  }

  update(dt){
    this.t+=dt;

    if(this.cinematic){
      this.cineTime+=dt;
      this.dialogTimer+=dt;

      const mike=this.characters.characters.Mike?.root;
      const micaela=this.characters.characters.Micaela?.root;

      if(mike) mike.rotation.y=Math.sin(this.cineTime*.7)*.08;
      if(micaela) micaela.rotation.y=Math.sin(this.cineTime*.7+.5)*-.08;

      if(this.egg){
        this.egg.rotation.y=this.cineTime*.35;
        this.egg.position.y=.75+Math.sin(this.cineTime*2)*.025;
      }

      const phase=this.cineTime<4 ? 0 : this.cineTime<8 ? 1 : 2;

      if(phase===0){
        const a=this.cineTime/4;
        this.camera.position.lerp(new THREE.Vector3(0,2.7,5.2),Math.min(dt*1.5,1));
        this.camera.lookAt(0,1.1,-1);
      }else if(phase===1){
        const targetX=Math.sin(this.cineTime*.35)*3.2;
        this.camera.position.lerp(new THREE.Vector3(targetX,2.2,5.8),Math.min(dt*1.2,1));
        this.camera.lookAt(0,1,-1);
      }else{
        this.camera.position.lerp(new THREE.Vector3(0,1.8,3.8),Math.min(dt*1.4,1));
        this.camera.lookAt(0,1,-1.4);
      }

      if(this.dialogTimer>5){
        this.nextDialogue(false);
      }

      return;
    }

    this.camera.position.x=7+Math.sin(this.t*.18)*.6;
    this.camera.lookAt(0,1.2,0);
  }

  resize(aspect){
    this.camera.aspect=aspect;
    this.camera.updateProjectionMatrix();
  }
}
