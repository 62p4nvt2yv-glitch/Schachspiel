import { Chess } from 'chess.js';
export const dynamic='force-dynamic';
const values:Record<string,number>={p:100,n:320,b:335,r:500,q:900,k:0};
function score(c:Chess){if(c.isCheckmate())return c.turn()==='w'?-100000:100000;if(c.isDraw())return 0;let n=0;for(const row of c.board())for(const p of row)if(p){const center=3.5-Math.abs(3.5-p.square.charCodeAt(0)+97);const advance=p.color==='w'?+p.square[1]-2:7-+p.square[1];n+=(p.color==='w'?1:-1)*(values[p.type]+(p.type==='p'?advance*7:0)+(p.type==='n'||p.type==='b'?center*12:0));}return n;}
export async function POST(req:Request){try{
 if(!req.headers.get('content-type')?.includes('application/json')||req.headers.get('sec-fetch-site')==='cross-site')return Response.json({error:'Nicht erlaubt.'},{status:403});
 const raw=await req.text();if(raw.length>30000)return Response.json({error:'Partie zu lang.'},{status:413});const {pgn,level}=JSON.parse(raw);if(typeof pgn!=='string')throw Error();const c=new Chess();c.loadPgn(pgn);if(c.isGameOver())return Response.json({move:null});
 const depth=level==='strong'?3:level==='easy'?1:2;let nodes=0;
 function search(d:number,a:number,b:number):number{if(d===0||c.isGameOver()||++nodes>18000)return score(c);const max=c.turn()==='w';let best=max?-Infinity:Infinity;const moves=c.moves({verbose:true}).sort((x,y)=>(values[y.captured||'']||0)-(values[x.captured||'']||0));for(const m of moves){c.move(m);const v=search(d-1,a,b);c.undo();best=max?Math.max(best,v):Math.min(best,v);if(max)a=Math.max(a,best);else b=Math.min(b,best);if(b<=a)break;}return best;}
 const max=c.turn()==='w';const ranked=c.moves().map(move=>{c.move(move);let value=search(depth-1,-Infinity,Infinity);c.undo();if(level==='easy')value+=Math.random()*160-80;return {move,value};}).sort((a,b)=>max?b.value-a.value:a.value-b.value);
 return Response.json({move:ranked[0].move},{headers:{'Cache-Control':'no-store'}});
}catch{return Response.json({error:'Ben braucht einen neuen Versuch.'},{status:400});}}
