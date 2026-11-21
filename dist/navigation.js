const menu = document.querySelector('#section-nav');
const menuLinks = Array.from(menu.querySelectorAll('a[href^="#"]'));
const aboutSection = document.querySelector('#about');
const directory = document.querySelector('#contents');
function syncNavigation(){
 const marker = Math.min(200, innerHeight * .3);
 const bottom = window.scrollY > 0 && window.scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
 const selected = !directory.hidden ? '#contents'
   : bottom || aboutSection.getBoundingClientRect().top <= marker ? '#about' : '#home';
 for (const link of menuLinks) {
   if (link.hash === selected) link.setAttribute('aria-current','location');
   else link.removeAttribute('aria-current');
 }
}
function moveToSection(hash, smooth){
 if (!menuLinks.some(link=>link.hash===hash)) return;
 if (hash !== '#home' && document.body.classList.contains('intro-active')) {
   stopSequence();
   finishIntro();
 }
 requestAboutEntry(hash);
 const standalone = hash === '#contents';
 const changed = directory.hidden === standalone;
 directory.hidden = !standalone;
 document.querySelector('#home').hidden = standalone;
 for(const id of ['back','back-bottom']) document.getElementById(id).textContent = standalone ? '← 返回目录' : '← 返回首页';
 if(changed) smooth=false;
 document.querySelector(hash).scrollIntoView({behavior:smooth && !matchMedia('(prefers-reduced-motion:reduce)').matches?'smooth':'instant'});
 syncNavigation();
}
menu.addEventListener('click',event=>{
 const link=event.target.closest('a');
 if (!menuLinks.includes(link) || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
 event.preventDefault();
 if (location.hash!==link.hash) history.pushState(null,'',link.hash);
 moveToSection(link.hash,true);
});
window.addEventListener('hashchange',()=>moveToSection(location.hash || '#home',false));
window.addEventListener('scroll',syncNavigation,{passive:true});
window.addEventListener('resize',syncNavigation);
moveToSection(location.hash,false);
syncNavigation();
