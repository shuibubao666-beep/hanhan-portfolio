
(function(){
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════
     五个点击入口 —— DOM 顺序即 nth-child 序号,也是抽出 stagger 的顺序
     01 = 左上 = .folio__ticket:nth-child(1) = assets/ticket-01.png = IP设计 / 云端木棉岛
     02 = 左下 = .folio__ticket:nth-child(2) = assets/ticket-02.png = Aigc视觉设计 / H5设计、TVC、KV
     03 = 正中 = .folio__ticket:nth-child(3) = assets/ticket-03.png = 品牌设计 / 流浪星球——动物救助品牌
     04 = 右下 = .folio__ticket:nth-child(4) = assets/ticket-04.png = KV设计 / 泡泡玛特20周年主题KV
     05 = 右上 = .folio__ticket:nth-child(5) = assets/ticket-05.png = UI设计 / 湖北省博小程序页面设计
     href 留空 = 点击走放大预览(当前默认行为);填入地址 = 点击跳转到该项目页
     ═══════════════════════════════════════════════════════════════════ */
  var FOLIO_PROJECTS = [
    { index:'01', name:'IP设计 / 云端木棉岛',            href:'#project-1' },
    { index:'02', name:'Aigc视觉设计 / H5设计、TVC、KV',  href:'#project-2' },
    { index:'03', name:'品牌设计 / 流浪星球——动物救助品牌', href:'#project-3' },
    { index:'04', name:'KV设计 / 泡泡玛特20周年主题KV',    href:'#project-4' },
    { index:'05', name:'UI设计 / 湖北省博小程序页面设计',  href:'#project-5' }
  ];

  function init(){
    var root        = document.getElementById('folio');
    if (!root) return;
    var flap        = document.getElementById('folio-flap');
    var folderBack  = document.getElementById('folio-folder-back');
    var hint        = document.getElementById('folio-hint');
    var overlay     = document.getElementById('folio-overlay');
    var overlayImg  = document.getElementById('folio-overlay-img');
    var overlayClose= document.getElementById('folio-overlay-close');
    var tickets     = Array.prototype.slice.call(root.querySelectorAll('.folio__ticket'));
    var titleStar   = root.querySelector('.folio__t-star');
    var titleLetters= root.querySelector('.folio__t-letters');
    var reduceMQ    = window.matchMedia('(prefers-reduced-motion: reduce)');
    var lastTicket  = null;
    var isOpen = false, busy = false, openedOnce = false;

    /* ── B3 · 容器宽度驱动缩放:--fs = clientWidth / 1440(不再用视口宽高) ── */
    function fit(){
      var w = root.clientWidth;
      if (w > 0) root.style.setProperty('--fs', w / 1440);
    }
    if ('ResizeObserver' in window){
      new ResizeObserver(fit).observe(root);
    }
    window.addEventListener('resize', fit);
    fit();

    /* ── C · 标题入场:IntersectionObserver 首次进入视口触发一次 ──
       基础 CSS 即完全可见静止态;is-intro 只播一次入场,IO 失效也不空白 */
    if ('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if (en.isIntersecting){
            root.classList.add('is-intro');
            io.unobserve(root);
          }
        });
      }, { threshold: 0.3 });
      io.observe(root);
    } else {
      root.classList.add('is-intro'); /* IO 不可用:退回加载即播 */
    }

    /* ── B7 · 浮层滚动锁:保存原值→hidden→精确还原(含原值为空字符串) ── */
    var savedBodyOverflow = null;
    function lockScroll(){
      if (savedBodyOverflow === null){
        savedBodyOverflow = document.body.style.overflow; /* 可能是 '' */
        document.body.style.overflow = 'hidden';
      }
    }
    function unlockScroll(){
      if (savedBodyOverflow !== null){
        document.body.style.overflow = savedBodyOverflow; /* 原样还原 */
        savedBodyOverflow = null;
      }
    }

    /* ── D · href 非空的项目:aria-label 改为「查看项目:xxx」,点击跳转 ──
       默认(href 空)行为与原版完全一致:点击走放大预览 ── */
    tickets.forEach(function(t, i){
      var p = FOLIO_PROJECTS[i];
      if (p && p.href){
        t.setAttribute('aria-label', '查看项目:' + p.name);
      }
    });

    /* ── 标题联动脉冲:仅打开文件夹触发,WAAPI composite:'add' ── */
    function titlePulse(){
      if (reduceMQ.matches || !titleStar || !titleLetters) return;
      titleLetters.animate(
        [{transform:'rotate(0deg)'},{transform:'rotate(2deg)'},{transform:'rotate(-1deg)'},{transform:'rotate(.5deg)'},{transform:'rotate(0deg)'}],
        {duration:300, easing:'ease-in-out', composite:'add'}
      );
      titleStar.animate(
        [{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],
        {duration:300, easing:'ease-out', composite:'add'}
      );
    }

    /* ── 文件夹开合:1250ms busy 连点保护;浮层显示期间不响应 ── */
    function toggle(){
      if (busy || overlay.classList.contains('is-show')) return;
      busy = true;
      isOpen = !isOpen;
      root.classList.toggle('is-open', isOpen);
      flap.setAttribute('aria-expanded', String(isOpen));
      if (isOpen && !openedOnce){ openedOnce = true; hint.classList.add('is-gone'); }
      if (isOpen) titlePulse();
      window.setTimeout(function(){ busy = false; }, 1250);
    }
    flap.addEventListener('click', toggle);
    folderBack.addEventListener('click', toggle);
    flap.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); }
    });

    /* ── 小票点击:仅打开态;href 非空跳转,否则放大预览 ── */
    function onTicketClick(t, i){
      if (!isOpen) return;
      var p = FOLIO_PROJECTS[i];
      if (p && p.href){ window.location.href = p.href; return; }
      openPreview(t);
    }
    function openPreview(ticket){
      var img = ticket.querySelector('img');
      lastTicket = ticket;
      overlayImg.src = img.src;
      overlay.classList.add('is-show');
      lockScroll();
      window.setTimeout(function(){ overlayClose.focus(); }, 60);
    }
    function closePreview(){
      if (!overlay.classList.contains('is-show')) return;
      overlay.classList.remove('is-show');
      unlockScroll();
      if (lastTicket){ lastTicket.focus(); lastTicket = null; }
    }
    tickets.forEach(function(t, i){
      t.addEventListener('click', function(){ onTicketClick(t, i); });
    });
    overlay.addEventListener('click', function(e){
      if (e.target === overlay) closePreview(); /* 遮罩自身点击关闭 */
    });
    overlayClose.addEventListener('click', closePreview);
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') closePreview();
    });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
