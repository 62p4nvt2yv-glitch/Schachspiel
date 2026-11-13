const board=document.getElementById("board");
const statusText=document.getElementById("status");
const mode=document.getElementById("mode");
const difficulty=document.getElementById("difficulty");
const game=new Chess();
const pieces={wk:"♔",wq:"♕",wr:"♖",wb:"♗",wn:"♘",wp:"♙",bk:"♚",bq:"♛",br:"♜",bb:"♝",bn:"♞",bp:"♟"};
const values={p:1,n:3,b:3,r:5,q:9,k:100};
let selected=null,waiting=false,generation=0;
function draw(){
board.innerHTML="";
const legal=selected?game.moves({square:selected,verbose:true}):[];
for(let rank=8;rank>=1;rank--){
for(const file of "abcdefgh"){
const square=file+rank,piece=game.get(square);
const cell=document.createElement("button");
cell.className="square "+((rank+"abcdefgh".indexOf(file))%2===0?"dark":"light");
if(selected===square)cell.classList.add("selected");
if(legal.some(m=>m.to===square))cell.classList.add("target");
cell.textContent=piece?pieces[piece.color+piece.type]:"";
cell.onclick=()=>choose(square);
board.appendChild(cell);
}}
if(game.in_checkmate())statusText.textContent="Schachmatt! ♛";
else if(game.in_draw())statusText.textContent="Unentschieden!";
else if(waiting)statusText.textContent="Ben überlegt … 🤖";
else statusText.textContent=(game.turn()==="w"?"Weiß":"Schwarz")+" ist am Zug"+(game.in_check()?" – Schach!":"");
}
function choose(square){
if(waiting||game.game_over())return;
if(mode.value==="ben"&&game.turn()==="b")return;
const piece=game.get(square);
if(selected){
const legal=game.moves({square:selected,verbose:true});
if(legal.some(m=>m.to===square)){
game.move({from:selected,to:square,promotion:"q"});
selected=null;draw();
if(mode.value==="ben"&&game.turn()==="b"&&!game.game_over())benMove();
return;
}}
selected=piece&&piece.color===game.turn()?square:null;
draw();
}
function evaluate(){
if(game.in_checkmate())return game.turn()==="w"?10000:-10000;
if(game.in_draw())return 0;
let score=0;
for(const row of game.board())for(const piece of row)if(piece)score+=values[piece.type]*(piece.color==="b"?1:-1);
return score;
}
function search(depth,alpha,beta){
if(depth===0||game.game_over())return evaluate();
const maximizing=game.turn()==="b";
let best=maximizing?-Infinity:Infinity;
for(const move of game.moves({verbose:true})){
game.move(move);
const score=search(depth-1,alpha,beta);
game.undo();
if(maximizing){best=Math.max(best,score);alpha=Math.max(alpha,best);}
else{best=Math.min(best,score);beta=Math.min(beta,best);}
if(beta<=alpha)break;
}
return best;
}
function benMove(){
waiting=true;draw();
const current=++generation;
setTimeout(()=>{
if(current!==generation)return;
const moves=game.moves({verbose:true});
const level=Number(difficulty.value);
let best=-Infinity,chosen=moves[0];
for(const move of moves){
game.move(move);
let score=level===1?Math.random()*20:search(level===2?1:2,-Infinity,Infinity)+Math.random()*(level===2?2:0.1);
game.undo();
if(score>best){best=score;chosen=move;}
}
if(chosen)game.move(chosen);
waiting=false;draw();
},350);
}
function resetGame(){generation++;waiting=false;selected=null;game.reset();draw();}
document.getElementById("reset").onclick=resetGame;
mode.onchange=resetGame;
document.getElementById("undo").onclick=()=>{
if(waiting){generation++;waiting=false;}
game.undo();
if(mode.value==="ben"&&game.turn()==="b")game.undo();
selected=null;draw();
};
draw();
