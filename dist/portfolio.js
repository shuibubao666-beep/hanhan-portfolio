const pageSizes={"4":[931,1400],"5":[912,1400],"6":[1400,829],"7":[1400,829],"8":[1400,828],"9":[1400,827],"10":[795,1400],"11":[1181,1400],"12":[1400,1064],"13":[1400,1147],"14":[1400,912],"15":[1361,1400],"16":[1102,1400],"17":[1400,1395],"18":[1241,1400],"19":[1241,1400],"20":[1400,910],"21":[1400,788],"22":[1400,787],"23":[1400,1196],"24":[676,1400],"25":[1400,818],"26":[1400,854],"27":[1400,808],"28":[1400,619],"29":[1400,1091],"30":[1372,1400],"31":[1205,1400],"32":[973,1400],"33":[1400,910],"34":[1400,763],"35":[787,1400],"36":[768,1400],"37":[792,1400],"38":[1400,788],"39":[1400,788],"40":[1240,1400],"41":[1400,797],"42":[1400,788],"43":[1400,788],"44":[1109,1400],"45":[1400,788],"46":[1400,788],"47":[1400,1255],"48":[1400,1373],"49":[1400,1336],"50":[1400,882],"51":[1400,902],"52":[1400,742],"53":[1400,787],"54":[1400,773],"55":[1400,788],"56":[1400,781],"57":[1400,788],"58":[1400,788],"59":[1400,788],"60":[1400,788],"61":[1400,1172],"62":[1400,788],"63":[1400,788],"64":[1400,895],"65":[1400,934],"66":[1400,788],"67":[1204,1400],"68":[1400,655],"69":[1400,849],"70":[1400,1226],"71":[1160,1400],"72":[1072,1400],"73":[1400,986],"74":[1400,1066],"75":[1400,910],"76":[1400,899],"77":[1163,1400]};
const $=s=>document.querySelector(s);
const projects=[
 {title:'云端木棉岛',type:'IP DESIGN',range:[4,20],rect:[4.8,49,20,20],angle:8},
 {title:'AIGC视觉设计',type:'AIGC VISUAL',range:[21,37],rect:[33,77,28.5,20],angle:2},
 {title:'流浪星球',type:'BRAND DESIGN',range:[38,54],rect:[6.5,78.5,23.5,16],angle:-7},
 {title:'执笔宣战',type:'KV DESIGN',range:[55,66],rect:[70.7,49.8,23,16.5],angle:-8},
 {title:'湖北省博物馆界面设计',type:'UI DESIGN',range:[67,77],rect:[68,71,20,14],angle:5}
];
const hotspots=$('#hotspots'),film=$('#film'),intro=$('#intro'),start=$('#start'),skip=$('#skip'),status=$('#status'),dialog=$('#project');
projects.forEach((p,i)=>{
 const [x,y,w,h]=p.rect;
 hotspots.insertAdjacentHTML('beforeend',`<a href="#project-${i+1}" class="hotspot stamp" data-project="${i}" aria-label="查看${p.title}" title="${p.title}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%;--angle:${p.angle}deg"></a><a href="#project-${i+1}" class="hotspot receipt" data-project="${i}" aria-label="${String([2,1,3,4,5][i]).padStart(2,'0')} ${p.type} · ${p.title}" title="${p.title}" style="left:35.2%;top:${57.15+([1,0,2,3,4][i])*2.55}%;width:24.5%;height:2.3%"></a>`);
});
let finished=false,playing=false,lastFocus=null,homeScroll=0,active=0;
function finishIntro(){if(finished)return;finished=true;playing=false;film.pause();intro.classList.add('finished');document.body.classList.remove('intro-active');skip.hidden=true;status.hidden=true;setTimeout(()=>{if(finished){intro.hidden=true;intro.inert=true}},750)}
async function playIntro(){finished=false;playing=true;intro.hidden=false;intro.inert=false;intro.classList.remove('finished');document.body.classList.add('intro-active');window.scrollTo(0,0);start.hidden=true;skip.hidden=false;status.hidden=true;film.currentTime=0;try{await film.play()}catch{playing=false;start.hidden=false;status.hidden=false;status.textContent='点击画面播放，或跳过开场'}}
start.onclick=playIntro;skip.onclick=finishIntro;$('#replay').onclick=playIntro;
film.addEventListener('ended',finishIntro);film.addEventListener('playing',()=>status.hidden=true);film.addEventListener('waiting',()=>{if(playing){status.textContent='正在加载开场…';status.hidden=false}});film.addEventListener('error',()=>{status.textContent='视频暂时无法播放，可跳过进入作品集';status.hidden=false;skip.hidden=false});
const projectFilms = {
  20: {name:'云端木棉岛', file:'kapok', area:[3.4,1.5,93.2,92]},
  29: {name:'3CE 唇釉', file:'3ce', area:[4.5,64.4,43.7,32]},
  30: {name:'LILYBYRED 腮红膏', file:'lilybyred', area:[49,62.2,43.6,24.5]},
  31: {name:'小米澎湃 N90 Max', file:'xiaomi', area:[6.4,74.6,43.7,21.7]}
};
let projectPlayer;
function playProjectFilm(item) {
  const player = document.createElement('dialog');
  projectPlayer = player;
  player.className = 'project-film-player';
  player.setAttribute('aria-label', item.name);
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = '关闭视频 ×';
  close.onclick = () => player.close();
  const video = document.createElement('video');
  video.controls = true;
  video.playsInline = true;
  video.src = 'assets/films/' + item.file + '.mp4';
  player.append(close, video);
  document.body.append(player);
  player.onclick = e => { if(e.target === player) player.close(); };
  player.onclose = () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
    player.remove();
    if(projectPlayer === player) projectPlayer = null;
  };
  player.showModal();
  video.play().catch(() => { /* Native controls allow another play attempt. */ });
}
function addFilmEntry(figure, item) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'project-film-entry';
  button.setAttribute('aria-label','播放视频：' + item.name);
  button.setAttribute('aria-haspopup','dialog');
  const [x,y,w,h] = item.area;
  Object.assign(button.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});
  if(item.file === 'kapok') {
    const label = document.createElement('span');
    label.textContent = '▶ 播放短片';
    button.append(label);
  }
  button.onclick = () => playProjectFilm(item);
  figure.style.position = 'relative';
  figure.append(button);
}
const zoomSteps = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
let readerScale = 1;
try {
  const saved = Number(localStorage.getItem('project-reader-scale'));
  if (zoomSteps.includes(saved)) readerScale = saved;
} catch {}
const zoomBar = document.querySelector('.reader-zoom');
function updateZoom(scale) {
  readerScale = scale;
  dialog.style.setProperty('--reader-scale', scale);
  zoomBar.querySelector('[data-zoom="reset"]').textContent = Math.round(scale * 100) + '%';
  zoomBar.querySelector('[data-zoom="out"]').disabled = scale === zoomSteps[0];
  zoomBar.querySelector('[data-zoom="in"]').disabled = scale === zoomSteps.at(-1);
}
updateZoom(readerScale);
zoomBar.addEventListener('click', event => {
  const action = event.target.closest('button')?.dataset.zoom;
  if (!action) return;
  const pages = document.querySelector('#project-pages');
  const centerX = dialog.clientWidth / 2;
  const centerY = (dialog.clientHeight + zoomBar.closest('header').offsetHeight) / 2;
  const before = pages.getBoundingClientRect();
  const x = (centerX - before.left) / before.width;
  const y = (centerY - before.top) / before.height;
  const scale = action === 'reset' ? 1 : zoomSteps[zoomSteps.indexOf(readerScale) + (action === 'in' ? 1 : -1)];
  if (!zoomSteps.includes(scale)) return;
  updateZoom(scale);
  const after = pages.getBoundingClientRect();
  dialog.scrollBy({left: after.left + x * after.width - centerX, top: after.top + y * after.height - centerY, behavior:'instant'});
  try { localStorage.setItem('project-reader-scale', scale); } catch {}
});
const sectionNav = $('#aigc-sections');
const sectionButtons = [...sectionNav.querySelectorAll('button')];
const readerBar = sectionNav.closest('header');
function syncSection() {
  if (sectionNav.hidden || !dialog.open) return;
  const readingLine = readerBar.getBoundingClientRect().bottom + 2;
  let current = sectionButtons[0];
  for (const button of sectionButtons) {
    const page = document.getElementById('aigc-page-' + button.dataset.page);
    if (page && page.getBoundingClientRect().top <= readingLine) current = button;
  }
  for (const button of sectionButtons) {
    if (button === current) button.setAttribute('aria-current', 'location');
    else button.removeAttribute('aria-current');
  }
}
sectionNav.addEventListener('click', event => {
  const button = event.target.closest('button[data-page]');
  if (!button) return;
  const page = document.getElementById('aigc-page-' + button.dataset.page);
  if (!page) return;
  dialog.scrollTo({top: dialog.scrollTop + page.getBoundingClientRect().top - readerBar.getBoundingClientRect().bottom, left: 0, behavior: 'instant'});
  syncSection();
});
dialog.addEventListener('scroll', syncSection, {passive:true});
window.addEventListener('resize', syncSection);
function renderProject(i){active=i;sectionNav.hidden=i!==1;const p=projects[i];$('#project-title').textContent=p.title;$('#project-number').textContent=String(i+1).padStart(2,'0')+' / '+p.type;$('#page-count').textContent=(p.range[1]-p.range[0]+1)+' PAGES';$('#next').textContent='下一项目 · '+projects[(i+1)%5].title+' →';const pages=$('#project-pages');pages.replaceChildren();for(let n=p.range[0];n<=p.range[1];n++){const f=document.createElement('figure'),im=new Image();const filename=`work-${String(n).padStart(2,'0')}.jpg`;im.src='assets/project-originals/'+filename+'?edition=hd2';im.alt=p.title+' · 第'+(n-p.range[0]+1)+'页';im.loading=n===p.range[0]?'eager':'lazy';im.decoding='async';[im.width,im.height]=pageSizes[n];if(i===1)f.id='aigc-page-'+n;f.append(im);if(projectFilms[n])addFilmEntry(f,projectFilms[n]);pages.append(f)}dialog.scrollLeft=0;dialog.scrollTop=0;syncSection();document.title=p.title+' · 刘含颖作品集'}
function openProject(i){if(!dialog.open){lastFocus=document.activeElement;homeScroll=window.scrollY;dialog.showModal();document.body.classList.add('viewer-open')}renderProject(i);$('#back').focus({preventScroll:true})}
function closeProject(){if(!dialog.open)return;dialog.close();document.body.classList.remove('viewer-open');document.title='刘含颖 · Portfolio';window.scrollTo({top:homeScroll,behavior:'instant'});lastFocus?.focus({preventScroll:true})}
function route(){if(projectPlayer?.open)projectPlayer.close();const m=location.hash.match(/^#project-([1-5])$/);if(m){finishIntro();openProject(Number(m[1])-1)}else closeProject()}
hotspots.addEventListener('click',e=>{const a=e.target.closest('[data-project]');if(!a)return;if(location.hash===a.hash)openProject(+a.dataset.project)});
for(const a of hotspots.querySelectorAll('a')){const sync=on=>hotspots.querySelectorAll(`[data-project="${a.dataset.project}"]`).forEach(x=>x.classList.toggle('linked',on));a.addEventListener('pointerenter',()=>sync(true));a.addEventListener('pointerleave',()=>sync(false));a.addEventListener('focus',()=>sync(true));a.addEventListener('blur',()=>sync(false))}
function goHome(){location.hash=document.querySelector('#contents').hidden?'home':'contents'}$('#back').onclick=goHome;$('#back-bottom').onclick=goHome;$('#next').onclick=()=>location.hash='project-'+((active+1)%5+1);dialog.addEventListener('cancel',e=>{e.preventDefault();goHome()});window.addEventListener('hashchange',route);route();
