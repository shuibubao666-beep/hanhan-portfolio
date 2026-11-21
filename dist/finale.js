const scene=document.querySelector('main'), word=scene.querySelector('.word');
const star='polygon(52.8% 0,62% 0,62% 27%,55.5% 28%,54% 22%,52.8% 18%)';

function piece(clip,index,pivot,kind=''){
 const el=document.createElement('span');
 el.className='piece '+kind;
 el.style.setProperty('--clip',clip);
 el.style.setProperty('--delay',index*45+'ms');
 el.style.setProperty('--pivot',pivot+'%');
 word.append(el);
}
const base=document.createElement('div');
base.style.cssText='position:absolute;inset:0';
word.append(base);
// Subtract the two animated decorations from the letter artwork.
const mask=document.createElement('canvas');mask.width=2048;mask.height=606;
const ctx=mask.getContext('2d');ctx.fillRect(0,0,2048,606);ctx.globalCompositeOperation='destination-out';
for(const polygon of [star]){
 ctx.beginPath();polygon.slice(8,-1).split(',').forEach((pt,i)=>{const [x,y]=pt.trim().split(' ').map(parseFloat);ctx[i?'lineTo':'moveTo'](x*20.48,y*6.06)});ctx.closePath();ctx.fill();
}
base.style.maskImage='url('+mask.toDataURL()+')';base.style.maskSize='100% 100%';
const edges=[0,16.2,27.2,37.2,47.1,60.4,72,82,92,100];
edges.slice(1).forEach((right,i)=>{piece('inset(0 '+(100-right)+'% 0 '+edges[i]+'%)',i,(right+edges[i])/2);base.append(word.lastChild)});
piece(star,4,57,'star');
const pair = new Image();
pair.className = 'title-pair';
pair.alt = '';
pair.src = 'assets/finale/pair.webp';
word.append(pair);
let pairPixels;
pair.decode().then(() => {
 const canvas = document.createElement('canvas');
 canvas.width = pair.naturalWidth;
 canvas.height = pair.naturalHeight;
 const context = canvas.getContext('2d');
 context.drawImage(pair, 0, 0);
 pairPixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
});
const hit=scene.querySelector('.hit'),close=scene.querySelector('.close');
function setOpen(open){
 scene.classList.toggle('open',open);hit.setAttribute('aria-expanded',open);
 close.hidden=!open;(open?close:hit).focus({preventScroll:true});
}
hit.onclick=()=>setOpen(true);close.onclick=()=>setOpen(false);
document.addEventListener('click',e=>{if(scene.classList.contains('open')&&!e.target.closest('.note'))setOpen(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&scene.classList.contains('open'))setOpen(false)});
scene.onpointermove=e=>{if(e.pointerType==='touch')return;const r=scene.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;for(const [key,value] of Object.entries({x:x*4,y:y*4,bx:-x*6,by:-y*6}))scene.style.setProperty('--'+key,value+'px')};
scene.onpointerleave=()=>scene.removeAttribute('style');

bounceTitles(word, event => {
 const bounds = word.getBoundingClientRect();
 const percent = (event.clientX - bounds.left) / bounds.width * 100;
 const x = Math.floor(percent / 100 * pair.naturalWidth);
 const y = Math.floor((event.clientY - bounds.top) / bounds.height * pair.naturalHeight);
 if (pairPixels?.[4 * (y * pair.naturalWidth + x) + 3] > 16) return pair;
 const index = edges.slice(1).findIndex(right => percent < right);
 return base.children[index];
});
