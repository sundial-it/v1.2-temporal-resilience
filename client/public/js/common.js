/* ============================================================
   SUNDIAL IT CONSULTANCY — COMMON.JS
   Site-wide behavior shared by every page: nav/footer loading,
   the background canvas, cursor, audio beeps, toast pop-ups,
   the waitlist modal, and scroll-reveal animations.

   Page-specific features (the cipher sandbox, the shadow-grid
   canvas, the AI oracle chat) live in their own /js/*.js files
   and are only loaded on the pages that need them.
   ============================================================ */

/* ---------- 1. HIGHLIGHT THE CURRENT PAGE IN THE NAV ----------
   The nav and footer are pasted directly into every page (instead of
   being fetched from a separate file), so this site works just by
   double-clicking any .html file — no local server needed. The
   trade-off: if you change the menu, update it in all 6 pages. See
   README.md for a quick find-and-replace way to do that. */
function highlightActiveNav() {
  const current = document.body.getAttribute('data-page');
  if (!current) return;
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('data-page') === current) {
      link.classList.add('active');
    }
  });
}

/* ---------- 2. INJECT SHARED WIDGETS (TOAST + WAITLIST MODAL) ---------- */
function injectWidgets() {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div id="toast" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 max-w-sm bg-[#141009] border-l-4 border-[#ffd54f] p-4 shadow-xl cyber-clip-sm flex gap-3 items-start">
      <span id="toast-icon" class="text-lg">🤖</span>
      <div class="text-left">
        <h4 id="toast-title" class="font-mono text-xs font-bold text-white uppercase">Security Alert</h4>
        <p id="toast-msg" class="font-mono text-[0.7rem] text-[#6e5e49] mt-1 leading-relaxed"></p>
      </div>
    </div>

    <div id="waitlist-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050402]/90 backdrop-blur-md hidden">
      <div class="w-full max-w-md bg-[#141009] border border-[#ffd54f]/30 p-6 cyber-clip relative">
        <button onclick="closeWaitlistModal()" class="absolute top-4 right-4 text-[#6e5e49] hover:text-white font-mono text-lg">&times;</button>
        <h3 class="font-mono text-sm font-semibold tracking-wider text-[#ffd54f] uppercase mb-2">// SUNDIAL BETA ACCESS</h3>
        <p class="text-xs text-[#6e5e49] mb-6">Enter your organizational email to register chronological security credentials.</p>
        <div class="space-y-4">
          <div class="text-left">
            <label class="block font-mono text-[0.6rem] text-[#6e5e49] uppercase mb-1">Secure Domain Mailbox</label>
            <input type="email" id="modal-email" class="w-full bg-[#020408] border border-[#6e5e49]/40 text-xs text-white p-2.5 font-mono focus:outline-none focus:border-[#ffd54f]" placeholder="security@organization.com">
          </div>
          <div class="text-left">
            <label class="block font-mono text-[0.6rem] text-[#6e5e49] uppercase mb-1">Target Vulnerability Area</label>
            <select id="modal-concern" class="w-full bg-[#020408] border border-[#6e5e49]/40 text-xs text-[#cfe4f7] font-mono p-2.5 focus:outline-none focus:border-[#ffd54f]">
              <option>Chronological Handshake Decryption</option>
              <option>Quantum Interception Mitigations</option>
              <option>Long-Term Cold Vault Protection</option>
              <option>Intellectual Property Enclosure</option>
            </select>
          </div>
          <button id="modal-submit-btn" class="w-full py-3 bg-[#ffd54f] text-black font-mono text-xs font-bold uppercase hover:opacity-85 transition-opacity">GENERATE SECURE TOKEN</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);

  // wire modal submit after injection
  setTimeout(() => {
    const btn = document.getElementById('modal-submit-btn');
    if (btn) btn.addEventListener('click', submitModalWaitlist);
  }, 30);
}

function openWaitlistModal() {
  triggerBeep(520, 0.08);
  document.getElementById('waitlist-modal').classList.remove('hidden');
}
function closeWaitlistModal() {
  triggerBeep(330, 0.08);
  document.getElementById('waitlist-modal').classList.add('hidden');
}

async function submitModalWaitlist() {
  const emailEl = document.getElementById('modal-email');
  const concernEl = document.getElementById('modal-concern');
  const email = emailEl ? emailEl.value.trim() : '';
  const concern = concernEl ? concernEl.value : '';
  if (!email || !email.includes('@')) {
    showToast("Verification Error", "Please provide a valid secure domain address.", "❌", "var(--red)");
    return;
  }

  // send to server API if available
  try {
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, concern })
    });
    if (res.ok) {
      const data = await res.json();
      closeWaitlistModal();
      showToast("Waitlist Verified", "Reservation saved (id: " + (data.id || 'n/a') + ")", "🔑", "var(--green)");
      return;
    }
    throw new Error('Network response not ok');
  } catch (err) {
    // fallback to client-side token display if server unavailable
    closeWaitlistModal();
    showToast("Offline Registration", "Local reservation code: " + crypto.randomUUID().slice(0, 8).toUpperCase(), "🔑", "var(--gold)");
    console.warn('Waitlist submit failed:', err);
  }
}

/* ---------- 3. TOAST NOTIFICATIONS ---------- */
function showToast(title, message, icon = "🤖", border = "var(--gold)") {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-msg').textContent = message;
  document.getElementById('toast-icon').textContent = icon;
  toast.style.borderColor = border;

  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');
  triggerBeep(580, 0.12);

  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 4500);
}

/* ---------- 4. CLIENT-SIDE AUDIO ENGINE ---------- */
let audioCtx = null;
let isMuted = true;

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function toggleAudio() {
  initAudioContext();
  isMuted = !isMuted;
  const icon = document.getElementById('audio-icon');
  const btn = document.getElementById('audio-toggle');
  if (!icon || !btn) return;

  if (isMuted) {
    icon.innerHTML = `<path d="M3.27 1.44L2 2.72l4.28 4.28L3 11H1v2h2l4 4v-4.11l4 4V23l-5.64-5.64l1.42-1.42L11 19.17V17.8l6.32 6.32l1.28-1.28L3.27 1.44M11 5L8.54 7.46l1.41 1.41L11 7.83V5m7 7c0-1.72-.77-3.26-2-4.3V5.5c2.75 1.16 4.5 3.93 4.5 7.5c0 1.93-.5 3.73-1.39 5.31l-1.46-1.46c.53-1.12.85-2.38.85-3.85m-3 0c0-.58-.16-1.13-.41-1.62l-1.5 1.5c.06.04.09.08.09.12c0 .83-.67 1.5-1.5 1.5c-.04 0-.08-.03-.12-.09l-1.5 1.5c.49.25 1.04.41 1.62.41c1.93 0 3.5-1.57 3.5-3.5z"/>`;
    btn.style.color = 'var(--muted)';
    btn.style.borderColor = 'rgba(110, 94, 73, 0.4)';
  } else {
    icon.innerHTML = `<path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.01,19.86 21,16.28 21,12C21,7.72 18.01,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>`;
    btn.style.color = 'var(--gold)';
    btn.style.borderColor = 'var(--gold)';
    triggerBeep(480, 0.08);
    setTimeout(() => triggerBeep(580, 0.08), 100);
    setTimeout(() => triggerBeep(720, 0.12), 200);
  }
}

function triggerBeep(freq, duration, type = 'sine') {
  if (isMuted) return;
  try {
    initAudioContext();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn("Audio Context offline:", e);
  }
}

/* ---------- 5. INTERACTIVE CURSOR ---------- */
function initCursor() {
  const cur = document.getElementById('cur');
  if (!cur) return;
  document.addEventListener('mousemove', (e) => {
    cur.style.left = e.clientX + 'px';
    cur.style.top = e.clientY + 'px';
  });
}

/* ---------- 6. BACKGROUND SUNDIAL ORBIT CASCADE CANVAS ---------- */
function initBackgroundCanvas() {
  const canvas = document.getElementById('enc-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const nodes = [];
  for (let i = 0; i < 40; i++) {
    nodes.push({
      x: Math.random() * 2000,
      y: Math.random() * 1400,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      r: 0.8 + Math.random() * 1.5,
      alpha: 0.2 + Math.random() * 0.5
    });
  }

  function drawFrame() {
    ctx.fillStyle = 'rgba(5,4,2,0.12)';
    ctx.fillRect(0, 0, W, H);

    const centerX = W / 2;
    const centerY = H / 2;
    const maxRadius = Math.max(W, H) * 0.45;

    ctx.strokeStyle = 'rgba(255, 213, 79, 0.015)';
    ctx.lineWidth = 1;

    for (let r = 80; r < maxRadius; r += 120) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 213, 79, 0.025)';
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
        const notchX = centerX + Math.cos(angle) * r;
        const notchY = centerY + Math.sin(angle) * r;
        ctx.beginPath();
        ctx.arc(notchX, notchY, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      nodes[i].x += nodes[i].vx;
      nodes[i].y += nodes[i].vy;
      if (nodes[i].x < 0) nodes[i].x = W;
      if (nodes[i].x > W) nodes[i].x = 0;
      if (nodes[i].y < 0) nodes[i].y = H;
      if (nodes[i].y > H) nodes[i].y = 0;

      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 160) {
          const a = (1 - d / 160) * 0.035;
          ctx.strokeStyle = 'rgba(255,213,79,' + a + ')';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }

      ctx.fillStyle = 'rgba(255,213,79,' + nodes[i].alpha * 0.15 + ')';
      ctx.beginPath();
      ctx.arc(nodes[i].x, nodes[i].y, nodes[i].r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(drawFrame);
  }
  drawFrame();
}

/* ---------- 7. SCROLL-TRIGGERED REVEALS ---------- */
function initScrollReveal() {
  const rvEls = document.querySelectorAll('.rv');
  if (!rvEls.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  rvEls.forEach((el) => obs.observe(el));
}

/* ---------- 8. BOOT SEQUENCE (runs on every page) ---------- */
document.addEventListener('DOMContentLoaded', () => {
  highlightActiveNav();
  injectWidgets();
  initCursor();
  initBackgroundCanvas();
  initScrollReveal();
});
