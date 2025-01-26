var C=Object.defineProperty;var w=(f,e,a)=>e in f?C(f,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):f[e]=a;var l=(f,e,a)=>w(f,typeof e!="symbol"?e+"":e,a);import{C as d,B as c,R as g,P as v,S as O,a as S,g as F,G as b}from"./LocalTetris-FiLabJJW.js";import{d as R,u as D,g as p,h as E,s as m,j as T,a as A,i as x,b as P,w as B,F as M,f as Y,r as G,o as V}from"./index-DCBOEVjf.js";class j{constructor(e){l(this,"canvas");l(this,"ctx");l(this,"gameBoard");l(this,"fallingPiece");l(this,"nextPiece");l(this,"score");l(this,"isFastDropping");l(this,"animationFrameId");l(this,"isGameOver");l(this,"isPaused");l(this,"dropCounter");l(this,"lastTime");l(this,"moveSpeed");l(this,"dropSpeed");l(this,"fastDropSpeed");this.canvas=e,this.ctx=e.getContext("2d"),this.canvas.width=(d+6)*c,this.canvas.height=g*c,this.dropSpeed=500,this.fastDropSpeed=100,this.moveSpeed=150,this.gameBoard=Array.from({length:g},()=>Array(d).fill(0)),this.fallingPiece=null,this.nextPiece=null,this.score=0,this.isFastDropping=!1,this.animationFrameId=null,this.isGameOver=!1,this.isPaused=!1,this.dropCounter=0,this.lastTime=0}renderTile(e,a,s,t="black",i=2){this.ctx.fillStyle=s,this.ctx.fillRect(e*c,a*c,c,c),this.ctx.lineWidth=i,this.ctx.strokeStyle=t,this.ctx.strokeRect(e*c,a*c,c,c)}renderGameBoard(){this.gameBoard.forEach((a,s)=>{a.forEach((t,i)=>{const r=t?S[t-1]:"black",o=t?void 0:"rgba(255, 255, 255, 0.3)",n=t?void 0:.5;this.renderTile(i,s,r,o,n)})});const e=this.getGhostPosition();e&&e.shape.forEach((a,s)=>{a.forEach((t,i)=>{t>0&&this.renderTile(e.x+i,e.y+s,"black",this.fallingPiece.color)})}),this.fallingPiece!==null&&this.fallingPiece.drawPiece(),this.ctx.fillStyle="#1c1c1c",this.ctx.fillRect(d*c,0,6*c,6*c),this.ctx.strokeStyle="white",this.ctx.strokeRect(d*c,0,6*c,6*c),this.nextPiece&&this.nextPiece.drawPiece(!0)}collision(e,a,s=this.fallingPiece.shape){const t=s||this.fallingPiece.shape,i=this.getShapeBounds(t);for(let r=i.minY;r<=i.maxY;r++)for(let o=i.minX;o<=i.maxX;o++)if(t[r][o]>0){const n=e+o,h=a+r;if(n<0||n>=d||h>=g||h>=0&&this.gameBoard[h][n]>0)return!0}return!1}getShapeBounds(e){let a=e[0].length,s=0,t=e.length,i=0;for(let r=0;r<e.length;r++)for(let o=0;o<e[r].length;o++)e[r][o]>0&&(a=Math.min(a,o),s=Math.max(s,o),t=Math.min(t,r),i=Math.max(i,r));return{minX:a,maxX:s,minY:t,maxY:i}}getGhostPosition(){if(!this.fallingPiece)return null;let e=this.fallingPiece.y;for(;!this.collision(this.fallingPiece.x,e+1);)e++;return{x:this.fallingPiece.x,y:e,shape:this.fallingPiece.shape}}checkFilledLine(){let e=0;switch(this.gameBoard.forEach((a,s)=>{a.every(t=>t>0)&&(this.gameBoard.splice(s,1),this.gameBoard.unshift(Array(d).fill(0)),e++)}),e){case 1:this.score+=100;break;case 2:this.score+=300;break;case 3:this.score+=500;break;case 4:this.score+=800;break}}reset(){this.gameBoard=Array.from({length:g},()=>Array(d).fill(0)),this.fallingPiece=null;const e=F(O.length);this.nextPiece=new v(this.ctx,O[e],S[e],Math.floor(d/2),0),this.score=0,this.isFastDropping=!1,this.isGameOver=!1,this.isPaused=!1,this.dropCounter=0,this.lastTime=0}start(){const e=a=>{if(this.isPaused||this.isGameOver)return;const s=a-this.lastTime;this.lastTime=a,this.dropCounter+=s,this.renderGameBoard(),this.animationFrameId=requestAnimationFrame(e)};requestAnimationFrame(e)}update(e){const{gameBoard:a,fallingPiece:s,nextPiece:t,score:i,isFastDropping:r,isGameOver:o,isPaused:n}=e;this.gameBoard=a,this.fallingPiece=s?new v(this.ctx,s.shape,s.color,s.x,s.y):null,this.nextPiece=new v(this.ctx,t==null?void 0:t.shape,t==null?void 0:t.color,t==null?void 0:t.x,t==null?void 0:t.y),this.score=i,this.isFastDropping=r,this.isGameOver=o,this.isPaused=n}}const I={class:"mt-14 flex justify-around items-center"},N=R({__name:"Multiplayer",setup(f){const e=D(),a=Y(),s=p(),t=p(),i=p(null),r=p(!1);function o(){a.push("/")}return E(()=>{const n=new b(s.value,!1),h=new j(t.value);n.start(()=>{e.updateGameState({gameBoard:n.gameBoard,fallingPiece:n.fallingPiece,nextPiece:n.nextPiece,score:n.score,isFastDropping:n.isFastDropping,isGameOver:n.isGameOver,isPaused:n.isPaused}),n.isGameOver&&m.emit("game:gameOver")}),h.start(),m.on("game:updateOpponentState",u=>{h.update(u)}),m.on("game:gameOver",({winner:u})=>{r.value=!0,h.isGameOver=!0,n.isGameOver=!0,u===m.id?i.value="You":i.value="Opponent",m.emit("game:gameEnd")}),m.on("game:playerDisconnected",()=>{r.value=!0,h.isGameOver=!0,n.isGameOver=!0,i.value="You"})}),T(()=>{m.off("game:updateOpponentState"),m.off("game:gameOver"),m.off("game:playerDisconnected")}),(n,h)=>{const u=G("v-btn"),_=G("v-card"),k=G("v-dialog");return V(),A(M,null,[x("div",I,[x("canvas",{ref_key:"localGameCanvasRef",ref:s},null,512),x("canvas",{ref_key:"remoteGameCanvasRef",ref:t},null,512)]),P(k,{modelValue:r.value,"onUpdate:modelValue":h[0]||(h[0]=y=>r.value=y),persistent:!0,width:"auto"},{default:B(()=>[P(_,{width:"400",text:`贏家: ${i.value==="Opponent"?"對手":"你"}`},{actions:B(()=>[P(u,{class:"ms-auto",text:"Ok",onClick:o})]),_:1},8,["text"])]),_:1},8,["modelValue"])],64)}}});export{N as default};
