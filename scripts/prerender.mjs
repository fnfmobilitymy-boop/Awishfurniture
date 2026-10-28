import {chromium} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve,dirname,extname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {SITE_URL,SITE_PATH,LOCALES,SEO,localeUrl,serviceUrl,seoTags,publicAsset} from '../src/seo.js';
import {SERVICES} from '../src/services.js';
const root=resolve('dist'),template=await readFile(root+'/index.html','utf8');
const routes=LOCALES.flatMap(lang=>[{lang,id:null,url:localeUrl(lang)},...SERVICES.map(service=>({lang,id:service.id,url:serviceUrl(service.id,lang)}))]);
const known=new Set(routes.map(route=>new URL(route.url).pathname));
const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(!pathname.startsWith(SITE_PATH)){res.writeHead(404).end();return}const file=resolve(root,pathname.slice(SITE_PATH.length));if(file!==root&&!file.startsWith(root+'/')){res.writeHead(403).end();return}if(known.has(pathname)){res.setHeader('Content-Type','text/html');res.end(template);return}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.woff':'font/woff'})[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
let browser;
try{
 const executablePath=process.env.CHROMIUM_BIN||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
 browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{}),args:['--no-sandbox','--enable-unsafe-swiftshader']});
 const output=[];
 for(const route of routes){
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const errors=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('response',response=>{if(response.status()>=400)errors.push('HTTP '+response.status()+': '+response.url())});
  await page.goto(origin+new URL(route.url).pathname,{waitUntil:'networkidle'});await page.locator('main h1').waitFor();await page.locator('.intro').waitFor({state:'hidden'});await page.evaluate(()=>document.fonts.ready);
  if(await page.locator('html').getAttribute('lang')!==SEO[route.lang].html)throw Error('Wrong rendered language: '+route.url);
  if(errors.length)throw Error(route.url+'\n'+errors.join('\n'));
  const assets=await page.evaluate(()=>({logo:document.querySelector('.brand-image img')?.src,projectImage:document.querySelector('.case-photo img,.service-related img')?.src}));assets.serviceId=route.id;
  const images=await page.locator('.case-photo img,.service-related img').evaluateAll(nodes=>nodes.map(node=>node.src));
  const body=await page.locator('#root').evaluate(el=>{const copy=el.cloneNode(true);copy.querySelectorAll('canvas').forEach(node=>node.remove());return copy.innerHTML});
  let head=template.match(/<head[^>]*>([\s\S]*?)<\/head>/i)[1];
  head=head.replace(/<title>[\s\S]*?<\/title>/gi,'').replace(/<meta\b[^>]*(?:name="(?:description|robots|twitter:[^"]*)"|property="og:[^"]*")[^>]*>/gi,'').replace(/<link\b[^>]*rel="(?:canonical|alternate)"[^>]*>/gi,'').replace(/<script\b[^>]*id="business-schema"[^>]*>[\s\S]*?<\/script>/gi,'');
  const html='<!doctype html>\n<html lang="'+SEO[route.lang].html+'" class="no-js"><head>'+seoTags(route.lang,assets)+'\n'+head+'</head><body><div id="root" data-prerendered="true">'+body+'</div></body></html>\n';
  output.push({...route,html,images:[...new Set(images.map(publicAsset))]});await page.close();console.log('Prerendered:',new URL(route.url).pathname);
 }
 for(const route of output){const path=new URL(route.url).pathname.slice(SITE_PATH.length);const destination=resolve(root,path,'index.html');await mkdir(dirname(destination),{recursive:true});await writeFile(destination,route.html.replace(/[ \t]+$/gm,''))}
 let lastmod='';try{const stamp=execFileSync('git',['log','-1','--format=%cs'],{encoding:'utf8'}).trim();if(/^\d{4}-\d{2}-\d{2}$/.test(stamp))lastmod='<lastmod>'+stamp+'</lastmod>'}catch{}
 const entries=output.map(route=>'<url><loc>'+escape(route.url)+'</loc>'+lastmod+LOCALES.map(lang=>'<xhtml:link rel="alternate" hreflang="'+SEO[lang].hreflang+'" href="'+escape(route.id?serviceUrl(route.id,lang):localeUrl(lang))+'"/>').join('')+'<xhtml:link rel="alternate" hreflang="x-default" href="'+escape(route.id?serviceUrl(route.id,'en'):SITE_URL)+'"/>'+route.images.map(url=>'<image:image><image:loc>'+escape(url)+'</image:loc></image:image>').join('')+'</url>');
 await writeFile(root+'/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'+entries.join('\n')+'</urlset>\n');
 await writeFile(root+'/robots.txt','# Project-site copy. Only robots.txt at the host root controls crawling.\nUser-agent: *\nAllow: /\n\nSitemap: '+SITE_URL+'sitemap.xml\n');
 await writeFile(root+'/404.html','<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="robots" content="noindex,follow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | GLOBAL MARS</title></head><body style="font-family:Arial,sans-serif;background:#eee9e0;color:#232922;padding:10%;line-height:1.8"><h1>Page not found</h1><p>This address does not match a GLOBAL MARS page.</p><p><a href="'+SITE_PATH+'">English</a> · <a href="'+SITE_PATH+'ms/">Bahasa Melayu</a> · <a href="'+SITE_PATH+'zh/">中文</a></p></body></html>');
 console.log('Static SEO pages:',output.length,'— sitemap and structured data generated.');
}finally{await browser?.close();server.close()}
