'use client';
import {useId} from 'react';

// Resolution-independent, glossy pink pieces; the two tones distinguish sides.
export default function Piece({type,color}:{type:string;color:string}){
 const id=useId().replace(/[^a-zA-Z0-9_-]/g,'');
 const body={
  p:<><circle cx="24" cy="12" r="6.2"/><path d="M19 18Q24 21 29 18L28 23Q27 29 33 34Q24 38 15 34Q21 29 20 23Z"/><ellipse cx="24" cy="20" rx="6.5" ry="2"/></>,
  r:<><path d="M12 7H18V12H21V7H27V12H30V7H36V18L31 22L32 34Q24 38 16 34L17 22L12 18Z"/><path d="M14 18Q24 21 34 18M17 23Q24 25 31 23" fill="none"/></>,
  n:<><path d="M14 34Q13 25 23 18L17 19L12 23L7 19L14 10L23 7L28 3L30 10Q41 17 34 34Q24 38 14 34Z"/><path d="M23 19Q32 18 29 29M15 12L21 10" fill="none"/><circle cx="26" cy="13" r="1.1" fill="var(--chess-edge)" stroke="none"/></>,
  b:<><path d="M24 5Q9 17 20 23Q20 29 16 34Q24 38 32 34Q28 29 28 23Q39 17 24 5Z"/><path d="M25 11L20 18M19 25Q24 27 29 25" fill="none"/><circle cx="24" cy="5" r="2.3"/></>,
  q:<><path d="M11 13L17 33Q24 37 31 33L37 13L29 21L24 10L19 21Z"/><circle cx="11" cy="12" r="3"/><circle cx="24" cy="8" r="3.5"/><circle cx="37" cy="12" r="3"/><ellipse cx="24" cy="30" rx="8" ry="2.1"/></>,
  k:<><path d="M22 3H26V8H31V12H26V17H22V12H17V8H22Z"/><path d="M24 21C11 10 5 24 17 33Q24 37 31 33C43 24 37 10 24 21Z"/><ellipse cx="24" cy="30" rx="8" ry="2.2"/></>
 }[type];
 return <svg viewBox="0 0 48 48" className={'piece '+(color==='w'?'ivory':'berry')} aria-hidden="true">
  <defs>
   <linearGradient id={id+'-body'} x1="0" y1="0" x2="1" y2=".12" gradientUnits="objectBoundingBox"><stop stopColor="var(--chess-edge)"/><stop offset=".22" stopColor="var(--chess-mid)"/><stop offset=".42" stopColor="var(--chess-light)"/><stop offset=".52" stopColor="var(--chess-mid)"/><stop offset=".8" stopColor="var(--chess-main)"/><stop offset="1" stopColor="var(--chess-edge)"/></linearGradient>
   <linearGradient id={id+'-rim'} x2="0" y2="1"><stop stopColor="var(--chess-light)"/><stop offset=".35" stopColor="var(--chess-main)"/><stop offset=".72" stopColor="var(--chess-edge)"/><stop offset="1" stopColor="var(--chess-mid)"/></linearGradient>
   <radialGradient id={id+'-shine'} cx=".35" cy=".2" r=".7"><stop stopColor="#fff" stopOpacity=".88"/><stop offset=".5" stopColor="#fff" stopOpacity=".16"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></radialGradient>
  </defs>
  <ellipse cx="25" cy="44" rx="17" ry="3" fill="#8e235c" opacity=".18"/>
  <g fill={'url(#'+id+'-body)'} stroke="var(--chess-edge)" strokeWidth=".85" strokeLinejoin="round" strokeLinecap="round">
   {body}
   <path d="M16 32Q24 35 32 32L33 36Q24 40 15 36Z" fill={'url(#'+id+'-rim)'}/>
   <path d="M15 36Q24 39 33 36L37 40V43Q24 47 11 43V40Z"/>
   <ellipse cx="24" cy="40" rx="13" ry="3" fill={'url(#'+id+'-rim)'}/>
   <path d="M12 43Q24 46 36 43" fill="none" stroke="var(--chess-mid)"/>
  </g>
  <ellipse cx="20" cy={type==='p'?10:18} rx="2" ry={type==='p'?2:4} fill={'url(#'+id+'-shine)'} transform={'rotate(-20 20 '+(type==='p'?10:18)+')'}/>
  <path d="M17 39Q22 40 27 39" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth=".9" strokeLinecap="round"/>
 </svg>;
}
