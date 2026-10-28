import {useEffect} from 'react';
import {ArrowUpRight,ArrowLeft,MapPin,Phone,Mail} from 'lucide-react';
import WaterImage from './WaterImage';
import {WhatsAppIcon} from './BrandIcons';
import {company} from './content';
import {translations,languages} from './i18n';
import {casePhotos} from './cases';
import {serviceById} from './services';
import {languageAtLocation,applySeo,localePath,servicePath} from './seo';
import logo from './assets/global-mars-logo.webp';
import furniture from './assets/projects/restoration.webp';
import hotel from './assets/projects/hotel.webp';
import restaurant from './assets/projects/restaurant.webp';
import office from './assets/projects/office.webp';
const covers=[furniture,hotel,restaurant,office];
export default function ServicePage({serviceId}){
 const lang=languageAtLocation(location),t=translations[lang],service=serviceById(serviceId),content=service.content[lang];
 const wa=company.whatsapp+'?text='+encodeURIComponent(t.waGreeting+'\n\n'+t.waProject+': '+t.sectorNames[service.sector]);
 useEffect(()=>{
  const url=new URL(location.href);url.pathname=servicePath(serviceId,lang);url.searchParams.delete('lang');if(url.href!==location.href)history.replaceState({},'',url);
  applySeo(lang,{serviceId,logo,projectImage:casePhotos[service.photos[0]].image});
  const scroll=()=>document.documentElement.classList.toggle('scrolled',window.scrollY>90);scroll();addEventListener('scroll',scroll,{passive:true});return()=>removeEventListener('scroll',scroll);
 },[lang,serviceId]);
 return <div className={`service-site global-mars service-detail lang-${lang}`}>
  <a className="skip-link" href="#service-content">{t.skip}</a>
  <header className="header"><a href={localePath(lang)} aria-label={t.home}><span className="brand-image"><img src={logo} alt={t.logoAlt}/></span></a><nav aria-label={t.menu}><a href={localePath(lang)+'#services'}>{t.nav[0]}</a><a href={localePath(lang)+'#projects'}>{t.nav[1]}</a><a href={localePath(lang)+'#cases'}>{t.nav[2]}</a><a href="#contact">{t.contactUs}</a></nav><div className="language-switch" role="group" aria-label={t.language}>{languages.map(l=><a key={l.id} href={servicePath(serviceId,l.id)} hrefLang={l.html} className={lang===l.id?'active':''} aria-current={lang===l.id?'page':undefined}>{l.label}</a>)}</div></header>
  <main>
   <section className="service-detail-hero"><div className="service-detail-copy"><a className="service-back" href={localePath(lang)}><ArrowLeft size={14}/>{t.backHome}</a><p className="eyebrow">GLOBAL MARS / RAWANG, SELANGOR</p><h1>{content.h1}</h1><p className="service-detail-intro">{content.intro}</p><a href={wa} target="_blank" rel="noreferrer" className="solid-button">{t.start}<WhatsAppIcon size={19}/></a></div><div className="service-detail-cover"><WaterImage src={covers[service.sector]} alt={t.sectorNames[service.sector]+' — '+t.sectorAlt} loading="eager" fetchPriority="high"/><span>{t.serviceImageNote}</span></div></section>
   <section className="service-body" id="service-content"><div><span className="eyebrow">GLOBAL MARS / {t.sectorNames[service.sector]}</span><h2>{content.heading}</h2><p>{content.body}</p></div><div className="service-checklist"><h2>{t.serviceScope}</h2><ul>{content.items.map(item=><li key={item}>{item}</li>)}</ul><h2>{t.servicePrepare}</h2><ul>{content.prepare.map(item=><li key={item}>{item}</li>)}</ul></div></section>
   <section className="service-related"><div className="section-meta"><span className="eyebrow">{t.serviceExamples}</span><a href={localePath(lang)+'#cases'} className="text-link">{t.nav[2]}<ArrowUpRight size={16}/></a></div><div className="service-related-grid">{service.photos.map(id=><figure key={id}><img src={casePhotos[id].image} alt={`${t.caseTitles[id]} — ${t.original}`} loading="lazy"/><figcaption>{t.caseTitles[id]}</figcaption></figure>)}</div><p>{t.serviceExamplesNote}</p></section>
   <section className="service-detail-faq"><h2>{t.serviceFaq}</h2>{content.faq.map(item=><details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</section>
   <section className="contact-section" id="contact"><div className="section-meta"><span className="eyebrow">{t.contactLabel}</span><span>RAWANG / SELANGOR</span></div><h2>{t.contactUs}</h2><div className="service-contact-grid"><a href={'tel:'+company.tel}><Phone size={20}/><span>{t.call}<strong>{company.phone}</strong></span></a><a href={'mailto:'+company.email}><Mail size={20}/><span>{t.email}<strong>{company.email}</strong></span></a><a href={company.maps} target="_blank" rel="noreferrer"><MapPin size={20}/><span>{t.map}<strong>{company.address}</strong></span></a></div><a className="solid-button service-wa" href={wa} target="_blank" rel="noreferrer">{t.whatsapp}<WhatsAppIcon size={20}/></a></section>
  </main>
  <footer><div className="footer-top"><a href={localePath(lang)}><span className="brand-image"><img src={logo} alt={t.logoAlt}/></span></a><p>{t.intro}</p><div><a href={localePath(lang)}>{t.backHome} ↗</a><a href={localePath(lang)+'#projects'}>{t.nav[1]} ↗</a><a href={localePath(lang)+'#cases'}>{t.nav[2]} ↗</a></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {t.copyright}</span><a href={company.source} target="_blank" rel="noreferrer">{t.originalSite} ↗</a></div></footer>
  <a className="whatsapp-float" href={wa} target="_blank" rel="noreferrer" aria-label={t.whatsapp}><WhatsAppIcon size={26}/><span>WhatsApp</span><i/></a>
 </div>
}
