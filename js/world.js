import * as THREE from 'three';
import {GAME} from './config.js';

function fitBottomPlane(root){
  root.updateMatrixWorld(true);
  const pts=[];
  const box=new THREE.Box3().setFromObject(root);
  const minY=box.min.y;
  const band=Math.max((box.max.y-minY)*0.035,0.02);

  root.traverse(o=>{
    if(!o.isMesh||!o.geometry?.attributes?.position)return;
    const p=o.geometry.attributes.position;
    for(let i=0;i<p.count;i++){
      const v=new THREE.Vector3().fromBufferAttribute(p,i);
      v.applyMatrix4(o.matrixWorld);
      if(v.y<=minY+band)pts.push(v);
    }
  });

  if(pts.length<20)return;

  // Least-squares plane: y = ax + bz + c
  let sx=sz=sxx=sxz=szz=sy=sxy=szy=0;
  for(const p of pts){
    sx+=p.x; sz+=p.z; sy+=p.y;
    sxx+=p.x*p.x; sxz+=p.x*p.z; szz+=p.z*p.z;
    sxy+=p.x*p.y; szy+=p.z*p.y;
  }
  const n=pts.length;
  const A=[
    [sxx,sxz,sx],
    [sxz,szz,sz],
    [sx,sz,n]
  ];
  const B=[sxy,szy,sy];

  // Solve the 3x3 system with Gaussian elimination.
  for(let i=0;i<3;i++){
    let pivot=i;
    for(let j=i+1;j<3;j++)if(Math.abs(A[j][i])>Math.abs(A[pivot][i]))pivot=j;
    if(Math.abs(A[pivot][i])<1e-9)return;
    [A[i],A[pivot]]=[A[pivot],A[i]];
    [B[i],B[pivot]]=[B[pivot],B[i]];
    for(let j=i+1;j<3;j++){
      const f=A[j][i]/A[i][i];
      for(let k=i;k<3;k++)A[j][k]-=f*A[i][k];
      B[j]-=f*B[i];
    }
  }
  for(let i=2;i>=0;i--){
    for(let j=0;j<i;j++){
      const f=A[j][i]/A[i][i];
      B[j]-=f*B[i];
      A[j][i]=0;
    }
  }

  const a=B[0]/A[0][0], b=B[1]/A[1][1];
  let normal=new THREE.Vector3(-a,1,-b).normalize();
  if(normal.y<0)normal.negate();

  const center=box.getCenter(new THREE.Vector3());
  const q=new THREE.Quaternion().setFromUnitVectors(normal,new THREE.Vector3(0,1,0));
  root.position.sub(center);
  root.applyQuaternion(q);
  root.position.add(center);

  // Remove the remaining underside offset without changing the staircase.
  root.updateMatrixWorld(true);
  const leveled=new THREE.Box3().setFromObject(root);
  root.position.y-=leveled.min.y;
}

export async function loadWorld(scene,loader){
  const gltf=await loader.loadAsync(GAME.mapPath);
  const world=gltf.scene;
  world.rotation.set(0,0,0);

  world.traverse(o=>{
    if(o.isMesh){
      o.castShadow=false;
      o.receiveShadow=true;
      o.frustumCulled=true;
      if(o.material){
        const ms=Array.isArray(o.material)?o.material:[o.material];
        ms.forEach(m=>{
          if(m.map)m.map.colorSpace=THREE.SRGBColorSpace;
          m.needsUpdate=true;
        });
      }
    }
  });

  const box=new THREE.Box3().setFromObject(world);
  const size=box.getSize(new THREE.Vector3());
  const center=box.getCenter(new THREE.Vector3());
  const scale=GAME.mapSize/Math.max(size.x,size.z,.001);
  world.scale.setScalar(scale);
  world.position.set(-center.x*scale,-box.min.y*scale,-center.z*scale);

  // Correct the real map base instead of faking it in HTML.
  fitBottomPlane(world);

  // Crop the visual underside: keep a tiny safety slice above the new base.
  world.updateMatrixWorld(true);
  const finalBox=new THREE.Box3().setFromObject(world);
  const cropY=finalBox.min.y+0.035;
  world.traverse(o=>{
    if(!o.isMesh||!o.geometry?.attributes?.position)return;
    const p=o.geometry.attributes.position;
    for(let i=0;i<p.count;i++){
      const v=new THREE.Vector3().fromBufferAttribute(p,i);
      v.applyMatrix4(o.matrixWorld);
      if(v.y<cropY)v.y=cropY;
      const inv=new THREE.Matrix4().copy(o.matrixWorld).invert();
      v.applyMatrix4(inv);
      p.setXYZ(i,v.x,v.y,v.z);
    }
    p.needsUpdate=true;
    o.geometry.computeBoundingBox();
    o.geometry.computeBoundingSphere();
  });

  scene.add(world);
  world.updateMatrixWorld(true);
  return {world,box:new THREE.Box3().setFromObject(world)};
}

export function buildColliders(world){
  const boxes=[];
  world.traverse(o=>{
    if(!o.isMesh||!/^COLLIDER_/i.test(o.name))return;
    const b=new THREE.Box3().setFromObject(o),s=b.getSize(new THREE.Vector3());
    boxes.push({x:(b.min.x+b.max.x)/2,z:(b.min.z+b.max.z)/2,w:s.x+.25,d:s.z+.25});
  });
  return boxes;
}

export function blocked(x,z,boxes){
  const r=.48;
  return boxes.some(b=>x+r>b.x-b.w/2&&x-r<b.x+b.w/2&&z+r>b.z-b.d/2&&z-r<b.z+b.d/2);
}
