import * as THREE from 'three';
import {GAME} from './config.js';

function levelMapBase(root){
  root.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(root),minY=box.min.y,height=Math.max(box.max.y-minY,1),band=Math.max(height*0.012,0.01),pts=[];
  root.traverse(o=>{
    if(!o.isMesh||!o.visible||!o.geometry?.attributes?.position)return;
    const p=o.geometry.attributes.position;
    for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);if(v.y<=minY+band)pts.push(v);}
  });
  if(pts.length<30)return;
  let sx=0,sz=0,sxx=0,sxz=0,szz=0,sy=0,sxy=0,szy=0;
  for(const p of pts){sx+=p.x;sz+=p.z;sy+=p.y;sxx+=p.x*p.x;sxz+=p.x*p.z;szz+=p.z*p.z;sxy+=p.x*p.y;szy+=p.z*p.y;}
  const n=pts.length,A=[[sxx,sxz,sx],[sxz,szz,sz],[sx,sz,n]],B=[sxy,szy,sy];
  for(let i=0;i<3;i++){let pivot=i;for(let j=i+1;j<3;j++)if(Math.abs(A[j][i])>Math.abs(A[pivot][i]))pivot=j;if(Math.abs(A[pivot][i])<1e-9)return;[A[i],A[pivot]]=[A[pivot],A[i]];[B[i],B[pivot]]=[B[pivot],B[i]];for(let j=i+1;j<3;j++){const f=A[j][i]/A[i][i];for(let k=i;k<3;k++)A[j][k]-=f*A[i][k];B[j]-=f*B[i];}}
  for(let i=2;i>=0;i--)for(let j=0;j<i;j++){const f=A[j][i]/A[i][i];B[j]-=f*B[i];A[j][i]=0;}
  const normal=new THREE.Vector3(-(B[0]/A[0][0]),1,-(B[1]/A[1][1])).normalize();
  root.quaternion.premultiply(new THREE.Quaternion().setFromUnitVectors(normal,new THREE.Vector3(0,1,0)));
  root.updateMatrixWorld(true);
  const leveled=new THREE.Box3().setFromObject(root);root.position.y-=leveled.min.y;
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

  // Level the broad map base without cutting the geometry.
  levelMapBase(world);

  scene.add(world);
  world.updateMatrixWorld(true);
  const groundMeshes=[];world.traverse(o=>{if(o.isMesh&&o.visible&&!/^COLLIDER_/i.test(o.name)&&!o.userData?.noGround)groundMeshes.push(o)});return {world,box:new THREE.Box3().setFromObject(world),groundMeshes};
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
