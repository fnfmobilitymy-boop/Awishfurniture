import {useEffect,useRef} from 'react';
import * as THREE from 'three';

const vertexShader=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const fragmentShader=`
precision highp float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 uSize;
uniform vec2 uImage;
uniform vec2 uPosition;
uniform float uTime;
uniform float uScroll;
uniform vec4 uRipples[6];
void main(){
 vec2 uv=vUv;
 vec2 aspect=vec2(uSize.x/uSize.y,1.);
 vec2 offset=vec2(0.);
 for(int i=0;i<6;i++){
  vec4 ripple=uRipples[i];
  float age=uTime-ripple.z;
  if(age>=0.&&age<1.8){
   vec2 delta=(uv-ripple.xy)*aspect;
   float distance=length(delta);
   float front=distance-age*.25;
   float ring=sin(front*42.)*exp(-front*front*110.)*exp(-age*2.8);
   offset+=normalize(delta+vec2(.0001))*ring*.003*ripple.w/aspect;
  }
 }
 offset.x+=sin(uv.y*13.+uTime*2.4)*uScroll*.0007;
 offset.y+=sin(uv.x*10.-uTime*2.)*uScroll*.0004;
 // Keep even overlapping ripples within a subtle 0.2% texture displacement.
 offset=clamp(offset,vec2(-.002),vec2(.002));
 vec2 cover=vec2(1.);
 float screenRatio=uSize.x/uSize.y;
 float imageRatio=uImage.x/uImage.y;
 if(screenRatio<imageRatio)cover.x=screenRatio/imageRatio;
 else cover.y=imageRatio/screenRatio;
 vec2 photoUv=(uv+offset)*cover+(1.-cover)*uPosition;
 gl_FragColor=texture2D(uTexture,clamp(photoUv,vec2(.001),vec2(.999)));
}`;

/** Refraction remains inside photographs; headings and controls stay stable. */
export default function WaterImage({src,alt,className='',loading='lazy',fetchPriority,position=[.5,.5]}){
 const ref=useRef();
 useEffect(()=>{
  const el=ref.current;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let renderer,scene,camera,material,geometry,texture,frame,visible=false,initialized=false,disposed=false,start=performance.now(),next=0,lastPointer=0,lastWheel=0,scrollEnergy=0,lastScroll=window.scrollY;
  const ripples=Array.from({length:6},()=>new THREE.Vector4(.5,.5,-20,0));
  let pointer={x:.5,y:.5};
  const resize=()=>{if(!renderer)return;const {width,height}=el.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);material.uniforms.uSize.value.set(width,height)};
  const addRipple=(x,y,strength=1)=>{ripples[next].set(x,y,(performance.now()-start)/1000,strength);next=(next+1)%6;el.dataset.rippleCount=String(Number(el.dataset.rippleCount||0)+1)};
  const move=e=>{const now=performance.now();const r=el.getBoundingClientRect();if(!visible||e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;pointer={x:(e.clientX-r.left)/r.width,y:1-(e.clientY-r.top)/r.height};if(now-lastPointer>120){addRipple(pointer.x,pointer.y,.55);lastPointer=now}};
  const wheel=()=>{const now=performance.now();if(visible&&now-lastWheel>320){addRipple(pointer.x,pointer.y,.18);lastWheel=now}};
  const render=()=>{frame=requestAnimationFrame(render);if(!visible||document.hidden||!material)return;const change=Math.min(1,Math.abs(window.scrollY-lastScroll)/38);lastScroll=window.scrollY;scrollEnergy=scrollEnergy*.9+change*.1;material.uniforms.uTime.value=(performance.now()-start)/1000;material.uniforms.uScroll.value=scrollEnergy;renderer.render(scene,camera)};
  const initialize=()=>{
   if(initialized||disposed)return;initialized=true;
   try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power'});}catch{return}
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.LinearSRGBColorSpace;
   const canvas=renderer.domElement;canvas.className='water-canvas';canvas.setAttribute('aria-hidden','true');el.appendChild(canvas);
   scene=new THREE.Scene();camera=new THREE.Camera();geometry=new THREE.PlaneGeometry(2,2);
   texture=new THREE.TextureLoader().load(src,()=>{if(disposed)return;material.uniforms.uImage.value.set(texture.image.width,texture.image.height);canvas.classList.add('ready')});
   texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;
   material=new THREE.ShaderMaterial({vertexShader,fragmentShader,uniforms:{uTexture:{value:texture},uSize:{value:new THREE.Vector2(1,1)},uImage:{value:new THREE.Vector2(1,1)},uPosition:{value:new THREE.Vector2(position[0],1-position[1])},uTime:{value:0},uScroll:{value:0},uRipples:{value:ripples}}});
   scene.add(new THREE.Mesh(geometry,material));resize();render();
  };
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible){lastScroll=window.scrollY;initialize()}},{rootMargin:'80px'});observer.observe(el);
  const ro=new ResizeObserver(resize);ro.observe(el);window.addEventListener('pointermove',move,{passive:true});window.addEventListener('wheel',wheel,{passive:true});
  return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();ro.disconnect();window.removeEventListener('pointermove',move);window.removeEventListener('wheel',wheel);texture?.dispose();geometry?.dispose();material?.dispose();renderer?.dispose();renderer?.domElement.remove()};
 },[src]);
 return <div ref={ref} className={'water-image '+className} data-water-image="true"><img src={src} alt={alt} loading={loading} fetchPriority={fetchPriority} style={{objectPosition:`${position[0]*100}% ${position[1]*100}%`}}/></div>
}
