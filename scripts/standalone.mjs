import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {extname} from 'node:path';
const mime={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2','.mp4':'video/mp4','.webm':'video/webm'};
const embeds=[];
for(const name of await readdir('dist/assets')){const type=mime[extname(name)];if(type)embeds.push([name,`data:${type};base64,${(await readFile('dist/assets/'+name)).toString('base64')}`])}
function inlineAssets(content){for(const [name,url] of embeds){const safe=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');content=content.replace(new RegExp('(["\x27`(])(?:\\./)?'+safe+'(?=["\x27`)])','g'),(_,prefix)=>prefix+url)}return content}
let html=await readFile('dist/index.html','utf8');
for(const [tag,path] of [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/g)]){const content=inlineAssets(await readFile('dist/'+path.replace(/^\.\//,''),'utf8'));html=html.replace(tag,()=>`<style>${content}</style>`)}
for(const [tag,path] of [...html.matchAll(/<script[^>]+src="([^"]+)"[^>]*><\/script>/g)]){const content=inlineAssets(await readFile('dist/'+path.replace(/^\.\//,''),'utf8'));html=html.replace(tag,()=>`<script type="module">${content.replace(/<\/script/gi,'<\\/script')}</script>`)}
await mkdir('demo',{recursive:true});await writeFile('demo/global-mars-demo.html',html);await writeFile('dist/global-mars-demo.html',html);console.log('Saved standalone Demo: demo/global-mars-demo.html');
