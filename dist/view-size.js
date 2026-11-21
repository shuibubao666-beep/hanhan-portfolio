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
  try { slider.value = localStorage.getItem(preference) || '90'; } catch {}

  function resize() {
    root.style.setProperty('--view-scale', slider.value / 100);
    output.value = `${slider.value}%`;
    slider.setAttribute('aria-valuetext', output.value);
  }
  resize();
  slider.addEventListener('input', () => {
    resize();
    try { localStorage.setItem(preference, slider.value); } catch {}
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
      for (const image of pages.querySelectorAll('figure > img')) {
        image.parentElement.style.setProperty('--page-ratio', Number(image.getAttribute('width')) / Number(image.getAttribute('height')));
      }
      project.style.setProperty('--project-height', `max(140px, calc(100dvh - ${bar.offsetHeight + 16}px))`);
    }
    new ResizeObserver(fitProject).observe(bar);
    new MutationObserver(fitProject).observe(pages, { childList: true });
    fitProject();
    const reset = project.querySelector('[data-zoom="reset"]');
    reset.title = '恢复整张适屏';
    reset.setAttribute('aria-label', reset.title);
  }
})();
