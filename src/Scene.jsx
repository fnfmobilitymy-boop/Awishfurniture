import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const mat=(color,roughness=.8)=>new THREE.MeshStandardMaterial({color,roughness});
const fabric=mat('#d8ccba'), wood=mat('#68432b'), darkWood=mat('#4c3022'), metal=mat('#292722',.4);
// Subtle procedural grain keeps the demo self-contained; no external texture requests.
const grainCanvas=document.createElement('canvas');grainCanvas.width=256;grainCanvas.height=256;
const grainCtx=grainCanvas.getContext('2d');grainCtx.fillStyle='#73513a';grainCtx.fillRect(0,0,256,256);
for(let i=0;i<150;i++){grainCtx.beginPath();grainCtx.strokeStyle=`rgba(35,17,5,${.025+(i%7)*.012})`;grainCtx.lineWidth=.4+(i%3)*.35;for(let y=0;y<=256;y+=4){const x=i*1.8+Math.sin(y*.022+i*.17)*3+Math.sin(y*.057+i)*.8;if(y===0)grainCtx.moveTo(x,y);else grainCtx.lineTo(x,y)}grainCtx.stroke()}
const grainTexture=new THREE.CanvasTexture(grainCanvas);grainTexture.colorSpace=THREE.SRGBColorSpace;wood.map=grainTexture;wood.color.set('#ffffff');
const fabricCanvas=document.createElement('canvas');fabricCanvas.width=128;fabricCanvas.height=128;const fabricCtx=fabricCanvas.getContext('2d');const dots=fabricCtx.createImageData(128,128);
for(let i=0;i<dots.data.length;i+=4){const n=220+((i*13+i%29)%35);dots.data[i]=n;dots.data[i+1]=n;dots.data[i+2]=n;dots.data[i+3]=255}fabricCtx.putImageData(dots,0,0);
const fabricTexture=new THREE.CanvasTexture(fabricCanvas);fabricTexture.wrapS=fabricTexture.wrapT=THREE.RepeatWrapping;fabricTexture.repeat.set(6,6);fabric.bumpMap=fabricTexture;fabric.bumpScale=.018;

function box(w,h,d,r,material,x=0,y=0,z=0){const m=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,5,r),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;return m;}
function cylinder(rt,rb,h,material,x,y,z){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,64),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;return m;}
export function furniture(kind){
 const g=new THREE.Group();
 if(kind==='sofa'){
  g.add(box(3.7,.32,1.35,.15,fabric,0,.39,0));
  for(let i=0;i<3;i++){g.add(box(1.12,.23,1.12,.11,fabric,(i-1)*1.15,.65,.08));g.add(box(1.12,.78,.3,.12,fabric,(i-1)*1.15,1.02,-.53));}
  g.add(box(.3,.65,1.4,.14,fabric,-1.85,.75,0),box(.3,.65,1.4,.14,fabric,1.85,.75,0));
  for(const x of [-1.6,1.6])for(const z of [-.43,.43])g.add(cylinder(.05,.035,.25,darkWood,x,.15,z));
  const pillow=box(.5,.53,.18,.13,mat('#89745c'),-1.36,1,.03);pillow.rotation.set(-.2,.12,-.22);g.add(pillow);
 }else if(kind==='table'){
  g.add(cylinder(1.48,1.48,.13,wood,0,1.15,0));
  g.add(cylinder(.62,.62,1.08,darkWood,0,.56,0));
  for(let i=0;i<44;i++){const a=i/44*Math.PI*2;g.add(cylinder(.014,.014,.98,wood,Math.cos(a)*.625,.55,Math.sin(a)*.625));}
  g.add(cylinder(.17,.11,.08,mat('#c6b49b'),.2,1.26,.1));
 }else if(kind==='cabinet'){
  g.add(box(3.8,.65,.65,.035,wood,0,.61,0));
  for(let i=0;i<4;i++)g.add(box(.91,.57,.045,.025,darkWood,(i-1.5)*.94,.61,.35));
  for(let i=0;i<48;i++)g.add(box(.025,.53,.025,.008,wood,(i-23.5)*.076,.61,.39));
  for(const x of [-1.6,1.6])g.add(box(.1,.3,.49,.02,metal,x,.18,0));
  g.add(cylinder(.12,.17,.25,mat('#b8ab90'),1.12,1.06,0));
 }else if(kind==='chair'){
  g.add(box(.98,.2,.95,.14,fabric,0,.72,0));g.add(box(1.02,.72,.19,.12,fabric,0,1.15,-.4));
  for(const x of [-.37,.37])for(const z of [-.33,.33])g.add(box(.07,.66,.07,.02,wood,x,.34,z));
 }else{
  g.add(box(3.4,.4,2.4,.12,fabric,0,.37,0),box(3.5,1.25,.22,.1,mat('#9c8b72'),0,.8,-1.22));
  g.add(box(1.25,.18,.6,.12,mat('#eee7dc'),-.8,.67,-.7),box(1.25,.18,.6,.12,mat('#eee7dc'),.8,.67,-.7));
 }
 return g;
}
export default function Scene({kind='sofa',interactive=false,progressRef,small=false}){
 const ref=useRef();
 useEffect(()=>{
  const el=ref.current;let renderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;el.appendChild(renderer.domElement);
  const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(33,1,.1,50);camera.position.set(4.6,3.0,6.6);camera.lookAt(0,.65,0);
  scene.add(new THREE.HemisphereLight('#fff6e3','#6d6354',2));const light=new THREE.DirectionalLight('#fff0d4',3);light.position.set(-3,6,5);light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-5;light.shadow.camera.right=5;light.shadow.camera.top=5;light.shadow.camera.bottom=-5;light.shadow.bias=-.001;scene.add(light);
  const fill=new THREE.DirectionalLight('#ffffff',1.5);fill.position.set(4,2,-3);scene.add(fill);
  const model=furniture(kind);scene.add(model);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.ShadowMaterial({opacity:.11}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
  let target=0,dragging=false,last=0,rotation=0,visible=false;
  const down=e=>{if(!interactive)return;dragging=true;last=e.clientX;el.setPointerCapture?.(e.pointerId)};
  const move=e=>{if(dragging){rotation+=(e.clientX-last)*.012;last=e.clientX;}};const up=()=>dragging=false;
  el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  const resize=()=>{const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};const ro=new ResizeObserver(resize);ro.observe(el);resize();
  const io=new IntersectionObserver(([entry])=>visible=entry.isIntersecting,{rootMargin:'100px'});io.observe(el);
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(!small&&!reduce)model.scale.setScalar(.8);let id;const render=t=>{id=requestAnimationFrame(render);if(!visible)return;target=rotation+(progressRef?progressRef.current*Math.PI*1.6:0);model.rotation.y+=(target-model.rotation.y)*.065;model.scale.setScalar(THREE.MathUtils.lerp(model.scale.x,1,.055));if(!small&&!reduce)model.position.y=Math.sin(t*.0007)*.035;renderer.render(scene,camera);};id=requestAnimationFrame(render);
  return()=>{cancelAnimationFrame(id);ro.disconnect();io.disconnect();el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);scene.traverse(o=>{o.geometry?.dispose();});renderer.dispose();renderer.domElement.remove();};
 },[kind,interactive,small]);
 return <div className={`three-scene ${interactive?'interactive':''}`} ref={ref} role="img" aria-label={`${kind} 家具三维展示${interactive?'，可拖动旋转':''}`}/>;
}
