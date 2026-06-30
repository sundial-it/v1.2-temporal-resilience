/* HOME PAGE JS copied for client/public */
document.addEventListener('DOMContentLoaded', () => {
  const tickerInner = document.getElementById('ticker-inner');
  if (tickerInner) {
    const TICKER_CHARS = 'SUNDIAL_IT::SHADOW_VECTOR_LOCK::ANGLE_0x7C::TEMPORAL_RESILIENCE::NIST_LATTICE_OK::';
    let full = '';
    for (let i = 0; i < 6; i++) full += TICKER_CHARS + '  ';
    full = full + full;
    const parts = full.split('::');
    let html = '';
    for (let i = 0; i < parts.length; i++) {
      const hi = (i % 7 === 3);
      html += '<span class="ticker-item px-8 font-mono text-[0.68rem] tracking-widest uppercase ' + (hi ? 'text-[#ffd54f]' : 'text-[#6e5e49]/40') + '">' + parts[i] + '</span>';
    }
    tickerInner.innerHTML = html;
    tickerInner.style.minWidth = '200%';
  }

  function animCount(el, target, suffix, duration) {
    if (!el) return;
    const preservedSpan = el.querySelector('span');
    const startTime = performance.now();
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      if (preservedSpan) {
        el.firstChild.textContent = current;
      } else {
        el.textContent = current + suffix;
      }
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  let statsDone = false;
  const statsSection = document.getElementById('stats');
  if (statsSection) {
    const statsObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !statsDone) {
        statsDone = true;
        animCount(document.getElementById('s1'), 1024, ' micro-arcs', 1600);
        animCount(document.getElementById('s2'), 18, 'x', 1400);
        animCount(document.getElementById('s3'), 0, '%', 800);
        animCount(document.getElementById('s4'), 4, ' environments', 1000);
      }
    }, { threshold: 0.15 });
    statsObs.observe(statsSection);
  }
});
