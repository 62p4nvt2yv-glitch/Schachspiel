import { Chess } from 'chess.js';
export function roomApi(db:D1Database){
type Room = {id:string;invite_hash:string;white_hash:string;black_hash:string|null;pgn:string;version:number;resigned:string|null;created_at:number};
const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('');
async function hash(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),b=>b.toString(16).padStart(2,'0')).join('');}
async function get(id:string){if(!/^[a-f0-9]{48}$/.test(id))return null;return db.prepare('SELECT * FROM rooms WHERE id = ? AND created_at > ?').bind(id,Date.now()-7*86400000).first<Room>();}
async function side(req:Request,r:Room){const token=req.headers.get('authorization')?.replace(/^Bearer /,'')||'';if(!/^[a-f0-9]{48}$/.test(token))return null;const h=await hash(token);return h===r.white_hash?'w':h===r.black_hash?'b':null;}
function state(r:Room,color:string){return {id:r.id,pgn:r.pgn,version:r.version,color,ready:!!r.black_hash,resigned:r.resigned};}
async function GET(req:Request){try{const r=await get(new URL(req.url).searchParams.get('id')||'');if(!r)return json({error:'Diese Partie existiert nicht mehr. Einladungen gelten sieben Tage.'},404);const color=await side(req,r);if(!color)return json({error:'Dir fehlt der Zugang zu dieser Partie.'},403);return json(state(r,color));}catch{return json({error:'Die Verbindung zur Partie ist gerade nicht verfügbar.'},503);}}
async function POST(req:Request){try{
  if(!req.headers.get('content-type')?.includes('application/json')||req.headers.get('sec-fetch-site')==='cross-site')return json({error:'Anfrage nicht erlaubt.'},403);
  const raw=await req.text();if(raw.length>4000)return json({error:'Anfrage zu groß.'},413);const data=JSON.parse(raw);
  if(data.action==='create'){
    const id=random(),token=random(),invite=random();
    await db.prepare('INSERT INTO rooms (id,invite_hash,white_hash,pgn,version,created_at) VALUES (?,?,?,?,?,?)').bind(id,await hash(invite),await hash(token),'',0,Date.now()).run();
    return json({id,token,invite,pgn:'',version:0,color:'w',ready:false,resigned:null});
  }
  const r=await get(data.id||'');if(!r)return json({error:'Partie nicht gefunden oder abgelaufen.'},404);
  if(data.action==='join'){
    if(typeof data.invite!=='string'||data.invite.length!==48||await hash(data.invite)!==r.invite_hash)return json({error:'Dieser Einladungslink ist ungültig.'},403);
    const token=random();const result=await db.prepare('UPDATE rooms SET black_hash = ?, version = version + 1 WHERE id = ? AND black_hash IS NULL').bind(await hash(token),r.id).run();
    if(!result.meta.changes)return json({error:'Diese Partie hat bereits zwei Spieler. Öffne sie auf dem Gerät, mit dem du beigetreten bist.'},409);
    return json({...state({...r,black_hash:'joined',version:r.version+1},'b'),token});
  }
  const color=await side(req,r);if(!color)return json({error:'Du darfst diese Partie nicht verändern.'},403);
  if(!r.black_hash)return json({error:'Warte, bis dein Freund oder deine Freundin beitritt.'},409);
  if(data.version!==r.version)return json({error:'Das Brett hat sich verändert. Es wird aktualisiert.'},409);
  if(r.resigned)return json({error:'Diese Partie ist beendet.'},409);
  const chess=new Chess();chess.loadPgn(r.pgn);if(chess.isGameOver())return json({error:'Diese Partie ist beendet.'},409);
  let pgn=r.pgn,resigned:string|null=null;
  if(data.action==='resign')resigned=color;
  else if(data.action==='move'){
    if(chess.turn()!==color)return json({error:'Du bist noch nicht am Zug.'},409);
    if(!/^[a-h][1-8]$/.test(data.from)||!/^[a-h][1-8]$/.test(data.to))return json({error:'Ungültiges Feld.'},400);
    try{chess.move({from:data.from,to:data.to,promotion:['q','r','b','n'].includes(data.promotion)?data.promotion:'q'});}catch{return json({error:'Dieser Zug ist nicht erlaubt.'},400);}
    pgn=chess.pgn();
  }else return json({error:'Unbekannte Aktion.'},400);
  const update=await db.prepare('UPDATE rooms SET pgn = ?, resigned = ?, version = version + 1 WHERE id = ? AND version = ?').bind(pgn,resigned,r.id,r.version).run();
  if(!update.meta.changes)return json({error:'Die Partie wurde inzwischen aktualisiert.'},409);
  return json(state({...r,pgn,resigned,version:r.version+1},color));
}catch{return json({error:'Die Partie konnte nicht aktualisiert werden. Versuche es erneut.'},503);}}

return {GET,POST};
}
