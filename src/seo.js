import {company} from './content.js';
import {translations} from './i18n.js';
import {SERVICES,serviceById} from './services.js';

export const SITE_URL='https://fnfmobilitymy-boop.github.io/Awishfurniture/';
export const SITE_PATH=new URL(SITE_URL).pathname;
export const LOCALES=['en','ms','zh'];
export const SEO={
 en:{title:'GLOBAL MARS | Sofa & Furniture Repair in Rawang',description:'Sofa repair and furniture restoration in Rawang, Selangor. Home, hotel, restaurant and office furniture projects. Contact GLOBAL MARS: 010 200 7153.',html:'en',hreflang:'en-MY'},
 ms:{title:'Baiki Sofa & Pemulihan Perabot Rawang | GLOBAL MARS',description:'Baiki sofa dan pulih perabot di Rawang, Selangor bersama GLOBAL MARS. Projek rumah, hotel, restoran dan pejabat. Hubungi 010 200 7153.',html:'ms',hreflang:'ms-MY'},
 zh:{title:'GLOBAL MARS 家具修复 | Rawang 住宅与商业项目',description:'GLOBAL MARS 位于 Selangor Rawang，提供沙发维修与家具修复，承接住宅、酒店、餐厅和办公楼家具项目。查看修复前后作品，致电 010 200 7153 或通过 WhatsApp 咨询。',html:'zh-Hans',hreflang:'zh-Hans-MY'},
};
export const localeUrl=lang=>new URL(lang==='en'?'':lang+'/',SITE_URL).href;
export const localePath=lang=>new URL(localeUrl(lang)).pathname;
export const serviceUrl=(id,lang='en')=>new URL('services/'+serviceById(id).slug+'/',localeUrl(lang)).href;
export const servicePath=(id,lang='en')=>new URL(serviceUrl(id,lang)).pathname;
export function serviceAtLocation(location){const parts=location.pathname.slice(SITE_PATH.length).split('/').filter(Boolean);if(['ms','zh'].includes(parts[0]))parts.shift();return parts[0]==='services'?SERVICES.find(service=>service.slug===parts[1])?.id||null:null}
export const pageUrl=(lang,id)=>id?serviceUrl(id,lang):localeUrl(lang);
export const pageSeo=(lang,id)=>id?{...SEO[lang],...serviceById(id).content[lang]}:SEO[lang];
export function languageAtLocation(location){
 const requested=new URLSearchParams(location.search||'').get('lang');
 if(Object.hasOwn(SEO,requested))return requested;
 const path=location.pathname.replace(/index\.html$/,'').replace(/\/?$/,'/');
 return ['ms','zh'].find(lang=>path.startsWith(localePath(lang)))||'en';
}
export function publicAsset(value){
 if(!value||value.startsWith('data:'))return SITE_URL+'social-preview-en.jpg';
 const url=new URL(value,SITE_URL);
 return new URL(url.pathname,new URL(SITE_URL).origin).href;
}
export function structuredData(lang,{logo,projectImage,serviceId}={}){
 const t=translations[lang],url=pageUrl(lang,serviceId),info=pageSeo(lang,serviceId),businessId=SITE_URL+'#business';
 return {'@context':'https://schema.org','@graph':[
  {'@type':'LocalBusiness','@id':businessId,name:company.name,url:SITE_URL,description:SEO.en.description,telephone:company.tel,email:company.email,logo:publicAsset(logo),image:publicAsset(projectImage),address:{'@type':'PostalAddress',streetAddress:'No 18, Jalan BJ6, Taman Perindustrian Belmas Johan',addressLocality:'Rawang',addressRegion:'Selangor',postalCode:'48000',addressCountry:'MY'},hasMap:company.maps,hasOfferCatalog:{'@type':'OfferCatalog',name:t.nav[1],itemListElement:t.sectorNames.map((name,i)=>({'@type':'Offer',itemOffered:{'@type':'Service',name,url:serviceUrl(SERVICES[i].id,lang),description:t.sectorTexts[i],provider:{'@id':businessId}}}))}},
  {'@type':'WebSite','@id':SITE_URL+'#website',url:SITE_URL,name:company.name,publisher:{'@id':businessId},inLanguage:['en-MY','ms-MY','zh-Hans-MY']},
  {'@type':'WebPage','@id':url+'#webpage',url,name:info.title,description:info.description,inLanguage:SEO[lang].hreflang,isPartOf:{'@id':SITE_URL+'#website'},about:{'@id':serviceId?url+'#service':businessId},primaryImageOfPage:{'@type':'ImageObject',url:SITE_URL+'social-preview-en.jpg',width:1200,height:630}},
  ...(serviceId?[{'@type':'Service','@id':url+'#service',name:info.h1,description:info.description,url,provider:{'@id':businessId},mainEntityOfPage:{'@id':url+'#webpage'}}]:[])
 ]};
}
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function seoTags(lang,assets={}){
 const info=pageSeo(lang,assets.serviceId),url=pageUrl(lang,assets.serviceId),shareTitle=assets.serviceId?pageSeo('en',assets.serviceId).title:'GLOBAL MARS — Furniture Restoration',shareDescription=assets.serviceId?pageSeo('en',assets.serviceId).description:'Furniture restoration for homes, hotels, restaurants and offices. Explore our before-and-after projects in Rawang, Selangor.',image=SITE_URL+'social-preview-en.jpg';
 const meta=(type,key,value)=>`<meta ${type}="${key}" content="${escape(value)}" />`;
 return [
  `<title>${escape(info.title)}</title>`,meta('name','description',info.description),meta('name','robots','index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'),
  `<link rel="canonical" href="${url}" />`,
  ...LOCALES.map(locale=>`<link rel="alternate" hreflang="${SEO[locale].hreflang}" href="${pageUrl(locale,assets.serviceId)}" />`),`<link rel="alternate" hreflang="x-default" href="${pageUrl('en',assets.serviceId)}" />`,
  meta('property','og:type','website'),meta('property','og:site_name',company.name),meta('property','og:locale','en_MY'),meta('property','og:locale:alternate','ms_MY'),meta('property','og:locale:alternate','zh_CN'),meta('property','og:title',shareTitle),meta('property','og:description',shareDescription),meta('property','og:url',url),meta('property','og:image',image),meta('property','og:image:secure_url',image),meta('property','og:image:type','image/jpeg'),meta('property','og:image:width','1200'),meta('property','og:image:height','630'),meta('property','og:image:alt','GLOBAL MARS furniture restoration, with our company logo and a warm sofa interior.'),
  meta('name','twitter:card','summary_large_image'),meta('name','twitter:title',shareTitle),meta('name','twitter:description',shareDescription),meta('name','twitter:image',image),meta('name','twitter:image:alt','GLOBAL MARS — a new beginning for the furniture worth keeping.'),
  `<script type="application/ld+json" id="business-schema">${JSON.stringify(structuredData(lang,assets)).replaceAll('<','\\u003c')}</script>`
 ].join('\n');
}
export function applySeo(lang,assets={}){
 const info=pageSeo(lang,assets.serviceId),url=pageUrl(lang,assets.serviceId);document.documentElement.lang=SEO[lang].html;document.title=info.title;
 const meta=(attribute,key,value)=>{let el=document.head.querySelector(`meta[${attribute}="${key}"]`);if(!el){el=document.createElement('meta');el.setAttribute(attribute,key);document.head.append(el)}el.content=value};
 meta('name','description',info.description);meta('name','robots','index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');meta('property','og:url',url);
 let canonical=document.head.querySelector('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical)}canonical.href=url;
 for(const locale of [...LOCALES,'x-default']){const tag=locale==='x-default'?locale:SEO[locale].hreflang;let el=document.head.querySelector(`link[rel="alternate"][hreflang="${tag}"]`);if(!el){el=document.createElement('link');el.rel='alternate';el.hreflang=tag;document.head.append(el)}el.href=pageUrl(locale==='x-default'?'en':locale,assets.serviceId)}
 let json=document.getElementById('business-schema');if(!json){json=document.createElement('script');json.type='application/ld+json';json.id='business-schema';document.head.append(json)}json.textContent=JSON.stringify(structuredData(lang,assets));
}
