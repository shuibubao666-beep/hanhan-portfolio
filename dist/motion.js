// Times are relative to the opening of the paper. The receipt and cards are separate layers.
const timing = { tear: 2.35, feed: 2.25, cards: 3.35 };
for (const [key, seconds] of Object.entries(timing)) document.body.style.setProperty('--'+key,seconds+'s');
// The idle frame and the unfolding clip share the same camera and crop.
const unfold = document.createElement('video');
unfold.className = 'unfold-reference';
unfold.src = 'assets/opening/unfold.mp4';
unfold.poster = 'assets/opening/idle.jpg';
unfold.preload = 'auto';
unfold.muted = true;
unfold.playsInline = true;
intro.prepend(unfold);
const halves = document.createElement('div');
halves.className = 'tear-halves';
const sheets = ['upper','lower'].map(key=>{
 const image = new Image();
 image.alt = '';
 image.src = 'assets/opening/'+key+'.webp';
 halves.append(image);
 return image;
});
document.querySelector('#home').prepend(halves);
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
async function openPaper(){
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
}
start.onclick=()=>openPaper();
document.querySelector('#replay').onclick=()=>openPaper();
skip.onclick=()=>{stopSequence();finishIntro()};
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
