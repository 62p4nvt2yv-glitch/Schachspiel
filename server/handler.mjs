import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {roomApi,bot} from '../dist/node-api.mjs';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
export function createHandler(db,clientRoot){
 const rooms=roomApi(db);const root=path.resolve(clientRoot);
 return async function handle(req){
  const url=new URL(req.url);
  if(url.pathname==='/healthz')return new Response('ok');
  if(url.pathname==='/api/rooms'){if(req.method==='GET')return rooms.GET(req);if(req.method==='POST')return rooms.POST(req);return new Response('Method Not Allowed',{status:405})}
  if(url.pathname==='/api/bot'){if(req.method==='POST')return bot(req);return new Response('Method Not Allowed',{status:405})}
  if(!['GET','HEAD'].includes(req.method))return new Response('Method Not Allowed',{status:405});
  let filename;try{filename=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname))}catch{return new Response('Bad Request',{status:400})}
  const relative=path.relative(root,filename);if(relative.startsWith('..')||path.isAbsolute(relative))return new Response('Not Found',{status:404});
  try{const data=await readFile(filename);return new Response(req.method==='HEAD'?null:data,{headers:{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':['.html','.webmanifest'].includes(path.extname(filename))||url.pathname==='/sw.js'?'no-cache':'public, max-age=3600','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'}})}catch{return new Response('Not Found',{status:404})}
 };
}
