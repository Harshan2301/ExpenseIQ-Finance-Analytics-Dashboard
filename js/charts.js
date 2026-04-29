// ExpenseIQ — Chart Utilities (Canvas)

// ── SPARKLINE ─────────────────────────────────────────
function drawSparkline(id,data,color='#CCFF00'){
  const c=document.getElementById(id);if(!c)return;
  const w=c.offsetWidth||c.width,h=c.height;
  c.width=w;const ctx=c.getContext('2d');
  const mn=Math.min(...data),mx=Math.max(...data),r=mx-mn||1;
  const pts=data.map((v,i)=>({x:(i/(data.length-1))*w,y:h-((v-mn)/r)*(h-4)-2}));
  const g=ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,color+'60');g.addColorStop(1,color+'00');
  ctx.beginPath();ctx.moveTo(pts[0].x,h);
  pts.forEach(p=>ctx.lineTo(p.x,p.y));
  ctx.lineTo(pts[pts.length-1].x,h);ctx.closePath();
  ctx.fillStyle=g;ctx.fill();
  ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
  ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.lineJoin='round';ctx.stroke();
}

// ── LINE CHART ────────────────────────────────────────
function drawLineChart(canvasId,datasets,labels,opts={}){
  const canvas=document.getElementById(canvasId);if(!canvas)return;
  const dpr=window.devicePixelRatio||1;
  const parent=canvas.parentElement;
  const W=parent.offsetWidth-32,H=opts.height||220;
  canvas.style.width=W+'px';canvas.style.height=H+'px';
  canvas.width=W*dpr;canvas.height=H*dpr;
  const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
  const pad={top:16,right:16,bottom:32,left:72};
  const cw=W-pad.left-pad.right,ch=H-pad.top-pad.bottom;
  const allVals=datasets.flatMap(d=>d.data);
  const mn=Math.min(...allVals)*0.95,mx=Math.max(...allVals)*1.05;
  const toX=i=>pad.left+(i/(labels.length-1))*cw;
  const toY=v=>pad.top+ch-((v-mn)/(mx-mn))*ch;
  ctx.clearRect(0,0,W,H);
  // Grid
  for(let i=0;i<=4;i++){
    const y=pad.top+(i/4)*ch;
    ctx.beginPath();ctx.moveTo(pad.left,y);ctx.lineTo(pad.left+cw,y);
    ctx.strokeStyle='rgba(255,255,255,0.05)';ctx.lineWidth=1;ctx.stroke();
    const v=mx-(i/4)*(mx-mn);
    ctx.fillStyle='#555';ctx.font=`10px Space Grotesk`;ctx.textAlign='right';
    ctx.fillText('₹'+(v>=1000?Math.round(v/1000)+'K':Math.round(v)),pad.left-6,y+4);
  }
  // X labels
  ctx.fillStyle='#555';ctx.font='9px Space Grotesk';ctx.textAlign='center';
  labels.forEach((l,i)=>ctx.fillText(l,toX(i),H-6));
  // Lines
  datasets.forEach(ds=>{
    const pts=ds.data.map((v,i)=>({x:toX(i),y:toY(v)}));
    const g=ctx.createLinearGradient(0,pad.top,0,pad.top+ch);
    g.addColorStop(0,ds.color+'40');g.addColorStop(1,ds.color+'00');
    if(opts.fill!==false){
      ctx.beginPath();ctx.moveTo(pts[0].x,pad.top+ch);
      pts.forEach(p=>ctx.lineTo(p.x,p.y));
      ctx.lineTo(pts[pts.length-1].x,pad.top+ch);ctx.closePath();
      ctx.fillStyle=g;ctx.fill();
    }
    ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
    ctx.strokeStyle=ds.color;ctx.lineWidth=2;ctx.lineJoin='round';ctx.stroke();
    ctx.shadowColor=ds.color;ctx.shadowBlur=10;
    ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
    ctx.strokeStyle=ds.color+'80';ctx.lineWidth=4;ctx.stroke();
    ctx.shadowBlur=0;
    const last=pts[pts.length-1];
    ctx.beginPath();ctx.arc(last.x,last.y,4,0,Math.PI*2);
    ctx.fillStyle=ds.color;ctx.shadowColor=ds.color;ctx.shadowBlur=12;ctx.fill();ctx.shadowBlur=0;
  });
  return{toX,toY,labels,datasets,pad,W,H,mn,mx};
}

// ── BAR CHART ─────────────────────────────────────────
function drawBarChart(canvasId,groups,labels,opts={}){
  const canvas=document.getElementById(canvasId);if(!canvas)return;
  const dpr=window.devicePixelRatio||1;
  const parent=canvas.parentElement;
  const W=parent.offsetWidth-32,H=opts.height||220;
  canvas.style.width=W+'px';canvas.style.height=H+'px';
  canvas.width=W*dpr;canvas.height=H*dpr;
  const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
  const pad={top:16,right:16,bottom:32,left:72};
  const cw=W-pad.left-pad.right,ch=H-pad.top-pad.bottom;
  const allVals=groups.flatMap(g=>g.data);
  const mx=Math.max(...allVals)*1.1;
  const barW=cw/labels.length;
  const bw=barW*0.35/groups.length;
  ctx.clearRect(0,0,W,H);
  for(let i=0;i<=4;i++){
    const y=pad.top+(i/4)*ch;
    ctx.beginPath();ctx.moveTo(pad.left,y);ctx.lineTo(pad.left+cw,y);
    ctx.strokeStyle='rgba(255,255,255,0.05)';ctx.lineWidth=1;ctx.stroke();
    const v=mx*(1-i/4);
    ctx.fillStyle='#555';ctx.font='10px Space Grotemp';ctx.textAlign='right';
    ctx.fillText('₹'+(v>=1000?Math.round(v/1000)+'K':Math.round(v)),pad.left-6,y+4);
  }
  ctx.fillStyle='#555';ctx.font='9px Space Grotesk';ctx.textAlign='center';
  labels.forEach((l,i)=>ctx.fillText(l,pad.left+(i+0.5)*barW,H-6));
  groups.forEach((grp,gi)=>{
    grp.data.forEach((v,i)=>{
      const bh=(v/mx)*ch;
      const x=pad.left+(i+0.5)*barW+(gi-groups.length/2+0.5)*bw*1.2;
      const y=pad.top+ch-bh;
      const g=ctx.createLinearGradient(0,y,0,y+bh);
      g.addColorStop(0,grp.color);g.addColorStop(1,grp.color+'40');
      ctx.fillStyle=g;
      ctx.shadowColor=grp.color;ctx.shadowBlur=6;
      ctx.beginPath();
      ctx.roundRect?ctx.roundRect(x-bw/2,y,bw,bh,2):ctx.rect(x-bw/2,y,bw,bh);
      ctx.fill();ctx.shadowBlur=0;
    });
  });
}

// ── PIE / DONUT CHART ─────────────────────────────────
function drawPieChart(canvasId,segments,opts={}){
  const canvas=document.getElementById(canvasId);if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const W=canvas.width,H=canvas.height;
  const cx=W/2,cy=H/2,r=Math.min(W,H)/2-8;
  const ir=opts.donut?r*0.55:0;
  ctx.clearRect(0,0,W,H);
  const total=segments.reduce((s,seg)=>s+seg.value,0);
  let start=-Math.PI/2;
  segments.forEach(seg=>{
    const angle=(seg.value/total)*Math.PI*2;
    ctx.beginPath();ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,r,start,start+angle);ctx.closePath();
    ctx.fillStyle=seg.color;ctx.shadowColor=seg.color;ctx.shadowBlur=8;ctx.fill();ctx.shadowBlur=0;
    start+=angle;
  });
  if(ir>0){
    ctx.beginPath();ctx.arc(cx,cy,ir,0,Math.PI*2);
    ctx.fillStyle='#0A0A0A';ctx.fill();
    if(opts.centerText){
      ctx.fillStyle='#CCFF00';ctx.font=`bold ${ir*0.4}px Syne`;ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(opts.centerText,cx,cy-ir*0.1);
      if(opts.centerSub){ctx.fillStyle='#666';ctx.font=`${ir*0.22}px Space Grotesk`;ctx.fillText(opts.centerSub,cx,cy+ir*0.22);}
    }
  }
}

// ── HEATMAP ───────────────────────────────────────────
function drawHeatmap(containerId,txns){
  const el=document.getElementById(containerId);if(!el)return;
  const now=new Date(),y=now.getFullYear(),m=now.getMonth();
  const days=new Date(y,m+1,0).getDate();
  const map={};
  txns.filter(t=>t.type==='expense'&&t.date.startsWith(`${y}-${String(m+1).padStart(2,'0')}`))
    .forEach(t=>{const d=parseInt(t.date.split('-')[2]);map[d]=(map[d]||0)+t.amount;});
  const maxSpend=Math.max(...Object.values(map),1);
  el.innerHTML='';
  const grid=document.createElement('div');
  grid.style.cssText='display:grid;grid-template-columns:repeat(7,1fr);gap:3px;';
  for(let d=1;d<=days;d++){
    const spent=map[d]||0;
    const intensity=Math.min(spent/maxSpend,1);
    const cell=document.createElement('div');
    const isToday=d===now.getDate();
    cell.style.cssText=`aspect-ratio:1;border-radius:3px;background:${spent?`rgba(204,255,0,${0.15+intensity*0.85})`:'rgba(255,255,255,0.04)'};display:flex;align-items:center;justify-content:center;font-size:0.55rem;font-weight:700;color:${spent?'#000':'#333'};cursor:default;transition:transform 0.15s;${isToday?'outline:1px solid #CCFF00;':''};`;
    cell.title=`Day ${d}: ${spent?'₹'+spent.toLocaleString('en-IN'):'No spending'}`;
    cell.textContent=d;
    cell.onmouseenter=()=>cell.style.transform='scale(1.2)';
    cell.onmouseleave=()=>cell.style.transform='';
    grid.appendChild(cell);
  }
  el.appendChild(grid);
}
