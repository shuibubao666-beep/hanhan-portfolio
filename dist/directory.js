(() => {
 const board=document.querySelector('#folio'),parts=new Map(),storage='portfolio-directory-layout-v1';
 let saved={};try{saved=JSON.parse(localStorage.getItem(storage))||{}}catch{}
 function bind(key,label,selector,x,y,width){
  const el=board.querySelector(selector),geometry=[x/14.4,y/9,width/14.4];
  const values=Array.isArray(saved[key])&&saved[key].length===3&&saved[key].every(Number.isFinite)?saved[key].slice():geometry;
  parts.set(key,{el,label,values});
  if(key!=='folder'){const img=el.querySelector('img');register('directory-'+key,'目录 · '+label,img,img.src)}
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
  register('directory-folder-'+side,side==='front'?'目录 · 文件夹前盖':'目录 · 文件夹后壳',img,img.src);
 }
 const bg=new Image();bg.onload=()=>board.querySelector('.folio__bg').style.backgroundImage='url("'+bg.src+'")';bg.src='assets/folio/bg-dots.webp';register('directory-texture','目录 · 蓝纸背景',bg,bg.src);
 const field=document.createElement('fieldset');field.innerHTML='<legend>目录排版</legend>';
 editor.querySelector('footer').before(field);
 const select=document.createElement('select');select.setAttribute('aria-label','目录元素');field.append(select);
 for(const [key,{label}] of parts)select.add(new Option(label,key));select.value='title';
 const inputs=['水平位置 (%)','垂直位置 (%)','宽度 (%)'].map((name,i)=>{
  const label=document.createElement('label'),input=document.createElement('input');
  input.type='number';input.min=i===2?2:-30;input.max=120;input.step=.1;label.append(name,input);field.append(label);
  input.oninput=()=>{if(!input.validity.valid || !Number.isFinite(input.valueAsNumber))return;
   const item=parts.get(select.value);item.values[i]=input.valueAsNumber;saved[select.value]=item.values;draw();try{localStorage.setItem(storage,JSON.stringify(saved))}catch{}};
  return input;
 });
 function refresh(){inputs.forEach((input,i)=>input.value=parts.get(select.value).values[i])}
 select.onchange=refresh;refresh();
 const preview=document.createElement('button');preview.type='button';preview.textContent='查看目录排版';field.append(preview);
 preview.onclick=()=>{editor.close();if(!board.classList.contains('is-open'))board.querySelector('#folio-flap').click();location.hash='contents';board.scrollIntoView()};
})();
