import assert from 'node:assert/strict';
import path from 'node:path';
import {openStore} from '../server/sqlite-store.mjs';
import {createHandler} from '../server/handler.mjs';
const db=openStore(':memory:','drizzle');const handle=createHandler(db,path.resolve('dist/client'));
try{
 for(const url of ['/','/manifest.webmanifest','/icons/pink-chess-192.png','/sw.js','/healthz']){const r=await handle(new Request('https://pink.test'+url));assert.equal(r.status,200,url);await r.arrayBuffer();}
 const request=async(body,token)=>{const r=await handle(new Request('https://pink.test/api/rooms',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)}));assert.equal(r.status,200);return r.json()};
 const host=await request({action:'create'});const guest=await request({action:'join',id:host.id,invite:host.invite});
 const moved=await request({action:'move',id:host.id,version:guest.version,from:'e2',to:'e4'},host.token);assert.match(moved.pgn,/e4/);
 const r=await handle(new Request('https://pink.test/api/rooms?id='+host.id,{headers:{Authorization:'Bearer '+guest.token}}));const same=await r.json();assert.equal(same.pgn,moved.pgn);
 const attack=await handle(new Request('https://pink.test/%2e%2e%2fpackage.json'));assert.equal(attack.status,404);
 console.log('BESTANDEN: alternativer Node-Server, Installationsdateien, SQLite-Migrationen, Einladung, Zugwechsel und Pfadschutz.');
}finally{db.close()}
