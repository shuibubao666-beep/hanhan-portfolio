(() => {
 const board=document.querySelector('#folio'),parts=new Map();
 function bind(key,label,selector,x,y,width){
  const el=board.querySelector(selector),geometry=[x/14.4,y/9,width/14.4];
  parts.set(key,{el,values:geometry});
 }
 bind('title','Content 标题','.folio__t-letters-wrap',586,6,324);
 bind('star','星形贴纸','.folio__t-star-wrap',530,10,108);
 bind('folder','文件夹','.folio__folder',510,438,420);
 const keys=['ip','aigc','brand','kv','ui'];
 keys.forEach((key,i)=>bind(key,projects[i].title,'.folio__ticket:nth-child('+(i+1)+')',[69,338,614,890,1159][i],[150,207,142,207,150][i],212));
 function draw(){
  const [fx,fy,fw]=parts.get('folder').values,scale=fw*14.4/340;
  // Reserve the heading and its animated bounds before placing the ticket group.
  const headingBottom=Math.max(...[['title',171/306],['star',153/138]].map(([key,ratio])=>{
   const [,y,w]=parts.get(key).values;
   return y*9+w*14.4*ratio+12;
  }));
  const highestTicket=Math.min(...keys.map(key=>{
   const [,y,w]=parts.get(key).values;
   return y*9-w*14.4*.14;
  }));
  const clearance=Math.max(0,headingBottom+34-highestTicket);
  board.style.aspectRatio='1440 / '+(900+clearance);
  board.querySelector('.folio__stage').style.height=(900+clearance)+'px';
  board.querySelector('.folio__hint').style.top=(812+clearance)+'px';
  for(const [key,{el,values:[x,y,w]}] of parts){
   if(key==='folder')Object.assign(el.style,{left:fx*14.4+'px',top:(fy*9+clearance)+'px',scale:String(scale),transformOrigin:'top left'});
   else if(keys.includes(key)){
    el.style.setProperty('--dx',((x-fx+w/2)*14.4/scale-170)+'px');el.style.setProperty('--dy',(((y-fy)*9+w*14.4*.625)/scale-174.5)+'px');
    el.style.setProperty('--open-size',w*14.4/164/scale);
   }else Object.assign(el.style,{left:x*14.4-540+'px',top:y*9-48+'px',width:w*14.4+'px',height:w*14.4*(key==='title'?171/306:153/138)+'px'});
  }
 }
 draw();
 for(const side of ['front','back']){
  const img=board.querySelector('.folio__folder-'+side);
  function check(){img.classList.toggle('shell-missing',!img.naturalWidth)}
  img.addEventListener('load',check);img.addEventListener('error',check);check();
 }
})();
