/* ============================================================
   TEMPORAL SANDBOX PAGE ONLY — the client-side cipher demo.
   Loaded only by sandbox.html.
   ============================================================ */

let encryptedMemory = "";
let baseStringMemory = "";

function generateDeterministicSeed(plaintext, bits, mode) {
  let seed = 0;
  const combinedStr = plaintext + mode + bits;
  for (let i = 0; i < combinedStr.length; i++) {
    seed = (seed ^ combinedStr.charCodeAt(i) * (i + 19)) & 0xFFFFFF;
  }
  return seed;
}

function encryptAction() {
  triggerBeep(440, 0.08);
  const plain = document.getElementById('plain-input').value.trim();
  const mode = document.getElementById('cipher-mode').value;
  const bits = document.getElementById('bit-depth').value;
  const logBox = document.getElementById('sandbox-log');
  const badge = document.getElementById('operation-badge');

  if (!plain) {
    showToast("Verification Error", "Plaintext input payload is currently empty.", "❌", "var(--red)");
    return;
  }

  logBox.innerHTML = "<span class='text-white animate-pulse'>GENERATING DETERMINISTIC SHADOW SEEDS...</span>";
  badge.textContent = "ALIGNING...";
  badge.className = "font-mono text-[0.55rem] px-1.5 py-0.5 rounded bg-[#ffd54f]/25 text-[#ffd54f]";

  let step = 0;
  const interval = setInterval(() => {
    if (step === 0) {
      logBox.innerHTML = "SOLAR FLUX HARVESTED: OK<br>SOLVING POLAR LATTICE COORDINATE SCHEMAS...";
      triggerBeep(580, 0.04);
    } else if (step === 1) {
      logBox.innerHTML = "INJECTING COORDINATE NOISE ANGLE...<br>PRODUCING SYMPATHETIC SHADOW CIPHER...";
      triggerBeep(680, 0.04);
    }
    step++;
  }, 200);

  setTimeout(() => {
    clearInterval(interval);

    const seed = generateDeterministicSeed(plain, bits, mode);
    baseStringMemory = plain;

    let intermediate = "";
    for (let i = 0; i < plain.length; i++) {
      const charCode = plain.charCodeAt(i);
      const scrambled = (charCode ^ (seed + i * 43)) & 0xFF;
      intermediate += String.fromCharCode(scrambled);
    }

    const b64 = btoa(intermediate);
    let structuredOut = `SUNDIAL::${mode.toUpperCase()}::${bits}::`;

    const qSymbols = ['☼', '☾', '★', '⌬', '⚙', '⧉', '⏱', '⎈'];
    for (let i = 0; i < b64.length; i++) {
      structuredOut += b64[i];
      if (i % 5 === 0 && i > 0) {
        structuredOut += qSymbols[(seed + i) % qSymbols.length];
      }
    }
    structuredOut += "::END";
    encryptedMemory = structuredOut;

    logBox.innerHTML = `<span class='text-[#00e676]'>SHADOW FORMULATION COMPLETE // TEMP-KEY LOADED:</span><br><span class='text-white select-all font-bold font-mono text-[0.68rem]'>${structuredOut}</span>`;
    badge.textContent = "SHADOW_LOCKED";
    badge.className = "font-mono text-[0.55rem] px-1.5 py-0.5 rounded bg-[#00e676]/25 text-[#00e676]";

    showToast("Cipher Constructed", "Concentric shadow key locked via " + mode.toUpperCase() + " mechanics.", "⏱", "var(--gold)");
    triggerBeep(880, 0.15);

    document.getElementById('entropy-metric-val').textContent = (14.2 + Math.random() * 2.5).toFixed(4) + " Arc/ms";
  }, 700);
}

function decryptAction() {
  triggerBeep(350, 0.08);
  const logBox = document.getElementById('sandbox-log');
  const badge = document.getElementById('operation-badge');

  if (!encryptedMemory) {
    showToast("Audit Failed", "No dynamic cipher exists inside Gnomon memory registers.", "⚠️", "var(--gold)");
    logBox.innerHTML = "<span class='text-[#ffd54f]'>ERROR: MEMORY ARRAY EMPTY.</span><br>Execute the gnomon compiler first to construct key coordinates.";
    return;
  }

  logBox.innerHTML = "<span class='text-white animate-pulse'>REALIGNING CONCENTRIC CIRCLE DIALS...</span>";
  badge.textContent = "DECRYPTING...";
  badge.className = "font-mono text-[0.55rem] px-1.5 py-0.5 rounded bg-[#ffd54f]/25 text-[#ffd54f]";

  setTimeout(() => {
    logBox.innerHTML = `DIAL BASE COORDINATES SYNCHRONIZED.<br>PLAIN RECOVERY RESOLVED:<br><span class='text-[#ffd54f] font-bold text-sm select-all font-mono'>"${baseStringMemory}"</span>`;
    badge.textContent = "RESOLVED";
    badge.className = "font-mono text-[0.55rem] px-1.5 py-0.5 rounded bg-[#00e676]/25 text-[#00e676]";

    showToast("Shadow Reconstructed", "Decoded plaintext back to original baseline coordinate.", "☼", "var(--gold)");
    triggerBeep(659, 0.12);
  }, 850);
}
