import {useEffect,useRef} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
const frames=Object.entries(import.meta.glob('./assets/sofa-motion/*.webp',{eager:true,query:'?url',import:'default'})).sort(([a],[b])=>a.localeCompare(b)).map(([,url])=>url);
export default function ScrollSofa({alt}){
 const ref=useRef();
 useEffect(()=>{
  const el=ref.current,canvas=el.querySelector('canvas'),ctx=canvas.getContext('2d');if(!ctx)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stopped=false,raf=0,current=-1,wanted=0,visible=true;const images=[],pending=new Set();
  function draw(){if(stopped||!visible)return;let index=wanted;if(!images[index]){let nearest=-1,distance=Infinity;images.forEach((im,i)=>{if(im&&Math.abs(i-wanted)<distance){nearest=i;distance=Math.abs(i-wanted)}});index=nearest}if(index<0||index===current)return;const image=images[index],w=canvas.width,h=canvas.height,s=Math.max(w/image.naturalWidth,h/image.naturalHeight);ctx.clearRect(0,0,w,h);ctx.drawImage(image,(w-image.naturalWidth*s)/2,(h-image.naturalHeight*s)/2,image.naturalWidth*s,image.naturalHeight*s);current=index;el.dataset.frame=String(index);el.classList.add('is-ready')}
  function schedule(){if(!raf)raf=requestAnimationFrame(()=>{raf=0;draw()})}
  async function load(index){if(stopped||images[index]||pending.has(index))return;pending.add(index);const image=new Image();image.src=frames[index];try{await image.decode();if(!stopped){images[index]=image;schedule()}}catch{}finally{pending.delete(index)}}
  const resize=()=>{const ratio=Math.min(devicePixelRatio,1.5);canvas.width=Math.round(el.clientWidth*ratio);canvas.height=Math.round(el.clientHeight*ratio);current=-1;schedule()};const ro=new ResizeObserver(resize);ro.observe(el);resize();load(0);
  // Four bounded download workers keep the entire sequence reusable in either scroll direction.
  async function worker(start){for(let i=start;i<frames.length&&!stopped;i+=4)await load(i)}
  if(!reduce)for(let i=0;i<4;i++)worker(i);
  const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)schedule()});io.observe(el);
  const trigger=reduce?null:ScrollTrigger.create({trigger:el.closest('.sofa-scroll-journey'),start:'top top',end:'bottom bottom',onUpdate:state=>{wanted=Math.min(frames.length-1,Math.round(state.progress*(frames.length-1)));load(wanted);schedule();el.dataset.progress=state.progress.toFixed(3)}});
  return()=>{stopped=true;trigger?.kill();ro.disconnect();io.disconnect();cancelAnimationFrame(raf);images.length=0};
 },[]);
 return <div ref={ref} className="hero-photo scroll-sofa" role="img" aria-label={alt}><img src={frames[0]} alt="" fetchPriority="high"/><canvas aria-hidden="true"/></div>
}
