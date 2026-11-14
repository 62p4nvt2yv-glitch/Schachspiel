import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {openStore} from './sqlite-store.mjs';
import {createHandler} from './handler.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const store=openStore(path.join(process.env.DATA_DIR||path.join(root,'data'),'pink-chess.sqlite'),path.join(root,'drizzle'));
const handle=createHandler(store,path.join(root,'dist/client'));
const server=http.createServer(async(req,res)=>{
 try{const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>40000){res.writeHead(413);res.end('Anfrage zu groß');return;}chunks.push(chunk)}
  const method=req.method||'GET';const request=new Request('http://pink.internal'+(req.url||'/'),{method,headers:req.headers,body:['GET','HEAD'].includes(method)?undefined:Buffer.concat(chunks)});
  const response=await handle(request);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(500,{'Content-Type':'text/plain; charset=utf-8'});res.end('Die Anfrage konnte nicht verarbeitet werden.');}
});
server.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Pink Chess läuft auf Port '+(process.env.PORT||3000)));
function shutdown(){server.close(()=>{store.close();process.exit(0)})}process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
