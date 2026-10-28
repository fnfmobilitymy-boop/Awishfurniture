import {cp,mkdir,readdir,rm,writeFile} from 'node:fs/promises';
// docs/ contains generated deployment output, never hand-edited source.
await mkdir('docs',{recursive:true});
for(const item of await readdir('docs'))await rm('docs/'+item,{recursive:true,force:true});
await cp('dist/index.html','docs/index.html');
await cp('dist/assets','docs/assets',{recursive:true});
for(const entry of await readdir('dist',{withFileTypes:true})){if(entry.name==='assets'||entry.name==='index.html'||entry.name.endsWith('-demo.html'))continue;await cp('dist/'+entry.name,'docs/'+entry.name,{recursive:true});}
await writeFile('docs/.nojekyll','');
await writeFile('docs/README.md','# Generated GitHub Pages site\n\nRebuild from the repository root with `npm ci && npm run pages`. Configure GitHub Pages to deploy from the `main` branch, `/docs` folder. Do not edit these generated files directly.\n');
console.log('GitHub Pages static site prepared in docs/');
