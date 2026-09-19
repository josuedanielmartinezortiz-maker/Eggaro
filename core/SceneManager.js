import * as THREE from "https://unpkg.com/three@0.180.0/build/three.module.js";
import { WorldScene } from "../escenas/WorldScene.js";
import { CharacterSelection } from "../escenas/CharacterSelection.js";

export class SceneManager{
  constructor(renderer){
    this.renderer=renderer;
    this.scene=new THREE.Scene();
    this.scene.background=new THREE.Color(0x081018);
    this.camera=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,.1,500);
    this.camera.position.set(0,2.5,8);
    this.scene.add(this.camera);
    this.current=null; this.started=false;
    this.createStartScreen();
  }

  createStartScreen(){
    const ui=document.createElement("div");
    ui.id="start-screen";
    ui.style.cssText="position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;overflow:hidden;background:linear-gradient(180deg,#07151c,#102b25 55%,#06100d);font-family:system-ui,sans-serif;color:#fff";
    const stars=document.createElement("div");
    stars.style.cssText="position:absolute;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,.55) 1px,transparent 1px);background-size:55px 55px;opacity:.18";
    ui.appendChild(stars);
    const horizon=document.createElement("div");
    horizon.style.cssText="position:absolute;left:-10%;right:-10%;bottom:-25%;height:60%;background:radial-gradient(ellipse,#315e38 0%,transparent 65%);filter:blur(8px)";
    ui.appendChild(horizon);
    const card=document.createElement("div");
    card.style.cssText="position:relative;width:min(520px,88%);padding:42px 28px 34px;text-align:center;background:rgba(5,12,11,.62);border:1px solid rgba(255,215,107,.3);border-radius:28px;box-shadow:0 25px 70px #0009;backdrop-filter:blur(12px)";
    ui.appendChild(card);
    const eyebrow=document.createElement("div");
    eyebrow.textContent="UNA AVENTURA DE HUEVOS";
    eyebrow.style.cssText="font-size:10px;letter-spacing:4px;font-weight:800;color:#ffd76b;opacity:.9;margin-bottom:15px";
    card.appendChild(eyebrow);
    const title=document.createElement("div");
    title.textContent="EGGARO";
    title.style.cssText="font-size:clamp(54px,14vw,92px);font-weight:1000;letter-spacing:6px;line-height:.85;background:linear-gradient(#fff8d8,#ffd45b 55%,#e89128);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 12px 35px #0008";
    card.appendChild(title);
    const line=document.createElement("div");
    line.style.cssText="width:90px;height:3px;margin:18px auto;background:linear-gradient(90deg,transparent,#ffd76b,transparent)";
    card.appendChild(line);
    const subtitle=document.createElement("div");
    subtitle.textContent="EL MISTERIO COMIENZA";
    subtitle.style.cssText="font-size:clamp(11px,2.5vw,14px);letter-spacing:4px;font-weight:800;opacity:.78;margin-bottom:30px";
    card.appendChild(subtitle);
    const play=document.createElement("button");
    play.type="button"; play.textContent="JUGAR";
    play.style.cssText="border:0;border-radius:14px;padding:16px 72px;font-size:18px;font-weight:1000;letter-spacing:3px;color:#182019;background:linear-gradient(135deg,#ffe58b,#e9a62f);box-shadow:0 9px 28px #0008;cursor:pointer;touch-action:manipulation";
    card.appendChild(play);
    const footer=document.createElement("div");
    footer.textContent="MIKE  •  MICAELA  •  GALLINERO  •  HUEVOS";
    footer.style.cssText="margin-top:24px;font-size:9px;letter-spacing:2px;opacity:.42";
    card.appendChild(footer);
    const enter=()=>{
      if(this.started)return;
      this.started=true; ui.style.transition="opacity .55s";ui.style.opacity="0";
      setTimeout(()=>ui.remove(),600);
      this.current=new CharacterSelection(this.scene,this.camera,(character)=>{
        this.current=new WorldScene(this.scene,this.camera,character); this.current.start();
      });
    };
    play.addEventListener("click",enter);
    document.getElementById("game").appendChild(ui);
  }
  start(){}
  update(dt,time){if(this.current)this.current.update(dt,time);}
  resize(aspect){this.camera.aspect=aspect;this.camera.updateProjectionMatrix();}
}