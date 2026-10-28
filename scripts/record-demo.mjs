import {SITE_PATH} from '../src/seo.js';
import {chromium} from '@playwright/test';
import {mkdir,mkdtemp,writeFile,readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {resolve,extname} from 'node:path';
import {spawnSync} from 'node:child_process';
const folder=await mkdtemp('/tmp/kilang-walkthrough-');
const directory=resolve('dist');
const server=createServer(async(req,res)=>{try{const raw=new URL(req.url,'http://localhost').pathname;const name=raw.startsWith(SITE_PATH)?'/'+raw.slice(SITE_PATH.length):raw;const file=resolve(directory,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(directory+'/')){res.writeHead(403).end();return}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404).end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try{
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
 await page.goto(`http://127.0.0.1:${server.address().port}${SITE_PATH}`,{waitUntil:'networkidle'});await page.locator('.intro').waitFor({state:'hidden'});await page.waitForTimeout(1500);
 const cdp=await page.context().newCDPSession(page),frames=[],writes=[];
 cdp.on('Page.screencastFrame',frame=>{const name=folder+'/'+String(frames.length).padStart(6,'0')+'.jpg';frames.push({name,time:frame.metadata.timestamp});writes.push(writeFile(name,Buffer.from(frame.data,'base64')));cdp.send('Page.screencastFrameAck',{sessionId:frame.sessionId}).catch(()=>{})});
 await cdp.send('Page.startScreencast',{format:'jpeg',quality:78,maxWidth:1280,maxHeight:800,everyNthFrame:2});
 await page.waitForTimeout(1600);
 await page.evaluate(async()=>{const target=document.querySelector('#services').offsetTop;await new Promise(resolve=>{const start=performance.now(),duration=13000;function tick(t){const p=Math.min((t-start)/duration,1);window.scrollTo({top:target*p,behavior:'instant'});if(p<1)requestAnimationFrame(tick);else resolve()}requestAnimationFrame(tick)})});
 await page.waitForTimeout(1500);
 await page.locator('#cases').scrollIntoViewIfNeeded();await page.waitForTimeout(1300);
 await page.locator('.more-cases .case-photo').first().click();await page.waitForTimeout(1600);await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Let’s talk furniture',exact:true}).click();await page.waitForTimeout(1800);
 await cdp.send('Page.stopScreencast');await Promise.all(writes);
 let concat='';for(let i=0;i<frames.length;i++){concat+=`file '${frames[i].name}'\n`;if(i<frames.length-1)concat+=`duration ${Math.min(.5,Math.max(1/60,frames[i+1].time-frames[i].time))}\n`}
 await writeFile(folder+'/frames.txt',concat);await mkdir('demo',{recursive:true});
 const result=spawnSync('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',folder+'/frames.txt','-vf','fps=24','-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart','demo/global-mars-walkthrough.mp4'],{encoding:'utf8'});
 if(result.status!==0)throw Error(result.stderr);console.log('Saved walkthrough:',frames.length,'frames, demo/global-mars-walkthrough.mp4');
}finally{await browser?.close();server.close()}
