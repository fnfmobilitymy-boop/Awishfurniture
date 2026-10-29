import {useState,useRef,useLayoutEffect} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {ArrowUpRight,ArrowDown} from 'lucide-react';
import {casePhotos} from './cases';
gsap.registerPlugin(ScrollTrigger);
 function Card({item,fanCard=false,t,onOpen}){return <article className={fanCard?'fan-card':'real-case-card'} data-case-id={item.id}><button className="case-photo" onClick={()=>onOpen(item.id)} aria-label={`${t.openCase}: ${t.caseTitles[item.id]}`}><img src={item.image} alt={`${t.caseTitles[item.id]} — ${t.original}`} loading="lazy"/><span className="case-open"><ArrowUpRight size={17}/></span></button><div className="real-case-copy"><span>{String(item.id+1).padStart(2,'0')} / {t.caseCategories[item.category]}</span><h3>{t.caseTitles[item.id]}</h3></div></article>}
export default function CaseShowcase({t,lang,onOpen}){
 const [category,setCategory]=useState(0);const root=useRef();
 const selected=casePhotos.filter(p=>!category||p.category===category),fan=selected.slice(0,6),grid=selected.slice(6),simple=fan.length<4;
 useLayoutEffect(()=>{
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce||simple)return;
  const ctx=gsap.context(()=>{
   const mm=gsap.matchMedia();
   mm.add('(min-width: 701px)',()=>{
    gsap.fromTo('.fan-card',{x:i=>(i-2.5)*14,y:120,rotation:i=>(i-2.5)*3,scale:.78},{x:i=>(i-2.5)*Math.min(innerWidth*.155,215),y:i=>[65,-15,-55,-55,-15,65][i],rotation:i=>(i-2.5)*7,scale:1,ease:'power2.inOut',stagger:.015,scrollTrigger:{trigger:'.case-story',start:'top top',end:'bottom bottom',scrub:1}});
   });
   mm.add('(max-width: 700px)',()=>{
    gsap.fromTo('.fan-rail',{x:0},{x:()=>-(fan.length*190-innerWidth+40),ease:'none',scrollTrigger:{trigger:'.case-story',start:'top top',end:'bottom bottom',scrub:1}});
    gsap.to('.fan-card',{rotation:i=>(i%2?1:-1)*6,y:i=>(i%2?1:-1)*14,ease:'none',scrollTrigger:{trigger:'.case-story',start:'top top',end:'bottom bottom',scrub:1}});
   });
  },root);ScrollTrigger.refresh();return()=>ctx.revert();
 },[category,lang,simple]);

 return <section className="real-cases" id="cases" ref={root}><div className="case-heading-wrap"><div className="section-meta"><span className="eyebrow">{t.casesLabel}</span><span>{t.original}</span></div><div className="collection-heading"><h2>{t.casesTitle[0]}<br/><em>{t.casesTitle[1]}</em></h2><p>{t.casesDesc.map(line=><span key={line}>{line}<br/></span>)}</p></div><div className="filters" role="group" aria-label={t.caseFilter}>{t.caseCategories.map((cat,i)=><button key={cat} onClick={()=>setCategory(i)} className={category===i?'active':''} aria-pressed={category===i}>{cat}<sup>{String(i===0?casePhotos.length:casePhotos.filter(p=>p.category===i).length).padStart(2,'0')}</sup></button>)}</div></div><div className={'case-story '+(simple?'simple':'')}><div className="case-sticky"><span className="case-deck-watermark">kenny</span><div className="fan-rail">{fan.map(item=><Card key={item.id} item={item} t={t} onOpen={onOpen} fanCard/>)}</div><div className="case-scroll-hint"><ArrowDown size={14}/>{t.caseHint}</div></div></div>{grid.length>0&&<div className="more-cases"><div className="more-cases-label"><span className="eyebrow">{t.caseMore}</span><span>{String(fan.length+1).padStart(2,'0')} — {String(selected.length).padStart(2,'0')}</span></div><div className="real-case-grid">{grid.map(item=><Card key={item.id} item={item} t={t} onOpen={onOpen}/>)}</div></div>}<p className="case-provenance">{t.caseSource}</p></section>
}
