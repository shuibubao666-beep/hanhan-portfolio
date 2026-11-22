const stage=document.querySelector('#stage'),aboutScene=document.querySelector('#about');
const items=new Map();
layers.forEach(({key,name,rect:[x,y,w,h],scene},i)=>{
 const im=new Image();im.alt=name;im.className='layer '+key;im.src='assets/layers/'+key+'.webp';
 im.style.cssText='left:'+x/19.2+'%;top:'+y/17.54+'%;width:'+w/19.2+'%;height:'+h/17.54+'%;--delay:'+(scene?(i-11)*.12:i>=6?2.85+(i-6)*.18:i===5?.28:i===2?.48:i*.07)+'s';
 (scene?aboutScene:stage).append(im);items.set(key,{el:im});
});

if(intro.classList.contains('finished'))stage.classList.add('anim');
new MutationObserver(()=>{if(intro.classList.contains('finished'))stage.classList.add('anim')}).observe(intro,{attributes:true,attributeFilter:['class']});
// Trigger each sticker from its resting position, independent of its animation transform.
const stickers = Array.from(aboutScene.querySelectorAll('.layer'));
let aboutFrame = 0;
let aboutEntered = false;
let aboutRequested = false;
function resetAbout() {
 aboutEntered = false;
 stickers.forEach(el => el.classList.remove('attached'));
}
function requestAboutEntry(hash) {
 aboutRequested = hash === '#about';
 resetAbout();
 queueAbout();
}
function updateAbout() {
 aboutFrame = 0;
 const box = aboutScene.getBoundingClientRect();
 if (!box.height || dialog.open || document.body.classList.contains('intro-active')) {
   resetAbout();
   return;
 }
 const visible = Math.max(0, Math.min(innerHeight,box.bottom) - Math.max(0,box.top));
 const fraction = visible / Math.min(innerHeight,box.height);
 const moved = window.scrollY > 2;
 if ((!moved && !aboutRequested) || fraction < .16) {
   resetAbout();
   return;
 }
 if (!aboutEntered) {
   const atEnd = moved && window.scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
   if (fraction < .48 && !atEnd) return;
   aboutEntered = true;
   aboutRequested = false;
 }
 for (const el of stickers) {
   if (box.top + el.offsetTop < innerHeight || box.bottom <= innerHeight + 2) el.classList.add('attached');
 }
}
function queueAbout() {
 if (!aboutFrame) aboutFrame = requestAnimationFrame(updateAbout);
}
window.addEventListener('scroll',queueAbout,{passive:true});
window.addEventListener('resize',queueAbout);
dialog.addEventListener('close',queueAbout);
new MutationObserver(queueAbout).observe(document.body,{attributes:true,attributeFilter:['class']});
queueAbout();
const receiptImage=stage.querySelector('.paper'),sleeve=document.createElement('div');sleeve.className='sleeve';sleeve.style.cssText=receiptImage.style.cssText;stage.insertBefore(sleeve,receiptImage);sleeve.append(receiptImage);

// Keep the artwork available to the card and title animations. The outer layer handles landing,
// while the inner chassis pivots around the paper outlet during the feed.
const machineArt = items.get('printer').el;
const machineLayer = document.createElement('div');
machineLayer.className = machineArt.className;
machineLayer.style.cssText = machineArt.style.cssText;
machineArt.replaceWith(machineLayer);
const chassis = document.createElement('div');
chassis.className = 'printer-chassis';
machineLayer.append(chassis);
machineArt.className = 'printer-art';
machineArt.removeAttribute('style');
chassis.append(machineArt);
for (const side of ['left','right']) {
 const lid = document.createElement('i');
 lid.className = 'printer-lid ' + side;
 lid.setAttribute('aria-hidden','true');
 chassis.append(lid);
}

// Both eyes use the glass and highlights sampled from the original printer.
[766, 928].forEach((left, index) => {
 const socket = document.createElement('span');
 socket.className = 'printer-gaze';
 socket.setAttribute('aria-hidden','true');
 socket.style.left = left / 1320 * 100 + '%';
 socket.style.backgroundImage = 'url(assets/layers/socket-' + (index+1) + '.png)';
 const pupil = document.createElement('img');
 pupil.src = 'assets/layers/pupil-' + (index+1) + '.png';
 pupil.alt = '';
 socket.append(pupil);
 chassis.insertBefore(socket,chassis.querySelector('.printer-lid'));
});
const gazeEnabled = matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
let gazePointer = null, gazeFrame = 0;
function updateGaze(){
 gazeFrame = 0;
 const box = machineLayer.getBoundingClientRect();
 const idle = !gazePointer;
 let x = 0, y = 0;
 if(gazeEnabled.matches && box.width){
  if(idle){
   const t = performance.now()/1000;
   x = .26*Math.sin(t*.95);
   y = .20*Math.sin(t*1.31);
  }else if(gazePointer){
   const dx = gazePointer.x - (box.left + box.width*.697);
   const dy = gazePointer.y - (box.top + box.height*.212);
   const distance = Math.max(1,box.width*.2,Math.hypot(dx,dy));
   x = dx/distance;
   y = dy/distance;
  }
 }
 chassis.style.setProperty('--gaze-x',((x<0?23:13)*x/1320*chassis.clientWidth)+'px');
 chassis.style.setProperty('--gaze-y',((y<0?24:9)*y/1600*chassis.clientHeight)+'px');
 stage.style.setProperty('--look-axis',(-y)+' '+x+' 0 '+(Math.hypot(x,y)*5)+'deg');
 stage.style.setProperty('--look-offset',(x*0.55)+'% '+(y*0.22)+'%');
}
function queueGaze(){if(!gazeFrame) gazeFrame=requestAnimationFrame(updateGaze)}
function restGaze(){gazePointer=null;queueGaze()}
window.addEventListener('pointermove',event=>{
 if(!gazeEnabled.matches || event.pointerType==='touch') return;
 gazePointer={x:event.clientX,y:event.clientY};queueGaze();
},{passive:true});
document.documentElement.addEventListener('pointerleave',restGaze);
window.addEventListener('blur',restGaze);
window.addEventListener('scroll',()=>{if(gazePointer) queueGaze()},{passive:true});
window.addEventListener('resize',queueGaze);

receiptImage.addEventListener('animationend',event=>{
 if(event.animationName==='feed' && stage.classList.contains('anim')){
  stage.classList.add('print-finished');
  queueGaze();
 }
});
receiptImage.addEventListener('animationstart',event=>{
 if(event.animationName==='feed') stage.classList.remove('print-finished');
});
window.setInterval(()=>{
 if(!document.hidden && gazeEnabled.matches && stage.classList.contains('print-finished') &&
    machineLayer.getBoundingClientRect().bottom>0 && !gazePointer) queueGaze();
},90);

const aboutTitle = aboutScene.querySelector('.layer.about');
bounceTitles(aboutTitle, () => aboutTitle);
