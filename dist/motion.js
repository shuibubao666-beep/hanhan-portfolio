// Times are relative to the opening of the paper. The receipt and cards are separate layers.
const timingDefaults = { tear: 2.35, feed: 2.25, cards: 3.35 };
let timing = {...timingDefaults};
try { Object.assign(timing, JSON.parse(localStorage.getItem('portfolio-timing') || '{}')); } catch {}
// The idle frame and the unfolding clip share the same camera and crop.
const unfold = document.createElement('video');
unfold.className = 'unfold-reference';
unfold.src = 'assets/opening/unfold.mp4';
unfold.poster = 'assets/opening/idle.jpg';
unfold.preload = 'auto';
unfold.muted = true;
unfold.playsInline = true;
intro.prepend(unfold);
register('unfoldClip','纸团展开视频',unfold,unfold.src);
const halves = document.createElement('div');
halves.className = 'tear-halves';
const sheets = ['upper','lower'].map((key,index)=>{
 const image = new Image();
 image.alt = '';
 image.src = 'assets/opening/'+key+'.webp';
 halves.append(image);
 register('tear-'+key,index?'撕纸下半张':'撕纸上半张',image,image.src);
 return image;
});
document.querySelector('#home').prepend(halves);
const preview = document.createElement('button');
preview.textContent = '预览完整动效';
editor.querySelector('footer').prepend(preview);
const controls = document.createElement('fieldset');
controls.innerHTML='<legend>动效节奏</legend>';
editor.querySelector('footer').before(controls);
for(const [key,label,min,max] of [['tear','纸张展开',1,4],['feed','小票走纸',1,5],['cards','作品卡入场延迟',1,6]]){
 const field=document.createElement('label'),input=document.createElement('input'),value=document.createElement('span');
 input.type='range';input.min=min;input.max=max;input.step=.05;input.value=timing[key];
 function update(){timing[key]=Number(input.value);value.textContent=label+' · '+input.value+' 秒';document.body.style.setProperty('--'+key,timing[key]+'s');}
 input.oninput=()=>{update();try{localStorage.setItem('portfolio-timing',JSON.stringify(timing))}catch{}};
 field.append(value,input);controls.append(field);update();
}
let activeRun;
function stopSequence(){
 activeRun?.abort();
 halves.classList.remove('closed');
 unfold.pause();

 intro.classList.remove('ripping','pull-apart');
}
function motion(el,frames,options,signal){
 signal.throwIfAborted();
 const animation=el.animate(frames,{fill:'forwards',...options});
 signal.addEventListener('abort',()=>animation.cancel(),{once:true});
 return animation.finished;
}
function playUnfold(signal){
 return new Promise((resolve,reject)=>{
   unfold.addEventListener('ended',resolve,{once:true,signal});
   unfold.addEventListener('error',()=>reject(new Error('clip')),{once:true,signal});
   signal.addEventListener('abort',()=>reject(signal.reason),{once:true});
   unfold.currentTime=0;
   unfold.playbackRate=Math.max(.5,Math.min(3,(unfold.duration||2.79)/timing.tear));
   unfold.play().catch(reject);
 });
}
async function openPaper(demo=false){
 stopSequence();
 activeRun=new AbortController();
 const {signal}=activeRun;
 finished=false;playing=true;
 window.scrollTo({top:0,behavior:'instant'});
 intro.hidden=false;intro.inert=false;
 intro.classList.remove('finished','tearing','joined');
 stage.classList.remove('anim');aboutScene.classList.remove('visible');
 start.hidden=true;skip.hidden=false;status.hidden=true;
 document.body.classList.add('intro-active');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 try{
  if(!reduced){
   await Promise.all(sheets.map(im=>im.decode()));
   signal.throwIfAborted();
   await playUnfold(signal);
   intro.classList.add('joined');
   intro.classList.add('pull-apart');
   stage.classList.add('anim');
   await Promise.all(sheets.map((sheet,index) => {
    const closed = index ? '-69vw' : '5vw';
    const peeling = index ? '-65vw' : '4vw';
    return motion(sheet,[
     {transform:'translateY('+closed+')',offset:0},
     {transform:'translateY('+peeling+') rotate('+(index?-2:2)+'deg)',offset:.24},
     {transform:'none',offset:1}
    ],{duration:1050,easing:'cubic-bezier(.36,.05,.2,1)',fill:'none'},signal);
   }));
  }
 }catch(error){if(signal.aborted)return;}
 if(signal.aborted)return;
 halves.classList.remove('closed');
 finishIntro();stage.classList.add('anim');
 if(demo){const id=setTimeout(()=>{if(!dialog.open&&!editor.open)aboutScene.scrollIntoView({behavior:reduced?'instant':'smooth'})},(Math.max(1.25+timing.feed,timing.cards+1.2)+.5)*1000);
 signal.addEventListener('abort',()=>clearTimeout(id),{once:true});}
}
start.onclick=()=>openPaper();
document.querySelector('#replay').onclick=()=>openPaper();
preview.onclick=()=>{editor.close();openPaper(true)};
skip.onclick=()=>{stopSequence();finishIntro()};
const originalEdit=document.querySelector('#edit').onclick;
document.querySelector('#edit').onclick=()=>{stopSequence();originalEdit()};
const cardKeys=['ip','aigc','brand','kv','ui'];
for(const anchor of hotspots.querySelectorAll('.stamp')){
 const image=items.get(cardKeys[Number(anchor.dataset.project)]).el;
 function wiggle(){
  if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  image.animate([{rotate:'0deg'},{rotate:'-1.5deg'},{rotate:'1.1deg'},{rotate:'-.5deg'},{rotate:'0deg'}],{duration:370,easing:'ease-in-out'});
 }
 anchor.addEventListener('pointerenter',wiggle);
 anchor.addEventListener('focus',wiggle);
}

// Keep the hover target still while the artwork swings inside its footprint.
for (const key of ['port','folio']) {
 const word = items.get(key).el;
 const target = document.createElement('span');
 target.setAttribute('aria-hidden','true');
 target.style.cssText = word.style.cssText;
 Object.assign(target.style,{position:'absolute',pointerEvents:'auto'});
 hotspots.prepend(target);
 let swing;
 target.addEventListener('pointerenter', event => {
  if (event.pointerType === 'touch' || !finished || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  swing?.cancel();
  const direction = key === 'port' ? -1 : 1;
  swing = word.animate([0,3,-2,1,-.4,0].map((angle,index) => ({
   rotate: angle * direction + 'deg',
   translate: index === 1 ? '0 -2%' : '0 0'
  })),{duration:460,easing:'ease-in-out'});
 });
}
