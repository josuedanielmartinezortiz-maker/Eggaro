import * as THREE from "https://unpkg.com/three@0.180.0/build/three.module.js";
import { SceneManager } from "./SceneManager.js";
import { GraphicsSettings } from "./GraphicsSettings.js";

export class Game{
  constructor(container){
    this.container=container;
    this.renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,GraphicsSettings.maxPixelRatio()));
    this.renderer.setSize(innerWidth,innerHeight);
    this.renderer.shadowMap.enabled=true;
    this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);
    this.sceneManager=new SceneManager(this.renderer);
    addEventListener("resize",()=>this.resize());
  }
  start(){
    this.sceneManager.start();
    this.last=performance.now();
    requestAnimationFrame(t=>this.loop(t));
  }
  loop(t){
    const dt=Math.min((t-this.last)/1000,.05); this.last=t;
    this.sceneManager.update(dt,t/1000);
    this.renderer.render(this.sceneManager.scene,this.sceneManager.camera);
    requestAnimationFrame(x=>this.loop(x));
  }
  resize(){
    this.renderer.setSize(innerWidth,innerHeight);
    this.sceneManager.resize(innerWidth/innerHeight);
  }
}
