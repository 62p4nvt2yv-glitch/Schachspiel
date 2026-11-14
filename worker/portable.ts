// Single-module production entry. Static assets are served by Sites/Cloudflare.
import {roomApi} from '../lib/rooms-api';
import {POST as bot} from '../app/api/bot/route';
import html from '../work/portable-index.html';
export default {
 async fetch(req:Request, env:{DB:D1Database;ASSETS?:Fetcher}){
  const path=new URL(req.url).pathname;
  const {GET:getRoom,POST:postRoom}=roomApi(env.DB);
  if(path==='/api/rooms'){
   if(req.method==='GET')return getRoom(req);
   if(req.method==='POST')return postRoom(req);
   return new Response('Method Not Allowed',{status:405,headers:{Allow:'GET, POST'}});
  }
  if(path==='/api/bot'){
   if(req.method==='POST')return bot(req);
   return new Response('Method Not Allowed',{status:405,headers:{Allow:'POST'}});
  }
  if(path==='/'||path==='/index.html')return new Response(req.method==='HEAD'?null:html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}});
  if(env.ASSETS)return env.ASSETS.fetch(req);
  return new Response('Not Found',{status:404});
 }
};
