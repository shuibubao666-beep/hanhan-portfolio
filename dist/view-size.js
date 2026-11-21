(() => {
  const tools = document.createElement('div');
  tools.className = 'view-tools';
  tools.innerHTML = '<label>画面大小 <input type="range" min="60" max="100" step="5" value="90"></label><output aria-hidden="true"></output><button type="button" hidden>全屏</button>';
  document.body.append(tools);
  const slider = tools.querySelector('input');
  const output = tools.querySelector('output');
  const fullscreen = tools.querySelector('button');
  const root = document.documentElement;
  const preference = 'portfolio-view-size';
  let pageSize = '90';
  let introSize = '100';
  try { pageSize = localStorage.getItem(preference) || pageSize; } catch {}
  const inIntro = () => document.body.classList.contains('intro-active');

  function resize() {
    root.style.setProperty('--view-scale', pageSize / 100);
    root.style.setProperty('--intro-scale', introSize / 100);
    output.value = `${slider.value}%`;
    slider.setAttribute('aria-valuetext', output.value);
  }
  function syncSlider() {
    slider.value = inIntro() ? introSize : pageSize;
    resize();
  }
  syncSlider();
  new MutationObserver(syncSlider).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  slider.addEventListener('input', () => {
    if (inIntro()) introSize = slider.value;
    else {
      pageSize = slider.value;
      try { localStorage.setItem(preference, pageSize); } catch {}
    }
    resize();
  });

  if (document.fullscreenEnabled) {
    fullscreen.hidden = false;
    fullscreen.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await root.requestFullscreen();
      } catch { fullscreen.textContent = '全屏不可用'; }
    });
    document.addEventListener('fullscreenchange', () => {
      fullscreen.textContent = document.fullscreenElement ? '退出全屏' : '全屏';
    });
  }

  const project = document.querySelector('#project');
  if (project) {
    const bar = project.querySelector('.project-bar');
    const pages = project.querySelector('#project-pages');
    function fitProject() {
      const firstPage = pages.querySelector('figure > img');
      if (!firstPage || !project.open) return;
      const ratio = Number(firstPage.getAttribute('width')) / Number(firstPage.getAttribute('height'));
      const availableHeight = Math.max(140, project.clientHeight - bar.offsetHeight - 16);
      project.style.setProperty('--project-fit-width', `${availableHeight * ratio}px`);
    }
    new ResizeObserver(fitProject).observe(bar);
    window.addEventListener('resize', fitProject);
    document.addEventListener('fullscreenchange', fitProject);
    new MutationObserver(fitProject).observe(pages, { childList: true });
    fitProject();
    const reset = project.querySelector('[data-zoom="reset"]');
    reset.title = '恢复统一适屏宽度';
    reset.setAttribute('aria-label', reset.title);
  }
})();
