// Keep the maintained Sites/Vinext build, then package this client-only game
// with a self-contained API Worker instead of a multi-module SSR runtime.
import {build} from 'esbuild';
import {mkdir,writeFile,readFile,rm,cp} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const root=process.cwd();await mkdir('work',{recursive:true});
await build({stdin:{contents:"import {renderToString} from 'react-dom/server';import Home from './app/page';export default renderToString(<Home/>);",resolveDir:root,loader:'tsx'},outfile:'work/ssr-snapshot.mjs',bundle:true,platform:'node',packages:'external',format:'esm',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'}});
const snapshot=(await import(pathToFileURL(path.join(root,'work/ssr-snapshot.mjs')).href+'?t='+Date.now())).default;
await rm('dist/client',{recursive:true,force:true});await mkdir('dist/client',{recursive:true});await cp('public','dist/client',{recursive:true});
await build({entryPoints:['app/browser-entry.tsx'],outfile:'dist/client/pink-app.js',bundle:true,minify:true,format:'esm',platform:'browser',target:['safari16','chrome110'],jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},legalComments:'eof'});
const html='<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#d42b79"><meta name="description" content="Dein pinkes Schachspiel. Spiele gegen Ben, mit Freunden online oder zu zweit."><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Pink Chess"><meta name="apple-mobile-web-app-status-bar-style" content="default"><title>Pink Chess · Dein nächster Lieblingszug</title><link rel="manifest" href="/manifest.webmanifest"><link rel="icon" type="image/png" href="/icons/pink-chess-32.png"><link rel="apple-touch-icon" href="/icons/pink-chess-180.png"><link rel="stylesheet" href="/pink-app.css"></head><body><div id="pink-root">'+snapshot+'</div><script type="module" src="/pink-app.js"></script></body></html>';
await writeFile('dist/client/index.html',html);await writeFile('work/portable-index.html',html);
const previous=JSON.parse(await readFile('dist/server/wrangler.json','utf8'));
await rm('dist/server',{recursive:true,force:true});await mkdir('dist/server',{recursive:true});
await build({entryPoints:['worker/portable.ts'],outfile:'dist/server/index.js',bundle:true,minify:true,format:'esm',platform:'browser',target:'es2022',external:['cloudflare:workers'],loader:{'.html':'text'},legalComments:'eof'});
const config={name:'pink-chess',main:'index.js',compatibility_date:previous.compatibility_date,compatibility_flags:['nodejs_compat'],no_bundle:true,assets:{directory:'../client'},d1_databases:previous.d1_databases||[],observability:{enabled:true}};
await writeFile('dist/server/wrangler.json',JSON.stringify(config,null,2)+'\n');
console.log('Pink Chess: single-module Worker and hydrated React client packaged.');

await build({stdin:{contents:"export {roomApi} from './lib/rooms-api';export {POST as bot} from './app/api/bot/route';",resolveDir:root,loader:'ts'},outfile:'dist/node-api.mjs',bundle:true,minify:true,format:'esm',platform:'node',target:'node24',legalComments:'eof'});
