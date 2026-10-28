import {SITE_PATH} from '../src/seo.js';
import {chromium} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve('dist');
const server=createServer(async(req,res)=>{try{const raw=new URL(req.url,'http://localhost').pathname;const path=raw.startsWith(SITE_PATH)?'/'+raw.slice(SITE_PATH.length):raw;const file=resolve(root,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(root+'/')){res.writeHead(403).end();return}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.woff':'font/woff'})[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1,reducedMotion:'reduce'});
 await page.addInitScript(()=>localStorage.setItem('global-mars-language','en'));
 await page.goto(`http://127.0.0.1:${server.address().port}${SITE_PATH}`,{waitUntil:'networkidle'});
 await page.locator('.intro').waitFor({state:'hidden'});await page.locator('.assembly-stage.is-ready').waitFor();await page.evaluate(()=>document.fonts.ready);
 // Export the actual English homepage as a clean, non-interactive share card.
 await page.addStyleTag({content:`.header nav,.header-right,.hero-foot,.whatsapp-float,.page-progress,.hero-topline,.hero-bottom-copy .circle-link,.assembly-controls,.assembly-caption,.journey-outcome{display:none!important}.header{border:0!important;height:110px!important;padding:0 5%!important}.brand-image{width:180px!important;height:72px!important}.hero{height:630px!important;min-height:630px!important;max-height:630px!important}.hero-copy{top:29%!important;left:5%!important;width:48%!important}.hero-title{font-size:76px!important;line-height:1.1!important;margin:20px 0 24px!important}.hero-copy>.eyebrow{font-size:11px!important}.hero-bottom-copy{margin-top:20px!important}.hero-bottom-copy p{font-size:14px!important;letter-spacing:.03em!important}`});
 await mkdir('public',{recursive:true});await page.locator('.hero').screenshot({path:'public/social-preview-en.jpg',type:'jpeg',quality:90,animations:'disabled'});
 console.log('Saved English share image: public/social-preview-en.jpg (1200 × 630)');
}finally{await browser?.close();server.close()}
