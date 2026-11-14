'use client';
import {useEffect,useState} from 'react';
import {Download, X, Share} from 'lucide-react';
type InstallEvent=Event & {prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>};
type InstallNavigator=Navigator & {install?:()=>Promise<void>;standalone?:boolean};
export default function PwaInstall(){
 const [prompt,setPrompt]=useState<InstallEvent|null>(null),[nativeInstall,setNativeInstall]=useState(false),[standalone,setStandalone]=useState(false),[help,setHelp]=useState(false),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{
  const nav=navigator as InstallNavigator;
  const media=window.matchMedia('(display-mode: standalone)');
  const update=()=>setStandalone(media.matches||!!nav.standalone);
  update();setNativeInstall(typeof nav.install==='function');
  const capture=(event:Event)=>{event.preventDefault();setPrompt(event as InstallEvent)};
  const installed=()=>{setStandalone(true);setPrompt(null);setMessage('Pink Chess ist auf deinem Gerät bereit.')};
  window.addEventListener('beforeinstallprompt',capture);window.addEventListener('appinstalled',installed);media.addEventListener('change',update);
  if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).catch(()=>{});
  return()=>{window.removeEventListener('beforeinstallprompt',capture);window.removeEventListener('appinstalled',installed);media.removeEventListener('change',update)};
 },[]);
 async function install(){
  if(busy)return;setBusy(true);setMessage('');
  try{const nav=navigator as InstallNavigator;if(nativeInstall&&nav.install){await nav.install();setMessage('Pink Chess wurde installiert oder geöffnet.');}
   else if(prompt){const event=prompt;setPrompt(null);await event.prompt();const result=await event.userChoice;setMessage(result.outcome==='accepted'?'Installation bestätigt.':'Installation abgebrochen. Du kannst im Browser weiterspielen.');}
  }catch{setMessage('Die Installation wurde nicht abgeschlossen. Du kannst im Browser weiterspielen.');}finally{setBusy(false)}
 }
 return <>{!standalone&&(nativeInstall||prompt?<button className="install-button" onClick={()=>void install()} aria-disabled={busy}><Download size={16}/><span>App installieren</span></button>:<button className="install-button" onClick={()=>setHelp(true)}><Download size={16}/><span>Aufs Handy</span></button>)}
 {message&&<div className="install-status" role="status">{message}<button aria-label="Meldung schließen" onClick={()=>setMessage('')}><X size={15}/></button></div>}
 {help&&<div className="modal-backdrop" onClick={()=>setHelp(false)}><section className="modal install-modal" role="dialog" aria-modal="true" aria-labelledby="install-title" onClick={e=>e.stopPropagation()}><button className="modal-close icon-button" aria-label="Schließen" onClick={()=>setHelp(false)}><X size={20}/></button><img className="install-icon" src="/icons/pink-chess-192.png" width="76" height="76" alt="Pink Chess App-Icon"/><h2 id="install-title">Dein Brett. Immer dabei.</h2><p>Du kannst Pink Chess direkt im Browser spielen und als Symbol auf deinem Startbildschirm ablegen.</p><h3>iPhone oder iPad</h3><p>Öffne diese Seite in Safari. Wähle im Seitenmenü <strong>Teilen</strong> <Share size={13}/> und dann <strong>Zum Home-Bildschirm</strong> bzw. <strong>Zu Home-Bildschirm hinzufügen</strong>. Falls vorhanden, aktiviere <strong>Als Web-App öffnen</strong> und tippe auf <strong>Hinzufügen</strong>.</p><h3>Android</h3><p>Öffne diese Seite in Chrome. Wähle im Menü <strong>App installieren</strong> oder <strong>Zum Startbildschirm hinzufügen</strong>. Wenn der Browser es anbietet, erscheint hier auch ein Installationsknopf.</p><p className="muted">Ben und Online-Partien benötigen Internet. Für Einladungen nutzt jeder seinen eigenen Browser. Im integrierten Browser einer anderen App öffne den Link zuerst in Safari oder Chrome.</p><button className="primary" onClick={()=>setHelp(false)}>Weiter zum Spiel</button></section></div>}</>;
}
