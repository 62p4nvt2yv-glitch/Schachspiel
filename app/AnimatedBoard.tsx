'use client';
import {useId,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {type Chess,type Square} from 'chess.js';
import Piece from './Piece';
import {MOVE_DURATION,planBoardMotion,squarePosition,type BoardMotion} from '../lib/board-motion';

const names:Record<string,string>={p:'Bauer',r:'Turm',n:'Springer',b:'Läufer',q:'Dame',k:'König'};
type Props={game:Chess;flipped:boolean;selected:Square|null;showMoves:boolean;showOpponentMove:boolean;onChoose:(square:Square)=>void;onAnimatingChange:(active:boolean)=>void};

export default function AnimatedBoard({game,flipped,selected,showMoves,showOpponentMove,onChoose,onAnimatingChange}:Props){
 const fen=game.fen(),previous=useRef({fen,history:game.history()});
 const [motion,setMotion]=useState<BoardMotion|null>(null);
 const arrowId='move-arrow-'+useId().replace(/[^a-zA-Z0-9_-]/g,'');
 useLayoutEffect(()=>{
  const next=planBoardMotion(previous.current,game);
  previous.current={fen,history:game.history()};
  if(!next||window.matchMedia('(prefers-reduced-motion: reduce)').matches){setMotion(null);onAnimatingChange(false);return;}
  setMotion(next);onAnimatingChange(true);
  const timer=window.setTimeout(()=>{setMotion(null);onAnimatingChange(false);},MOVE_DURATION);
  return()=>{window.clearTimeout(timer);onAnimatingChange(false);};
 },[fen,flipped,game,onAnimatingChange]);
 const files=flipped?'hgfedcba':'abcdefgh',ranks=flipped?'12345678':'87654321';
 const legal=selected?game.moves({square:selected,verbose:true}):[],last=game.history({verbose:true}).at(-1);
 const hidden=new Set(motion?.figures.map(f=>f.to));
 const arrow=showOpponentMove&&!selected&&last?{from:squarePosition(last.from,flipped),to:squarePosition(last.to,flipped)}:null;
 return <div className="board-frame"><div className={'board'+(motion?' is-gliding':'')} role="group" aria-label="Schachbrett" data-animating={!!motion}>
  {ranks.split('').flatMap((rank,ri)=>files.split('').map((file,fi)=>{
   const square=(file+rank) as Square,piece=game.get(square),valid=legal.some(m=>m.to===square),check=piece?.type==='k'&&piece.color===game.turn()&&game.isCheck();
   return <button key={square} onClick={()=>onChoose(square)} className={'square '+((ri+fi)%2?'rose':'blush')+(selected===square?' selected':'')+(last&&(last.from===square||last.to===square)?' last':'')+(check?' in-check':'')} aria-label={square+(piece?' '+(piece.color==='w'?'Rosé ':'Pink ')+names[piece.type]:' leer')+(valid?' mögliches Zielfeld':'')} aria-pressed={selected===square} data-square={square}>
    {fi===0&&<span className="rank">{rank}</span>}{ri===7&&<span className="file">{file}</span>}
    {piece&&<span className={'stationary-piece'+(hidden.has(square)?' gliding-target':'')}><Piece type={piece.type} color={piece.color}/></span>}
    {valid&&showMoves&&<span className={piece?'legal-capture':'legal-dot'}/>}
   </button>;
  }))}
  {arrow&&<svg className="opponent-move-arrow" viewBox="0 0 800 800" aria-hidden="true"><defs><marker id={arrowId} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5Z" fill="currentColor"/></marker></defs><line x1={(arrow.from.x+.5)*100+(arrow.to.x-arrow.from.x)*20} y1={(arrow.from.y+.5)*100+(arrow.to.y-arrow.from.y)*20} x2={(arrow.to.x+.5)*100-(arrow.to.x-arrow.from.x)*18} y2={(arrow.to.y+.5)*100-(arrow.to.y-arrow.from.y)*18} markerEnd={'url(#'+arrowId+')'}/></svg>}
  {motion?.captured&&(()=>{const p=squarePosition(motion.captured.square,flipped);return <div className="captured-ghost" style={{left:p.x*12.5+'%',top:p.y*12.5+'%','--glide-duration':MOVE_DURATION+'ms'} as CSSProperties} aria-hidden="true"><Piece type={motion.captured.type} color={motion.captured.color}/></div>;})()}
  {motion?.figures.map(figure=>{
   const from=squarePosition(figure.from,flipped),to=squarePosition(figure.to,flipped);
   return <div key={fen+figure.from} className="gliding-piece" data-from={figure.from} data-to={figure.to} style={{left:to.x*12.5+'%',top:to.y*12.5+'%','--glide-x':(from.x-to.x)*100+'%','--glide-y':(from.y-to.y)*100+'%','--glide-duration':MOVE_DURATION+'ms'} as CSSProperties} aria-hidden="true"><span className="gliding-shadow"/><span className="gliding-sculpture"><Piece type={figure.type} color={figure.color}/></span></div>;
  })}
 </div></div>;
}
