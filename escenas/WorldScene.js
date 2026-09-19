import * as THREE from "https://unpkg.com/three@0.180.0/build/three.module.js";
import { CharacterManager } from "../personajes/CharacterManager.js";

export class WorldScene{
  constructor(scene,camera,selectedCharacter="Mike"){
    this.scene=scene;
    this.camera=camera;
    this.selectedCharacter=selectedCharacter;
    this.t=0;
    this.characters=new CharacterManager(scene);
    this.cinematic=true;
    this.cineTime=0;
    this.dialogIndex=-1;
    this.dialogTimer=0;
    this.dialogs=[
      ["MICAELA","¿Qué hacemos aquí, Mike?"],
      ["MIKE","No sé. Este lugar no se parece a ningún sitio que conozcamos."],
      ["MICAELA","¿Qué es eso, Mike? Parece un huevo..."],
      ["MIKE","No sé, deberíamos averiguarlo."]
    ];
    this.shots=[
      {at:0,d:4.2,cam:[0,2.15,6.8],look:[0,1.25,-1.0]},
      {at:4.2,d:3.8,cam:[-3.9,1.75,3.4],look:[-0.2,1.1,-.9]},
      {at:8,d:3.8,cam:[3.7,1.8,2.8],look:[0,1.05,-1.55]},
      {at:11.8,d:4.5,cam:[0,1.65,3.35],look:[0,.95,-1.75]}
    ];
  }

  async start(){
    this.setupLighting();
    this.addWorld();
    this.addCinematicUI();
    try{
      await this.characters.loadAll();
      this.prepareCharacters();
      this.startCinematic();
    }catch(e){
      console.warn("No se pudieron cargar Mike/Micaela:",e);
      this.cinematic=false;
    }
  }

  setupLighting(){
    this.scene.background=new THREE.Color(0x101a22);
    const hemi=new THREE.HemisphereLight(0xbfdcff,0x172015,1.55);
    this.scene.add(hemi);
    const moon=new THREE.DirectionalLight(0xb8d7ff,2.1);
    moon.position.set(-7,12,4);
    moon.castShadow=true;
    moon.shadow.mapSize.set(2048,2048);
    moon.shadow.camera.left=-20; moon.shadow.camera.right=20;
    moon.shadow.camera.top=20; moon.shadow.camera.bottom=-20;
    this.scene.add(moon);
    const key=new THREE.SpotLight(0xffd9a0,18,18,Math.PI/7,.55,1.5);
    key.position.set(0,7,2);
    key.castShadow=true;
    key.shadow.mapSize.set(1024,1024);
    this.scene.add(key);
  }

  addWorld(){
    const ground=new THREE.Mesh(
      new THREE.PlaneGeometry(80,80),
      new THREE.MeshStandardMaterial({color:0x243a28,roughness:.98})
    );
    ground.rotation.x=-Math.PI/2;
    ground.receiveShadow=true;
    this.scene.add(ground);

    const path=new THREE.Mesh(
      new THREE.PlaneGeometry(3.2,70),
      new THREE.MeshStandardMaterial({color:0x68523c,roughness:1})
    );
    path.rotation.x=-Math.PI/2;
    path.position.y=.015;
    this.scene.add(path);

    for(let z=-30;z<=28;z+=3.8){
      for(const side of [-1,1]){
        const x=side*(3.7+(Math.sin(z*1.7)*.55));
        const trunk=new THREE.Mesh(
          new THREE.CylinderGeometry(.16,.27,2.5,8),
          new THREE.MeshStandardMaterial({color:0x493223,roughness:1})
        );
        trunk.position.set(x,1.25,z);
        trunk.castShadow=true;
        this.scene.add(trunk);

        const crown=new THREE.Mesh(
          new THREE.IcosahedronGeometry(1.18,1),
          new THREE.MeshStandardMaterial({color:0x183f29,roughness:.92})
        );
        crown.position.set(x,2.75,z);
        crown.scale.set(1,1.15,.9);
        crown.castShadow=true;
        this.scene.add(crown);
      }
    }

    for(let i=0;i<22;i++){
      const rock=new THREE.Mesh(
        new THREE.DodecahedronGeometry(.18+Math.random()*.38,0),
        new THREE.MeshStandardMaterial({color:0x4e5a55,roughness:1})
      );
      const side=i%2?-1:1;
      rock.position.set(side*(2.0+Math.random()*2.5),.22,-28+Math.random()*56);
      rock.rotation.set(Math.random(),Math.random()*6,Math.random());
      rock.castShadow=true;
      this.scene.add(rock);
    }

    const mist=new THREE.Group();
    for(let i=0;i<18;i++){
      const p=new THREE.Mesh(
        new THREE.SphereGeometry(.08+Math.random()*.12,8,8),
        new THREE.MeshBasicMaterial({color:0xd7e8dc,transparent:true,opacity:.10,depthWrite:false})
      );
      p.position.set((Math.random()-.5)*7,.5+Math.random()*2,-18+Math.random()*24);
      mist.add(p);
    }
    this.scene.add(mist);
    this.mist=mist;
    this.addEgg();
  }

  addEgg(){
    const g=new THREE.Group();
    g.position.set(0,.72,-1.9);
    const mat=new THREE.MeshStandardMaterial({color:0xf0dcae,roughness:.55});
    const egg=new THREE.Mesh(new THREE.SphereGeometry(.62,32,24),mat);
    egg.scale.set(.8,1.25,.8);
    egg.castShadow=true;
    g.add(egg);
    const glow=new THREE.PointLight(0xffd98a,0,5);
    glow.position.y=.25;
    g.add(glow);
    for(const [x,y,r] of [[-.18,.25,-.35],[.02,.48,.15],[.18,.18,.42]]){
      const crack=new THREE.Mesh(
        new THREE.BoxGeometry(.045,.28,.025),
        new THREE.MeshStandardMaterial({color:0x705038,roughness:1})
      );
      crack.position.set(x,y,.49);
      crack.rotation.z=r;
      g.add(crack);
    }
    this.scene.add(g);
    this.egg=g;
    this.eggGlow=glow;
  }

  prepareCharacters(){
    const mike=this.characters.characters.Mike?.root;
    const micaela=this.characters.characters.Micaela?.root;
    if(mike) mike.visible=true;
    if(micaela) micaela.visible=true;
    if(mike){mike.position.set(-1.0,0,-.05);mike.rotation.y=.12;}
    if(micaela){micaela.position.set(1.0,0,.18);micaela.rotation.y=-.12;}
  }

  addCinematicUI(){
    const ui=document.createElement("div");
    ui.id="cinematic-ui";
    ui.style.cssText="position:absolute;inset:0;pointer-events:auto;z-index:20;font-family:system-ui,sans-serif;color:#fff;opacity:0;transition:opacity .6s ease";
    const top=document.createElement("div");
    top.style.cssText="position:absolute;inset:0 0 auto;height:9%;background:linear-gradient(#000,.65),transparent";
    ui.appendChild(top);
    const bottom=document.createElement("div");
    bottom.style.cssText="position:absolute;inset:auto 0 0;height:18%;background:linear-gradient(transparent,#000 .35%,#000)";
    ui.appendChild(bottom);
    const chapter=document.createElement("div");
    chapter.textContent="EGGARO  •  EL BOSQUE";
    chapter.style.cssText="position:absolute;top:5.5%;left:5%;font-size:11px;letter-spacing:3px;opacity:.72";
    ui.appendChild(chapter);
    const box=document.createElement("div");
    box.style.cssText="position:absolute;left:6%;right:6%;bottom:7%;min-height:72px;padding:13px 18px;border-left:3px solid rgba(255,220,150,.9);background:rgba(0,0,0,.38);text-shadow:0 2px 7px #000;backdrop-filter:blur(3px)";
    const name=document.createElement("div");
    name.style.cssText="font-weight:900;letter-spacing:2px;font-size:12px;margin-bottom:5px";
    const text=document.createElement("div");
    text.style.cssText="font-size:clamp(15px,2.8vw,22px);line-height:1.3";
    box.append(name,text);
    ui.appendChild(box);
    const hint=document.createElement("div");
    hint.textContent="Toca la pantalla para avanzar";
    hint.style.cssText="position:absolute;right:5%;bottom:2.5%;font-size:10px;opacity:.48";
    ui.appendChild(hint);
    document.getElementById("game").appendChild(ui);
    this.cineUI={ui,name,text};
    ui.addEventListener("pointerdown",()=>this.nextDialogue(true));
  }

  startCinematic(){
    this.cinematic=true;
    this.cineTime=0;
    this.dialogIndex=-1;
    this.dialogTimer=0;
    this.cineUI.ui.style.opacity="1";
    this.nextDialogue(false);
  }

  nextDialogue(){
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
    if(this.cineUI){
      this.cineUI.ui.style.opacity="0";
      setTimeout(()=>this.cineUI?.ui.remove(),650);
      this.cineUI=null;
    }
    const selected=this.characters.characters[this.selectedCharacter]?.root;
    for(const key in this.characters.characters){
      this.characters.characters[key].root.visible=key===this.selectedCharacter;
    }
    if(selected){
      selected.position.set(0,0,0);
      selected.rotation.y=0;
    }
    this.camera.position.set(7,4.8,8);
    this.camera.lookAt(0,1,0);
  }

  update(dt){
    this.t+=dt;
    if(this.mist) this.mist.position.z=Math.sin(this.t*.08)*.7;
    if(!this.cinematic){
      this.camera.position.x=7+Math.sin(this.t*.18)*.5;
      this.camera.lookAt(0,1,0);
      return;
    }

    this.cineTime+=dt;
    this.dialogTimer+=dt;

    const mike=this.characters.characters.Mike?.root;
    const micaela=this.characters.characters.Micaela?.root;

    if(mike){
      mike.position.x=-1.0+Math.sin(this.cineTime*.7)*.08;
      mike.rotation.y=.12+Math.sin(this.cineTime*.5)*.04;
    }
    if(micaela){
      micaela.position.x=1.0+Math.sin(this.cineTime*.7+.8)*.08;
      micaela.rotation.y=-.12+Math.sin(this.cineTime*.5+.8)*-.04;
    }

    if(this.egg){
      this.egg.rotation.y=this.cineTime*.25;
      this.egg.position.y=.72+Math.sin(this.cineTime*2.2)*.035;
      if(this.eggGlow)this.eggGlow.intensity=this.cineTime>8 ? 2.5+Math.sin(this.cineTime*5)*.8 : .2;
    }

    const shot=this.shots[Math.min(Math.floor(this.cineTime/4),this.shots.length-1)];
    const target=new THREE.Vector3(...shot.cam);
    const look=new THREE.Vector3(...shot.look);
    this.camera.position.lerp(target,1-Math.pow(.001,dt));
    const currentLook=this.camera.userData.cineLook||new THREE.Vector3();
    currentLook.lerp(look,1-Math.pow(.001,dt));
    this.camera.userData.cineLook=currentLook;
    this.camera.lookAt(currentLook);

    if(this.dialogTimer>shot.d) this.nextDialogue();
  }

  resize(aspect){
    this.camera.aspect=aspect;
    this.camera.updateProjectionMatrix();
  }
}
