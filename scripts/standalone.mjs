import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {extname} from 'node:path';
import {SITE_PATH} from '../src/seo.js';
const localFile=path=>'dist/'+path.replace(SITE_PATH,'').replace(/^\.\//,'');
const prefix=SITE_PATH.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'assets/';
const mime={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2','.mp4':'video/mp4','.webm':'video/webm'};
const embeds=[];
for(const name of await readdir('dist/assets')){const type=mime[extname(name)];if(type)embeds.push([name,`data:${type};base64,${(await readFile('dist/assets/'+name)).toString('base64')}`])}
function inlineAssets(content){for(const [name,url] of embeds){const safe=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');content=content.replace(new RegExp('(["\x27`(])(?:'+prefix+'|\\./)?'+safe+'(?=["\x27`)])','g'),(_,prefix)=>prefix+url)}return content}
const favicon=await readFile('dist/favicon.svg');
let html=await readFile('dist/index.html','utf8');
html=html.replace(new RegExp('href="(?:'+SITE_PATH+'|\\./)favicon\\.svg"'),()=>`href="data:image/svg+xml;base64,${(Buffer.from(favicon)).toString('base64')}"`);
for(const [tag,path] of [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/g)]){const content=inlineAssets(await readFile(localFile(path),'utf8'));html=html.replace(tag,()=>`<style>${content}</style>`)}
for(const [tag,path] of [...html.matchAll(/<script[^>]+src="([^"]+)"[^>]*><\/script>/g)]){const content=inlineAssets(await readFile(localFile(path),'utf8'));html=html.replace(tag,()=>`<script type="module">${content.replace(/<\/script/gi,'<\\/script')}</script>`)}
html=inlineAssets(html);
await mkdir('demo',{recursive:true});await writeFile('demo/global-mars-demo.html',html);await writeFile('dist/global-mars-demo.html',html);console.log('Saved standalone Demo: demo/global-mars-demo.html');
