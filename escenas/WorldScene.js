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
    this.eggFalling=true;
    this.eggImpact=false;
    this.dialogs=[
      ["MICAELA","¿Qué hacemos aquí, Mike?"],
      ["MIKE","No sé. Este lugar no se parece a ningún sitio que conozcamos."],
      ["MICAELA","Mira... ¿qué es eso que viene del cielo?"],
      ["MIKE","¡Cuidado!"],
      ["MICAELA","¡Es un huevo! Y... tiene colores."],
      ["MIKE","Vamos a acercarnos. Tal vez nos diga por qué estamos aquí."]
    ];
    this.shots=[
      {d:3.8,cam:[5.4,2.2,7.2],look:[0,1.0,-1.0]},
      {d:4.0,cam:[-4.2,2.0,4.0],look:[-.6,1.0,-1.8]},
      {d:3.2,cam:[1.8,4.8,4.8],look:[0,2.2,-1.9]},
      {d:3.0,cam:[3.4,2.0,3.2],look:[0,.8,-1.8]},
      {d:3.8,cam:[0,1.65,3.5],look:[0,.9,-1.8]},
      {d:4.5,cam:[-2.8,1.9,4.2],look:[0,1,-2.5]}
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
    this.scene.background=new THREE.Color(0x9bc5df);
    this.scene.fog=new THREE.Fog(0x9bc5df,16,42);
    this.scene.add(new THREE.HemisphereLight(0xd8efff,0x24351e,1.7));

    const sun=new THREE.DirectionalLight(0xfff1cf,3.2);
    sun.position.set(-8,14,7);
    sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);
    sun.shadow.camera.left=-20; sun.shadow.camera.right=20;
    sun.shadow.camera.top=20; sun.shadow.camera.bottom=-20;
    this.scene.add(sun);

    const warm=new THREE.PointLight(0xffd58a,7,12);
    warm.position.set(0,2,-4);
    this.scene.add(warm);
  }

  addWorld(){
    const ground=new THREE.Mesh(
      new THREE.PlaneGeometry(90,90),
      new THREE.MeshStandardMaterial({color:0x456b3a,roughness:.96})
    );
    ground.rotation.x=-Math.PI/2;
    ground.receiveShadow=true;
    this.scene.add(ground);

    const path=new THREE.Mesh(
      new THREE.PlaneGeometry(3.0,75),
      new THREE.MeshStandardMaterial({color:0x876d4d,roughness:1})
    );
    path.rotation.x=-Math.PI/2;
    path.position.y=.015;
    this.scene.add(path);

    for(let z=-31;z<=29;z+=3.5){
      for(const side of [-1,1]){
        const x=side*(3.6+Math.sin(z*1.4)*.45);
        const trunk=new THREE.Mesh(
          new THREE.CylinderGeometry(.15,.28,2.7,8),
          new THREE.MeshStandardMaterial({color:0x4b3221,roughness:1})
        );
        trunk.position.set(x,1.35,z);
        trunk.castShadow=true;
        this.scene.add(trunk);

        const crown=new THREE.Mesh(
          new THREE.IcosahedronGeometry(1.25,1),
          new THREE.MeshStandardMaterial({color:0x245331,roughness:.9})
        );
        crown.position.set(x,2.85,z);
        crown.scale.set(1,1.15,.9);
        crown.castShadow=true;
        this.scene.add(crown);
      }
    }

    for(let i=0;i<24;i++){
      const rock=new THREE.Mesh(
        new THREE.DodecahedronGeometry(.16+Math.random()*.34,0),
        new THREE.MeshStandardMaterial({color:0x5b655e,roughness:1})
      );
      const side=i%2?-1:1;
      rock.position.set(side*(2+Math.random()*2.7),.2,-29+Math.random()*58);
      rock.rotation.set(Math.random(),Math.random()*6,Math.random());
      rock.castShadow=true;
      this.scene.add(rock);
    }

    this.addFarm();
    this.addEgg();
  }

  addFarm(){
    const farm=new THREE.Group();
    farm.position.set(0,0,-18);

    const building=new THREE.Mesh(
      new THREE.BoxGeometry(5.5,3.2,4.5),
      new THREE.MeshStandardMaterial({color:0xb94f35,roughness:.9})
    );
    building.position.y=1.6;
    building.castShadow=true;
    farm.add(building);

    const roof=new THREE.Mesh(
      new THREE.ConeGeometry(4.2,2.3,4),
      new THREE.MeshStandardMaterial({color:0x6f3828,roughness:1})
    );
    roof.rotation.y=Math.PI/4;
    roof.position.y=4.35;
    roof.scale.set(1,.72,1);
    roof.castShadow=true;
    farm.add(roof);

    const door=new THREE.Mesh(
      new THREE.BoxGeometry(1.25,2.05,.08),
      new THREE.MeshStandardMaterial({color:0x4a2b1c})
    );
    door.position.set(0,1.02,2.27);
    farm.add(door);

    for(const x of [-2.5,2.5]){
      const post=new THREE.Mesh(
        new THREE.BoxGeometry(.16,2.4,.16),
        new THREE.MeshStandardMaterial({color:0x70472a})
      );
      post.position.set(x,1.2,2.5);
      farm.add(post);
    }

    const sign=new THREE.Mesh(
      new THREE.BoxGeometry(2.2,.65,.12),
      new THREE.MeshStandardMaterial({color:0xe6c36a})
    );
    sign.position.set(0,3.05,2.32);
    farm.add(sign);

    for(let x=-5;x<=5;x+=1.2){
      const fence=new THREE.Mesh(
        new THREE.BoxGeometry(.12,.75,.12),
        new THREE.MeshStandardMaterial({color:0x8c673d})
      );
      fence.position.set(x,.38,2.8);
      farm.add(fence);
    }

    this.scene.add(farm);
    this.farm=farm;
  }

  addEgg(){
    const g=new THREE.Group();
    g.name="NoobEgg";
    g.position.set(0,7.5,-1.9);

    const base=new THREE.MeshStandardMaterial({color:0xffd83d,roughness:.55});
    const egg=new THREE.Mesh(new THREE.SphereGeometry(.62,32,24),base);
    egg.scale.set(.8,1.25,.8);
    egg.castShadow=true;
    g.add(egg);

    // Diseño oficial visual del Huevo Noob: amarillo con franjas/parches verdes y azules.
    const green=new THREE.Mesh(
      new THREE.SphereGeometry(.635,32,16,0,Math.PI*2,.38,.30),
      new THREE.MeshStandardMaterial({color:0x49b84a,roughness:.5})
    );
    green.scale.set(.82,1.25,.82);
    green.position.y=.03;
    g.add(green);

    const blue=new THREE.Mesh(
      new THREE.SphereGeometry(.64,32,16,0,Math.PI*2,.63,.20),
      new THREE.MeshStandardMaterial({color:0x2685d8,roughness:.5})
    );
    blue.scale.set(.8,1.25,.8);
    blue.position.y=.03;
    g.add(blue);

    const glow=new THREE.PointLight(0xffd83d,0,5);
    glow.position.y=.15;
    g.add(glow);

    this.scene.add(g);
    this.egg=g;
    this.eggGlow=glow;
  }

  prepareCharacters(){
    const mike=this.characters.characters.Mike?.root;
    const micaela=this.characters.characters.Micaela?.root;
    if(mike){
      mike.visible=true;
      mike.position.set(-1.45,0,2.7);
      mike.rotation.y=.25;
    }
    if(micaela){
      micaela.visible=true;
      micaela.position.set(1.45,0,3.0);
      micaela.rotation.y=-.25;
    }
  }

  addCinematicUI(){
    const ui=document.createElement("div");
    ui.id="cinematic-ui";
    ui.style.cssText="position:absolute;inset:0;pointer-events:auto;z-index:20;font-family:system-ui,sans-serif;color:#fff;opacity:0;transition:opacity .6s ease";

    const top=document.createElement("div");
    top.style.cssText="position:absolute;left:0;right:0;top:0;height:8%;background:linear-gradient(#000b,transparent)";
    ui.appendChild(top);

    const bottom=document.createElement("div");
    bottom.style.cssText="position:absolute;left:0;right:0;bottom:0;height:19%;background:linear-gradient(transparent,#000 55%,#000)";
    ui.appendChild(bottom);

    const chapter=document.createElement("div");
    chapter.textContent="EGGARO  •  PRÓLOGO";
    chapter.style.cssText="position:absolute;top:5%;left:5%;font-size:11px;letter-spacing:3px;opacity:.72";
    ui.appendChild(chapter);

    const box=document.createElement("div");
    box.style.cssText="position:absolute;left:6%;right:6%;bottom:7%;min-height:70px;padding:13px 18px;border-left:3px solid #ffd76b;background:#0007;text-shadow:0 2px 7px #000;backdrop-filter:blur(3px)";
    const name=document.createElement("div");
    name.style.cssText="font-weight:900;letter-spacing:2px;font-size:12px;margin-bottom:5px";
    const text=document.createElement("div");
    text.style.cssText="font-size:clamp(15px,2.8vw,22px);line-height:1.3";
    box.append(name,text);
    ui.appendChild(box);

    document.getElementById("game").appendChild(ui);
    this.cineUI={ui,name,text};
    ui.addEventListener("pointerdown",()=>this.nextDialogue());
  }

  startCinematic(){
    this.cinematic=true;
    this.cineTime=0;
    this.dialogIndex=-1;
    this.dialogTimer=0;
    this.eggFalling=true;
    this.eggImpact=false;
    this.cineUI.ui.style.opacity="1";
    this.nextDialogue();

    const mike=this.characters.characters.Mike?.root;
    const micaela=this.characters.characters.Micaela?.root;
    if(mike)this.characters.play("Mike","walk|caminar|run|correr");
    if(micaela)this.characters.play("Micaela","walk|caminar|run|correr");
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
    this.characters.setVisible(this.selectedCharacter);
    const selected=this.characters.characters[this.selectedCharacter]?.root;
    if(selected){
      selected.position.set(0,0,0);
      selected.rotation.y=0;
    }
    this.camera.position.set(7,4.8,8);
    this.camera.lookAt(0,1,0);
  }

  update(dt){
    this.t+=dt;
    this.characters.update(dt);

    if(this.mist)this.mist.position.z=Math.sin(this.t*.08)*.7;

    if(!this.cinematic){
      this.camera.position.x=7+Math.sin(this.t*.18)*.5;
      this.camera.lookAt(0,1,0);
      return;
    }

    this.cineTime+=dt;
    this.dialogTimer+=dt;

    const mike=this.characters.characters.Mike?.root;
    const micaela=this.characters.characters.Micaela?.root;

    // Los dos avanzan por el camino hacia el huevo.
    if(this.cineTime>1.0 && this.cineTime<7.8){
      const p=Math.min((this.cineTime-1)/6.8,1);
      if(mike)mike.position.lerpVectors(new THREE.Vector3(-1.45,0,2.7),new THREE.Vector3(-.72,0,-.55),p);
      if(micaela)micaela.position.lerpVectors(new THREE.Vector3(1.45,0,3.0),new THREE.Vector3(.72,0,-.35),p);
      if(mike)mike.rotation.y=Math.atan2(0,1)+.08;
      if(micaela)micaela.rotation.y=-.08;
    }

    // El huevo cae desde el cielo y golpea el suelo.
    if(this.egg){
      if(this.cineTime<5.1){
        const p=this.cineTime/5.1;
        this.egg.position.y=7.5-(6.78*Math.min(p,1));
        this.egg.rotation.z=Math.sin(this.cineTime*4)*.06;
        this.egg.rotation.y+=dt*1.5;
      }else if(!this.eggImpact){
        this.egg.position.y=.72;
        this.eggImpact=true;
        this.egg.scale.setScalar(1.16);
        this.eggGlow.intensity=5;
      }else{
        this.egg.scale.lerp(new THREE.Vector3(1,1,1),Math.min(dt*5,1));
        this.egg.position.y=.72+Math.sin(this.cineTime*2)*.018;
        this.egg.rotation.y+=dt*.5;
        this.eggGlow.intensity=Math.max(0,2+Math.sin(this.cineTime*5)*.8);
      }
    }

    // Planos: presentación del bosque, caminata, caída, impacto y revelación.
    let elapsed=0;
    let shot=this.shots[this.shots.length-1];
    for(const s of this.shots){
      if(this.cineTime>=elapsed && this.cineTime<elapsed+s.d){shot=s;break;}
      elapsed+=s.d;
    }

    const target=new THREE.Vector3(...shot.cam);
    const look=new THREE.Vector3(...shot.look);
    this.camera.position.lerp(target,1-Math.pow(.0008,dt));
    const currentLook=this.camera.userData.cineLook||new THREE.Vector3();
    currentLook.lerp(look,1-Math.pow(.0008,dt));
    this.camera.userData.cineLook=currentLook;
    this.camera.lookAt(currentLook);

    // Pequeño movimiento de cámara para dar sensación de plano real.
    this.camera.position.x+=Math.sin(this.cineTime*.7)*.012;
    this.camera.position.y+=Math.sin(this.cineTime*.9)*.008;

    // Al terminar cada diálogo, avanza automáticamente.
    if(this.dialogTimer>shot.d)this.nextDialogue();
  }

  resize(aspect){
    this.camera.aspect=aspect;
    this.camera.updateProjectionMatrix();
  }
}
