import assert from 'node:assert/strict';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import ts from 'typescript';
import { Chess } from 'chess.js';
const database=new DatabaseSync(':memory:');database.exec(await readFile('drizzle/0000_sudden_oracle.sql','utf8'));
globalThis.__testEnv = {
 DB: {
  prepare(sql) {
   return { bind(...args) {
    return {
     async first() { return database.prepare(sql).get(...args) || null; },
     async run() { const result = database.prepare(sql).run(...args); return {meta:{changes:Number(result.changes)}}; }
    };
   }};
  }
 }
};
await mkdir('work/test-api',{recursive:true});
async function load(name){const source=(await readFile(`app/api/${name}/route.ts`,'utf8')).replace("import { env } from 'cloudflare:workers';","const env=globalThis.__testEnv;");const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;const path=`work/test-api/${name}.mjs`;await writeFile(path,code);return import('../'+path+'?test='+Date.now())}
const rooms=(await import('../lib/rooms-api.ts')).roomApi(globalThis.__testEnv.DB);const bot=await load('bot');
async function post(body,token,expected=200){const res=await rooms.POST(new Request('https://pink.test/api/rooms',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)}));const r=await res.json();assert.equal(res.status,expected,JSON.stringify(r));return r}
async function get(id,token,expected=200){const res=await rooms.GET(new Request('https://pink.test/api/rooms?id='+id,{headers:token?{Authorization:'Bearer '+token}:{}}));assert.equal(res.status,expected);return res.json()}
const host=await post({action:'create'});assert.equal(host.ready,false);assert.equal(host.color,'w');
await get(host.id,undefined,403);await get(host.id,'f'.repeat(48),403);
await post({action:'move',id:host.id,version:0,from:'e2',to:'e4'},host.token,409);
await post({action:'join',id:host.id,invite:'f'.repeat(48)},undefined,403);
const guest=await post({action:'join',id:host.id,invite:host.invite});assert.equal(guest.color,'b');assert.equal(guest.ready,true);
await post({action:'join',id:host.id,invite:host.invite},undefined,409);
let state=await get(host.id,host.token);assert.equal(state.ready,true);assert.equal(state.version,1);assert.equal(state.token,undefined);assert.equal(state.white_hash,undefined);
await post({action:'move',id:host.id,version:state.version,from:'e7',to:'e5'},guest.token,409);
await post({action:'move',id:host.id,version:state.version,from:'e2',to:'e5'},host.token,400);
state=await post({action:'move',id:host.id,version:state.version,from:'f2',to:'f3'},host.token);
await post({action:'move',id:host.id,version:1,from:'e7',to:'e5'},guest.token,409);
state=await post({action:'move',id:host.id,version:state.version,from:'e7',to:'e5'},guest.token);
state=await post({action:'move',id:host.id,version:state.version,from:'g2',to:'g4'},host.token);
state=await post({action:'move',id:host.id,version:state.version,from:'d8',to:'h4'},guest.token);
const mate=new Chess();mate.loadPgn(state.pgn);assert.ok(mate.isCheckmate());const synchronized=await get(host.id,host.token);assert.equal(synchronized.pgn,state.pgn);
await post({action:'move',id:host.id,version:state.version,from:'a2',to:'a3'},host.token,409);
const h2=await post({action:'create'}),b2=await post({action:'join',id:h2.id,invite:h2.invite});await post({action:'resign',id:h2.id,version:1},b2.token);assert.equal((await get(h2.id,h2.token)).resigned,'b');
database.prepare('UPDATE rooms SET created_at = ? WHERE id = ?').run(Date.now()-8*86400000,h2.id);await get(h2.id,h2.token,404);
const h3=await post({action:'create'});const claims=await Promise.all([post({action:'join',id:h3.id,invite:h3.invite}),rooms.POST(new Request('https://pink.test/api/rooms',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'join',id:h3.id,invite:h3.invite})}))]);assert.equal(claims[1].status,409);
const castle=new Chess();for(const m of ['e4','e5','Nf3','Nc6','Bc4','Nf6','O-O'])castle.move(m);assert.equal(castle.get('g1').type,'k');assert.equal(castle.get('f1').type,'r');
const ep=new Chess();for(const m of ['e4','a6','e5','d5','exd6'])ep.move(m);assert.equal(ep.get('d5'),undefined);assert.equal(ep.get('d6').type,'p');
const promote=new Chess('7k/P7/8/8/8/8/8/7K w - - 0 1');promote.move({from:'a7',to:'a8',promotion:'n'});assert.equal(promote.get('a8').type,'n');
for(const level of ['easy','normal','strong']){const c=new Chess();c.move('e4');const before=performance.now();const res=await bot.POST(new Request('https://pink.test/api/bot',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pgn:c.pgn(),level})}));assert.equal(res.status,200);const result=await res.json();assert.ok(c.moves().includes(result.move));console.log(`Ben ${level}: gültige Antwort in ${Math.round(performance.now()-before)} ms`)}
console.log('BESTANDEN: Einladung, Zugrechte, ungültige Züge, Versionskonflikt, Synchronisierung, Schachmatt, Aufgabe, Ablauf, doppelter Beitritt, Rochade, en passant und Umwandlung.');
