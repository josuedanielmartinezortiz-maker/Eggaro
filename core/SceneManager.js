import * as THREE from "https://unpkg.com/three@0.180.0/build/three.module.js";
import { WorldScene } from "../escenas/WorldScene.js";

export class SceneManager{
  constructor(renderer){
    this.renderer=renderer;
    this.scene=new THREE.Scene();
    this.scene.background=new THREE.Color(0x081018);
    this.camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,500);
    this.camera.position.set(0,2.5,8);
    this.scene.add(this.camera);
    this.current=null;
    this.started=false;
    this.createStartScreen();
  }

  createStartScreen(){
    const ui=document.createElement("div");
    ui.id="start-screen";
    ui.style.cssText=[
      "position:absolute","inset:0","z-index:20","display:flex",
      "align-items:center","justify-content:center","overflow:hidden",
      "background:radial-gradient(circle at 50% 38%,#294c35 0%,#101b18 42%,#05070b 100%)",
      "font-family:system-ui,sans-serif;color:white"
    ].join(";");

    const glow=document.createElement("div");
    glow.style.cssText="position:absolute;width:70vw;height:70vw;border-radius:50%;background:radial-gradient(circle,rgba(255,220,130,.18),transparent 65%);filter:blur(20px)";
    ui.appendChild(glow);

    const card=document.createElement("div");
    card.style.cssText="position:relative;text-align:center;padding:32px 24px;max-width:520px;width:90%;z-index:2";
    ui.appendChild(card);

    const small=document.createElement("div");
    small.textContent="BIENVENIDO A";
    small.style.cssText="font-size:clamp(12px,2vw,17px);font-weight:800;letter-spacing:6px;opacity:.75;margin-bottom:8px";
    card.appendChild(small);

    const title=document.createElement("div");
    title.textContent="GAMERPRO";
    title.style.cssText="font-size:clamp(46px,12vw,92px);font-weight:1000;letter-spacing:5px;line-height:.9;text-shadow:0 8px 30px #000";
    card.appendChild(title);

    const subtitle=document.createElement("div");
    subtitle.textContent="GAME";
    subtitle.style.cssText="font-size:clamp(20px,5vw,38px);font-weight:900;letter-spacing:14px;margin:10px 0 34px";
    card.appendChild(subtitle);

    const play=document.createElement("button");
    play.type="button";
    play.textContent="▶  JUGAR";
    play.style.cssText=[
      "border:0","border-radius:18px","padding:16px 58px",
      "font-size:20px","font-weight:900","letter-spacing:2px",
      "color:white","background:linear-gradient(135deg,#e6a83d,#c96c28)",
      "box-shadow:0 10px 30px rgba(0,0,0,.45)",
      "cursor:pointer","touch-action:manipulation"
    ].join(";");
    card.appendChild(play);

    const hint=document.createElement("div");
    hint.textContent="Mike • Micaela • Huevos • Gallinero";
    hint.style.cssText="margin-top:22px;font-size:12px;opacity:.55;letter-spacing:1px";
    card.appendChild(hint);

    const enter=()=>{
      if(this.started)return;
      this.started=true;
      ui.style.transition="opacity .55s ease";
      ui.style.opacity="0";
      setTimeout(()=>ui.remove(),600);
      this.current=new WorldScene(this.scene,this.camera);
      this.current.start();
    };

    play.addEventListener("click",enter);
    ui.addEventListener("keydown",e=>{if(e.key==="Enter")enter()});
    document.getElementById("game").appendChild(ui);
    this.startUI=ui;
  }

  start(){}

  update(dt,time){
    if(this.current) this.current.update(dt,time);
  }

  resize(aspect){
    this.camera.aspect=aspect;
    this.camera.updateProjectionMatrix();
  }
}
