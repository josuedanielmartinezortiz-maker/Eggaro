import * as THREE from "https://unpkg.com/three@0.180.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";
const OLD_REPO="https://raw.githubusercontent.com/josuedanielmartinezortiz-maker/Game/main/3D/";

export class CharacterSelection{
  constructor(scene,camera,onConfirm){
    this.scene=scene;this.camera=camera;this.onConfirm=onConfirm;this.loader=new GLTFLoader();
    this.models={};this.selected="Mike";this.makeUI();this.loadModels();
  }
  makeUI(){
    const ui=document.createElement("div");ui.id="character-selection";
    ui.style.cssText="position:absolute;inset:0;z-index:15;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 35%,#294b39,#07100e 72%);font-family:system-ui,sans-serif;color:#fff;padding:18px;box-sizing:border-box";
    const title=document.createElement("div");title.textContent="ELIGE A TU EXPLORADOR";title.style.cssText="font-size:clamp(25px,7vw,48px);font-weight:1000;letter-spacing:3px;text-align:center;text-shadow:0 5px 25px #000;margin-bottom:5px";ui.appendChild(title);
    const sub=document.createElement("div");sub.textContent="Mike o Micaela te acompañarán en EGGARO";sub.style.cssText="font-size:13px;opacity:.65;margin-bottom:18px";ui.appendChild(sub);
    const stage=document.createElement("div");stage.style.cssText="position:relative;width:min(760px,96%);height:min(52vh,390px);border:1px solid #ffffff22;border-radius:26px;background:linear-gradient(180deg,#17322788,#08100dcc);box-shadow:0 25px 70px #0009;overflow:hidden";ui.appendChild(stage);
    const spotlight=document.createElement("div");spotlight.style.cssText="position:absolute;left:50%;top:-25%;transform:translateX(-50%);width:70%;height:85%;background:radial-gradient(ellipse,rgba(255,220,120,.22),transparent 65%);filter:blur(12px)";stage.appendChild(spotlight);
    const label=document.createElement("div");label.style.cssText="position:absolute;top:15px;left:18px;font-size:9px;letter-spacing:3px;opacity:.45";label.textContent="PERSONAJE";stage.appendChild(label);
    const cards=document.createElement("div");cards.style.cssText="position:absolute;left:12px;right:12px;bottom:12px;display:flex;gap:10px;justify-content:center";stage.appendChild(cards);
    this.buttons={};
    for(const [id,labelText,desc] of [["Mike","MIKE","Explorador"],["Micaela","MICAELA","Exploradora"]]){
      const b=document.createElement("button");b.type="button";b.style.cssText="flex:1;max-width:270px;padding:12px;border:1px solid #ffffff22;border-radius:15px;background:#08100dcc;color:white;cursor:pointer;touch-action:manipulation;box-shadow:0 8px 22px #0007";
      b.innerHTML=`<div style="font-size:18px;font-weight:1000;letter-spacing:2px">${labelText}</div><div style="font-size:11px;opacity:.58;margin-top:2px">${desc}</div>`;
      b.onclick=()=>this.confirm(id);cards.appendChild(b);this.buttons[id]=b;
    }
    const hint=document.createElement("div");hint.textContent="TOCA UNA TARJETA PARA COMENZAR";hint.style.cssText="margin-top:12px;font-size:9px;letter-spacing:2px;opacity:.42";ui.appendChild(hint);
    document.getElementById("game").appendChild(ui);this.ui=ui;
  }
  async loadModels(){
    await Promise.all(["Mike","Micaela"].map(id=>new Promise(resolve=>{
      const file=id==="Mike"?"mike.glb":"micaela.glb";
      this.loader.load(OLD_REPO+file,g=>{
        const root=g.scene;root.position.set(0,0,0);root.scale.setScalar(.92);root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});root.visible=false;this.scene.add(root);this.models[id]=root;resolve();
      },undefined,()=>resolve());
    })));
    this.showModel(this.selected);
  }
  showModel(id){
    for(const key in this.models)this.models[key].visible=key===id;
    const root=this.models[id];if(root)root.rotation.y=Math.PI;
  }
  confirm(id=this.selected){
    this.selected=id;localStorage.setItem("gamerpro_personaje",id);
    this.ui.style.transition="opacity .35s";this.ui.style.opacity="0";
    setTimeout(()=>{this.ui.remove();for(const key in this.models)this.scene.remove(this.models[key]);this.onConfirm(this.selected);},400);
  }
  update(dt){
    const root=this.models[this.selected];if(root)root.rotation.y=Math.PI+Math.sin(performance.now()/1200)*.05;
    this.camera.position.set(0,1.75,7.6);this.camera.lookAt(0,1.05,0);
  }
}