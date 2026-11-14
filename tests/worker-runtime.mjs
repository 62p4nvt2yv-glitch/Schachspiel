// Exercises the exact built Worker and its real D1 bindings, without a browser.
import assert from 'node:assert/strict';
import {readdirSync,readFileSync} from 'node:fs';
import {Miniflare} from 'miniflare';
import {Chess} from 'chess.js';
const modules=readdirSync('dist/server',{recursive:true}).filter(f=>f.endsWith('.js')).map(f=>({type:'ESModule',path:'dist/server/'+f}));
modules.sort((a,b)=>a.path==='dist/server/index.js'?-1:b.path==='dist/server/index.js'?1:0);
const mf=new Miniflare({modules,modulesRoot:'dist/server',compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],assets:{directory:'dist/client',routerConfig:{has_user_worker:true}},cf:false});
try{
 const db=await mf.getD1Database('DB');await db.exec(readFileSync('drizzle/0000_sudden_oracle.sql','utf8').replace(/\n/g,' '));
 const page=await mf.dispatchFetch('https://pink.test/');assert.equal(page.status,200);const html=await page.text();assert.match(html,/Pink Chess/);assert.match(html,/manifest.webmanifest/);assert.match(html,/pink-chess-180.png/);assert.match(html,/Hi, ich bin Ben/);
 for(const path of ['/manifest.webmanifest','/icons/pink-chess-192.png','/icons/pink-chess-512.png','/icons/pink-chess-180.png','/sw.js','/offline.html']){const r=await mf.dispatchFetch('https://pink.test'+path);assert.equal(r.status,200,path);if(path.includes('manifest')){const m=await r.json();assert.equal(m.id,'/');assert.equal(m.display,'standalone');}else await r.arrayBuffer();}
 async function post(body,token){const r=await mf.dispatchFetch('https://pink.test/api/rooms',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});const d=await r.json();assert.equal(r.status,200,JSON.stringify(d));return d;}
 const host=await post({action:'create'});const guest=await post({action:'join',id:host.id,invite:host.invite});assert.equal(guest.color,'b');
 const white=await post({action:'move',id:host.id,version:guest.version,from:'e2',to:'e4'},host.token);
 const black=await post({action:'move',id:host.id,version:white.version,from:'e7',to:'e5'},guest.token);
 const status=await mf.dispatchFetch('https://pink.test/api/rooms?id='+host.id,{headers:{Authorization:'Bearer '+host.token}});const synchronized=await status.json();assert.equal(synchronized.pgn,black.pgn);
 const bot=await mf.dispatchFetch('https://pink.test/api/bot',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pgn:black.pgn,level:'normal'})});assert.equal(bot.status,200);const response=await bot.json();const c=new Chess();c.loadPgn(black.pgn);assert.ok(c.moves().includes(response.move));
 console.log('BESTANDEN: gebauter Worker, HTML, App-Metadaten, Manifest, alle Installationsdateien, echte D1-Einladung, Zugwechsel, Synchronisierung und Ben.');
}finally{await mf.dispose()}
