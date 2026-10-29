import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,readdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createHash} from 'node:crypto';
import {translations,languages} from '../src/i18n.js';
function shape(value){if(Array.isArray(value))return value.map(shape);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,shape(value[k])]));return typeof value}
for(const lang of ['ms','en'])assert.deepEqual(shape(translations[lang]),shape(translations.zh),`${lang} translation coverage`);
const sourceManifest=JSON.parse(await readFile('source-materials/global-mars-selected-photos.json','utf8'));
assert.equal(sourceManifest.length,12);assert.equal(new Set(sourceManifest.map(row=>row.sha256)).size,12);
for(const row of sourceManifest){const raw=await readFile(row.projectFile);assert.equal(createHash('sha256').update(raw).digest('hex'),row.sha256,'Original client photo must not be retouched')}
console.log('PASS complete trilingual key coverage and 12 unique original before/after photos preserved byte-for-byte');
const directory=resolve('dist'),prefix='/Awishfurniture';
const server=createServer(async(req,res)=>{try{let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(!path.startsWith(prefix+'/')){res.writeHead(404).end();return}path=path.slice(prefix.length);const file=resolve(directory,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(directory+'/')){res.writeHead(403).end();return}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2','.woff':'font/woff'})[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}${prefix}/`;
const shareHtml=await (await fetch(base)).text();
assert.match(shareHtml,/<html lang="en">/);
for(const tag of ['og:title','og:description','og:image','twitter:card','twitter:image'])assert.ok(shareHtml.includes('"'+tag+'"'),tag+' must be in static HTML');
const shareTitle=shareHtml.match(/property="og:title" content="([^"]+)"/)[1],shareDescription=shareHtml.match(/property="og:description" content="([^"]+)"/)[1];
assert.ok(!/[\u3400-\u9fff]/.test(shareTitle+shareDescription));
assert.ok(shareHtml.includes('content="summary_large_image"'));
const shareUrl=shareHtml.match(/property="og:image" content="([^"]+)"/)[1];assert.equal(shareUrl,'https://fnfmobilitymy-boop.github.io/Awishfurniture/social-preview-en.jpg');
const shareResponse=await fetch(base+'social-preview-en.jpg');assert.equal(shareResponse.status,200);assert.equal(shareResponse.headers.get('content-type'),'image/jpeg');const shareBytes=new Uint8Array(await shareResponse.arrayBuffer());assert.equal(shareBytes[0],0xff);assert.equal(shareBytes[1],0xd8);
console.log('PASS English static sharing metadata, large-image cards and publicly served JPEG preview');

let browser;
try{
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});const errors=[];
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status()+': '+r.url())});
 await page.goto(base,{waitUntil:'networkidle'});await page.locator('.intro').waitFor({state:'hidden'});await page.waitForTimeout(1800);
 assert.equal(await page.locator('html').getAttribute('lang'),'en');assert.ok((await page.locator('h1').textContent()).includes(translations.en.heroTitle[0]));
 await page.locator('.scroll-sofa.is-ready').waitFor();
 const first=await page.locator('.scroll-sofa canvas').screenshot();
 await page.evaluate(()=>{const el=document.querySelector('.sofa-scroll-journey');window.scrollTo({top:el.offsetTop+(el.offsetHeight-innerHeight)*.72,behavior:'instant'})});
 await page.waitForFunction(()=>Number(document.querySelector('.scroll-sofa')?.dataset.frame)>70);await page.waitForTimeout(300);
 const changed=await page.locator('.scroll-sofa canvas').screenshot();assert.notDeepEqual(first,changed,'Scrolling must advance the supplied sofa footage');
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForFunction(()=>Number(document.querySelector('.scroll-sofa')?.dataset.frame)<3);
 await page.waitForTimeout(200);const paused=await page.locator('.scroll-sofa').getAttribute('data-frame');await page.waitForTimeout(500);assert.equal(await page.locator('.scroll-sofa').getAttribute('data-frame'),paused,'Sequence must stop when scrolling stops');
 const water=page.locator('.sector-card .water-image').first();await water.scrollIntoViewIfNeeded();await water.locator('.water-canvas.ready').waitFor();const before=await water.locator('canvas').screenshot();const box=await water.boundingBox();await page.mouse.move(box.x+box.width*.4,box.y+box.height*.4);await page.mouse.move(box.x+box.width*.6,box.y+box.height*.6,{steps:8});await page.waitForTimeout(180);const after=await water.locator('canvas').screenshot();assert.notDeepEqual(before,after,'Pointer input must produce visible refraction');await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
 console.log('PASS supplied sofa frames advance, reverse and pause with scroll');
 await page.screenshot({path:'/tmp/global-mars-desktop-default-en.png'});
 assert.equal(await page.locator('header .brand-name').textContent(),'kenny');assert.equal(await page.locator('.brand-image img').count(),0);
 const photos=await page.locator('main img').evaluateAll(images=>images.map(image=>image.src));assert.equal(photos.length,new Set(photos).size,'No repeated photographic assets across main sections');
 assert.equal(await page.locator('.sector-card').count(),4);assert.equal(await page.locator('.real-cases [data-case-id]').count(),12);
 assert.equal(await page.locator('a[href^="tel:"],a[href^="mailto:"],a[href*="wa.me"],a[href*="google.com/maps"],.map-card,.whatsapp-float').count(),0);
 assert.ok(!(await page.locator('body').innerText()).includes('GLOBAL MARS'));
 for(const language of ['en','ms','zh']){
  const l=languages.find(item=>item.id===language),t=translations[language];await page.locator('.language-switch').getByRole('button',{name:l.label,exact:true}).click();assert.equal(await page.locator('html').getAttribute('lang'),l.html);assert.ok((await page.locator('h1').textContent()).includes(t.heroTitle[0]));assert.deepEqual(await page.locator('.header nav a').allTextContents(),t.nav.map((v,i)=>v+(i===0?' ↗':'')));
 }
 console.log('PASS desktop brand, contact links, 4 business sectors, unique photographs, all languages and actual pointer-driven water rendering');
 await page.locator('.language-switch').getByRole('button',{name:'EN',exact:true}).click();const en=translations.en;
 await page.evaluate(()=>document.fonts.ready);assert.match(await page.locator('h1').evaluate(el=>getComputedStyle(el).fontFamily),/Anton/);assert.equal(await page.locator('h1 em').evaluate(el=>getComputedStyle(el).fontStyle),'normal');assert.equal(await page.locator('h1').evaluate(el=>getComputedStyle(el).textTransform),'uppercase');await page.screenshot({path:'/tmp/global-mars-desktop-anton.png'});
 await page.locator('#cases .filters').getByRole('button',{name:/Armchairs/}).click();assert.equal(await page.locator('.real-cases [data-case-id]').count(),2);
 await page.getByRole('button',{name:en.openCase+': '+en.caseTitles[8],exact:true}).click();await page.getByRole('dialog',{name:en.openCase,exact:true}).waitFor();assert.ok(await page.locator('.original-image img').evaluate(el=>el.complete&&el.naturalWidth>0));
 await page.getByRole('button',{name:en.next,exact:true}).click();assert.equal(await page.locator('.lightbox-copy h3').textContent(),en.caseTitles[9]);await page.keyboard.press('Escape');
 await page.locator('#cases .filters').getByRole('button',{name:/All/}).click();await page.evaluate(()=>{const el=document.querySelector('.case-story');window.scrollTo({top:el.offsetTop+(el.offsetHeight-innerHeight)*.75,behavior:'instant'})});await page.waitForTimeout(1400);
 const spread=await page.locator('.fan-card').evaluateAll(cards=>cards.map(card=>getComputedStyle(card).transform));assert.ok(new Set(spread).size>1,'Case cards must animate to different positions');await page.screenshot({path:'/tmp/global-mars-cases.png'});
 await page.locator('#services .filters').getByRole('button',{name:/Surface/}).click();assert.equal(await page.locator('.topic-card').count(),1);await page.getByRole('button',{name:en.prepare,exact:true}).click();await page.getByRole('button',{name:en.describeIssue,exact:true}).click();assert.equal(await page.locator('select[name="topic"]').inputValue(),'topic0');
 await page.getByRole('textbox',{name:en.name,exact:true}).fill('Demo User');await page.getByRole('textbox',{name:en.phone,exact:true}).fill('0123456789');await page.getByRole('textbox',{name:en.message,exact:true}).fill('Sofa upholstery needs attention.');
 await page.getByLabel(en.photoInput,{exact:true}).setInputFiles('src/assets/cases/project-01.jpg');assert.equal(await page.locator('.upload-previews img').count(),1);await page.getByRole('button',{name:en.submit,exact:true}).click();await page.getByText(en.success,{exact:true}).waitFor();
 assert.equal(await page.locator('.send-whatsapp').count(),0);await page.getByText(en.successText,{exact:true}).waitFor();
 await page.getByRole('button',{name:en.continue,exact:true}).click();await page.locator('#contact .social-links').getByRole('button',{name:/TikTok/}).click();await page.getByText(en.socialPending,{exact:true}).waitFor();await page.getByRole('button',{name:en.closeSocial,exact:true}).click();
 await page.evaluate(()=>{const el=document.querySelector('#contact');window.scrollTo({top:el.offsetTop-80,behavior:'instant'})});await page.waitForTimeout(1000);await page.screenshot({path:'/tmp/global-mars-contact.png'});
 console.log('PASS case filtering, original lightbox, keyboard navigation, scroll card spread, repair guidance, local photos, local enquiry without sending and honest social placeholders');await page.close();
 const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto(base,{waitUntil:'networkidle'});await mobile.locator('.intro').waitFor({state:'hidden'});await mobile.waitForTimeout(1200);
 for(const language of ['zh','en','ms']){const l=languages.find(item=>item.id===language);await mobile.locator('.language-switch').getByRole('button',{name:l.label,exact:true}).click();assert.equal(await mobile.locator('html').getAttribute('lang'),l.html);assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),language+' mobile overflow')}
 await mobile.waitForTimeout(1200);await mobile.screenshot({path:'/tmp/global-mars-mobile-ms.png'});const ms=translations.ms;
 await mobile.getByRole('button',{name:ms.menu,exact:true}).click();await mobile.locator('.mobile-menu').getByRole('link',{name:ms.nav[1],exact:true}).click();await mobile.waitForTimeout(800);
 await mobile.getByRole('button',{name:ms.sectorCta+': '+ms.sectorNames[1],exact:true}).click();assert.equal(await mobile.locator('select[name="topic"]').inputValue(),'sector1');await mobile.getByLabel(ms.photoInput,{exact:true}).setInputFiles('src/assets/cases/project-01.jpg');assert.equal(await mobile.locator('.upload-previews img').count(),1);await mobile.getByRole('button',{name:/Padam foto/}).click();assert.equal(await mobile.locator('.upload-previews img').count(),0);await mobile.getByRole('button',{name:ms.closeEnquiry,exact:true}).click();
 await mobile.locator('#cases .filters').getByRole('button',{name:/Kerusi makan/}).click();assert.equal(await mobile.locator('.real-cases [data-case-id]').count(),2);assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await mobile.waitForTimeout(450);await mobile.screenshot({path:'/tmp/global-mars-mobile-cases.png'});console.log('PASS mobile trilingual layout, navigation, hotel project enquiry, photo removal and dining-chair filter');await mobile.close();
 const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});reduced.on('pageerror',e=>errors.push(e.message));await reduced.goto(base,{waitUntil:'networkidle'});await reduced.locator('.intro').waitFor({state:'hidden'});assert.equal(await reduced.locator('.water-canvas').count(),0);assert.equal(await reduced.locator('.real-cases [data-case-id]').count(),12);console.log('PASS reduced-motion static photography and readable project archive');await reduced.close();
 const sharedPage=await browser.newPage({reducedMotion:'reduce'});await sharedPage.addInitScript(()=>localStorage.setItem('global-mars-language','zh'));await sharedPage.goto(base+'?lang=en',{waitUntil:'networkidle'});assert.equal(await sharedPage.locator('html').getAttribute('lang'),'en');assert.equal(await sharedPage.locator('meta[property="og:locale"]').getAttribute('content'),'en_MY');await sharedPage.close();

 const standalone=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const requests=[];standalone.on('pageerror',e=>errors.push(e.message));standalone.on('request',r=>{if(r.url().startsWith('http')&&r.resourceType()!=='document')requests.push(r.url())});await standalone.route('**/*',route=>route.request().isNavigationRequest()?route.continue():route.abort());await standalone.goto(base+'global-mars-demo.html');await standalone.locator('.intro').waitFor({state:'hidden'});assert.ok(await standalone.locator('.hero-photo img').evaluate(el=>el.complete&&el.naturalWidth>0));await standalone.locator('.language-switch').getByRole('button',{name:'BM',exact:true}).click();assert.equal(await standalone.locator('html').getAttribute('lang'),'ms');assert.deepEqual(requests,[]);assert.deepEqual(errors,[]);console.log('PASS offline bundle, trilingual switch, no external resource requests, no browser runtime errors');
}finally{await browser?.close();server.close()}
