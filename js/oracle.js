/* ============================================================
   SOLAR INTELLIGENCE PAGE ONLY — the AI Oracle chat terminal.
   Loaded only by oracle.html.

   SECURITY NOTE: this calls "/.netlify/functions/oracle" — a small
   server-side function that holds your real Gemini API key safely.
   The browser never sees the key. See README.md to activate it.
   ============================================================ */

function prefillOracle(promptText) {
  document.getElementById('ai-input').value = promptText;
  triggerBeep(450, 0.05);
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatMarkdown(text) {
  let formatted = escapeHtml(text);
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-[#050402] px-1 py-0.5 rounded text-[#ffd54f] font-mono">$1</code>');
  formatted = formatted.replace(/\n/g, '<br>');
  return formatted;
}

async function askOracle() {
  const inputEl = document.getElementById('ai-input');
  const msgContainer = document.getElementById('ai-messages');
  const sendBtn = document.getElementById('oracle-send-btn');
  const prompt = inputEl.value.trim();

  if (!prompt) return;

  triggerBeep(650, 0.1);

  msgContainer.innerHTML += `<div class="border-b border-white/5 pb-2 mb-2"><span class="text-[#ffd54f] font-bold">[USER]:</span> ${escapeHtml(prompt)}</div>`;
  inputEl.value = "";
  msgContainer.scrollTop = msgContainer.scrollHeight;

  const loaderId = "loader-" + Date.now();
  msgContainer.innerHTML += `<div id="${loaderId}" class="flex items-center gap-2 text-white/50 animate-pulse"><span class="text-[#7c4dff] font-bold">[ORACLE]:</span> Tracking orbital coordinate trajectories...</div>`;
  msgContainer.scrollTop = msgContainer.scrollHeight;

  sendBtn.disabled = true;
  sendBtn.textContent = "SENDING...";

  let attempts = 0;
  let delay = 1000;
  let success = false;
  let responseText = "";

  while (attempts < 5 && !success) {
    try {
      const response = await fetch('/.netlify/functions/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (response.ok) {
        const resData = await response.json();
        responseText = resData.text || "No payload recovered.";
        success = true;
      } else {
        throw new Error(`Gateway Error Status: ${response.status}`);
      }
    } catch (err) {
      attempts++;
      if (attempts >= 5) {
        responseText = "Communications Interrupted. The Oracle backend isn't reachable yet — see README.md to deploy the /.netlify/functions/oracle proxy and add your Gemini key. (Offline fallback: chronological security matrices remain structurally locked against quantum brute-forcing).";
      } else {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }

  const loader = document.getElementById(loaderId);
  if (loader) loader.remove();

  msgContainer.innerHTML += `<div class="border-b border-white/5 pb-2 mb-2 text-slate-300"><span class="text-[#7c4dff] font-bold">[ORACLE]:</span> ${formatMarkdown(responseText)}</div>`;
  msgContainer.scrollTop = msgContainer.scrollHeight;

  sendBtn.disabled = false;
  sendBtn.textContent = "TRANSMIT";
  triggerBeep(880, 0.15);
}

document.addEventListener('DOMContentLoaded', () => {
  const inputEl = document.getElementById('ai-input');
  if (inputEl) {
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') askOracle();
    });
  }
});
