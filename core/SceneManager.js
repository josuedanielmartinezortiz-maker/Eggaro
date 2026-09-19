import * as THREE from "https://unpkg.com/three@0.180.0/build/three.module.js";
import { WorldScene } from "../escenas/WorldScene.js";

export class SceneManager{
  constructor(renderer){
    this.renderer=renderer;
    this.scene=new THREE.Scene();
    this.scene.background=new THREE.Color(0x081018);
    this.camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,500);
    this.camera.position.set(7,5,9);
    this.scene.add(this.camera);
    this.current=new WorldScene(this.scene,this.camera);
  }
  start(){this.current.start()}
  update(dt,time){this.current.update(dt,time)}
  resize(aspect){this.camera.aspect=aspect;this.camera.updateProjectionMatrix()}
}
