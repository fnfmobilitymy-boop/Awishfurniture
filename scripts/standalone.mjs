import {readFile,writeFile,mkdir} from 'node:fs/promises';
let html=await readFile('dist/index.html','utf8');
const css=[...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/g)];
for(const [tag,path] of css){const content=await readFile('dist/'+path.replace(/^\.\//,''),'utf8');html=html.replace(tag,()=>`<style>${content}</style>`);}
const js=[...html.matchAll(/<script[^>]+src="([^"]+)"[^>]*><\/script>/g)];
for(const [tag,path] of js){const code=await readFile('dist/'+path.replace(/^\.\//,''),'utf8');html=html.replace(tag,()=>`<script type="module">${code.replace(/<\/script/gi,'<\\/script')}</script>`)}
await mkdir('demo',{recursive:true});await writeFile('demo/kilang-repair-sofa-demo.html',html);await writeFile('dist/kilang-repair-sofa-demo.html',html);console.log('Saved standalone Demo: demo/kilang-repair-sofa-demo.html');
