import {Chess, type Square, type PieceSymbol, type Color} from 'chess.js';

export const MOVE_DURATION=620;
export type BoardSnapshot={fen:string;history:string[]};
export type MovingFigure={from:Square;to:Square;type:PieceSymbol;color:Color};
export type BoardMotion={figures:MovingFigure[];captured?:{square:Square;type:PieceSymbol;color:Color}};

// Animate actual forward moves, never a restored game, an undo or a reset.
export function planBoardMotion(previous:BoardSnapshot,next:Chess):BoardMotion|null{
 const history=next.history({verbose:true}),last=history.at(-1);
 if(!last||history.length!==previous.history.length+1||last.before!==previous.fen||!previous.history.every((san,i)=>history[i].san===san))return null;
 const before=new Chess(previous.fen),piece=before.get(last.from);
 if(!piece)return null;
 const figures:MovingFigure[]=[{from:last.from,to:last.to,type:piece.type,color:piece.color}];
 if(last.flags.includes('k')||last.flags.includes('q')){
  const rank=last.from[1],short=last.flags.includes('k');
  figures.push({from:((short?'h':'a')+rank) as Square,to:((short?'f':'d')+rank) as Square,type:'r',color:piece.color});
 }
 const capturedSquare=(last.flags.includes('e')?last.to[0]+last.from[1]:last.to) as Square;
 const captured=before.get(capturedSquare);
 return {figures,...(last.captured&&captured?{captured:{square:capturedSquare,type:captured.type,color:captured.color}}:{})};
}

export function squarePosition(square:Square,flipped:boolean){
 const file=square.charCodeAt(0)-97,rank=Number(square[1])-1;
 return {x:flipped?7-file:file,y:flipped?rank:7-rank};
}
