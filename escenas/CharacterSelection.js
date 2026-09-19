import * as THREE from "https://unpkg.com/three@0.180.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

const OLD_REPO="https://raw.githubusercontent.com/josuedanielmartinezortiz-maker/Game/main/3D/";

export class CharacterSelection{
  constructor(scene,camera,onConfirm){
    this.scene=scene; this.camera=camera; this.onConfirm=onConfirm;
    this.loader=new GLTFLoader(); this.models={}; this.selected="Mike"; this.ready=false;
    this.makeUI(); this.loadModels();
  }

  makeUI(){
    const ui=document.createElement("div");
    ui.id="character-selection";
    ui.style.cssText="position:absolute;inset:0;z-index:15;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(#081018cc,#05070bee);font-family:system-ui,sans-serif;color:white;padding:20px;box-sizing:border-box";
    
    const title=document.createElement("div");
    title.textContent="SELECCIONA TU PERSONAJE";
    title.style.cssText="font-size:clamp(24px,6vw,46px);font-weight:1000;letter-spacing:2px;text-align:center;text-shadow:0 5px 20px #000;margin-bottom:8px";
    ui.appendChild(title);

    const sub=document.createElement("div");
    sub.textContent="Elige a quién llevarás al mundo";
    sub.style.cssText="opacity:.7;font-size:14px;margin-bottom:22px";
    ui.appendChild(sub);

    const cards=document.createElement("div");
    cards.style.cssText="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;width:min(720px,100%)";
    ui.appendChild(cards);

    this.buttons={};
    for(const [id,label,desc] of [["Mike","MIKE","Explorador"],["Micaela","MICAELA","Exploradora"]]){
      const b=document.createElement("button");
      b.type="button";
      b.style.cssText="width:min(310px,42vw);min-width:145px;padding:18px 12px;border:2px solid transparent;border-radius:18px;background:#17231f;color:white;cursor:pointer;touch-action:manipulation;box-shadow:0 8px 24px #0008";
      b.innerHTML=`<div style="font-size:22px;font-weight:1000;letter-spacing:2px">${label}</div><div style="opacity:.65;margin-top:4px">${desc}</div>`;
      b.onclick=()=>this.confirm(id);
      cards.appendChild(b); this.buttons[id]=b;
    }

    const status=document.createElement("div");
    status.textContent="Selecciona a Mike o Micaela";
    status.style.cssText="margin-top:12px;font-size:12px;opacity:.55";
    ui.appendChild(status); this.status=status;

    document.getElementById("game").appendChild(ui); this.ui=ui;
    this.select("Mike");
  }

  select(id){
    this.selected=id;
    for(const key in this.buttons){
      this.buttons[key].style.borderColor=key===id?"#f2b84b":"transparent";
      this.buttons[key].style.background=key===id?"#293c30":"#17231f";
    }
    this.showModel(id);
  }

  async loadModels(){
    await Promise.all(["Mike","Micaela"].map(id=>new Promise(resolve=>{
      const file=id==="Mike"?"mike.glb":"micaela.glb";
      this.loader.load(OLD_REPO+file,g=>{
        const root=g.scene;
        root.position.set(0,0,0); root.scale.setScalar(1.8);
        root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
        root.visible=false; this.scene.add(root); this.models[id]=root; resolve();
      },undefined,()=>resolve());
    })));
    this.ready=true; this.status.textContent="Selecciona tu personaje";
    this.showModel(this.selected);
  }

  showModel(id){
    for(const key in this.models)this.models[key].visible=key===id;
    const root=this.models[id];
    if(root) root.rotation.y=Math.PI;
  }

  confirm(id=this.selected){
    this.selected=id;
    localStorage.setItem("gamerpro_personaje",this.selected);
    this.ui.style.transition="opacity .4s ease"; this.ui.style.opacity="0";
    setTimeout(()=>{this.ui.remove();for(const key in this.models)this.scene.remove(this.models[key]);this.onConfirm(this.selected)},420);
  }

  update(dt){
    const root=this.models[this.selected];
    if(root) root.rotation.y=Math.PI+Math.sin(performance.now()/1200)*.08;
    this.camera.position.set(0,2.2,7);
    this.camera.lookAt(0,1.2,0);
  }
}
