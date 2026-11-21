// Animate individual transform properties so contact can overlap the entrance.
function bounceTitles(surface, targetAt) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const playing = new WeakMap();
  let previous;
  function touch(event) {
    if (reduced.matches) return;
    const target = targetAt(event);
    if (!target || target === previous) return;
    previous = target;
    if (playing.get(target)?.playState === 'running') return;
    const frames = [
      { translate:'0 0', scale:'1' },
      { translate:'0 1%', scale:'1.012 .98', offset:.14 },
      { translate:'0 -4%', scale:'.99 1.035', offset:.42 },
      { translate:'0 .8%', scale:'1.007 .99', offset:.72 },
      { translate:'0 0', scale:'1' }
    ];
    if (target.classList.contains("title-pair")) frames.forEach(frame => delete frame.scale);
    const animation = target.animate(frames, { duration:440, easing:'ease-in-out' });
    playing.set(target, animation);
  }
  surface.addEventListener('pointermove', touch);
  surface.addEventListener('pointerdown', touch);
  surface.addEventListener('pointerleave', () => { previous = null; });
}
