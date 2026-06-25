/* ============================================================
   GNOMON SHADOW GRID PAGE ONLY — the interactive dial canvas.
   Loaded only by lattice.html.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const latCanvas = document.getElementById('lattice-canvas');
  if (!latCanvas) return;
  const latCtx = latCanvas.getContext('2d');

  let perturbedX = 0;
  let perturbedY = 0;
  let activePerturb = false;

  function drawLattice() {
    latCtx.clearRect(0, 0, latCanvas.width, latCanvas.height);
    const w = latCanvas.width;
    const h = latCanvas.height;
    const midX = w / 2;
    const midY = h / 2;

    latCtx.strokeStyle = 'rgba(255, 213, 79, 0.08)';
    latCtx.lineWidth = 1.2;

    const radii = [60, 100, 140];
    radii.forEach(r => {
      latCtx.beginPath();
      latCtx.arc(midX, midY, r, 0, Math.PI * 2);
      latCtx.stroke();
    });

    const romanNumerals = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
    latCtx.fillStyle = 'rgba(255, 213, 79, 0.25)';
    latCtx.font = '9px "IBM Plex Mono",monospace';
    latCtx.textAlign = 'center';
    latCtx.textBaseline = 'middle';

    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI / 6) - Math.PI / 2;
      const textX = midX + Math.cos(angle) * 120;
      const textY = midY + Math.sin(angle) * 120;
      latCtx.fillText(romanNumerals[i], textX, textY);

      latCtx.beginPath();
      latCtx.moveTo(midX + Math.cos(angle) * 100, midY + Math.sin(angle) * 100);
      latCtx.lineTo(midX + Math.cos(angle) * 110, midY + Math.sin(angle) * 110);
      latCtx.strokeStyle = 'rgba(255, 213, 79, 0.15)';
      latCtx.stroke();
    }

    latCtx.fillStyle = '#141009';
    latCtx.strokeStyle = '#ffd54f';
    latCtx.lineWidth = 2;
    latCtx.beginPath();
    latCtx.arc(midX, midY, 15, 0, Math.PI * 2);
    latCtx.fill();
    latCtx.stroke();

    if (activePerturb) {
      const dx = perturbedX - midX;
      const dy = perturbedY - midY;
      const angleToSun = Math.atan2(dy, dx);
      const distToSun = Math.sqrt(dx * dx + dy * dy);

      const angleOfShadow = angleToSun + Math.PI;
      const shadowLength = Math.min(130, 2400 / Math.max(20, distToSun));

      latCtx.strokeStyle = 'rgba(124, 77, 255, 0.6)';
      latCtx.lineWidth = 6;
      latCtx.lineCap = 'round';
      latCtx.beginPath();
      latCtx.moveTo(midX, midY);
      latCtx.lineTo(midX + Math.cos(angleOfShadow) * shadowLength, midY + Math.sin(angleOfShadow) * shadowLength);
      latCtx.stroke();

      latCtx.strokeStyle = 'rgba(5, 4, 2, 0.8)';
      latCtx.lineWidth = 3;
      latCtx.beginPath();
      latCtx.moveTo(midX, midY);
      latCtx.lineTo(midX + Math.cos(angleOfShadow) * shadowLength * 0.9, midY + Math.sin(angleOfShadow) * shadowLength * 0.9);
      latCtx.stroke();

      latCtx.fillStyle = '#ffd54f';
      latCtx.beginPath();
      latCtx.arc(perturbedX, perturbedY, 6, 0, Math.PI * 2);
      latCtx.fill();

      latCtx.strokeStyle = 'rgba(255, 213, 79, 0.25)';
      latCtx.lineWidth = 1;
      latCtx.beginPath();
      latCtx.arc(perturbedX, perturbedY, 12, 0, Math.PI * 2);
      latCtx.stroke();
    } else {
      latCtx.strokeStyle = 'rgba(124, 77, 255, 0.25)';
      latCtx.lineWidth = 4;
      latCtx.lineCap = 'round';
      latCtx.beginPath();
      latCtx.moveTo(midX, midY);
      latCtx.lineTo(midX, midY + 80);
      latCtx.stroke();
    }
  }

  function handlePerturb(event) {
    const rect = latCanvas.getBoundingClientRect();
    perturbedX = event.clientX - rect.left;
    perturbedY = event.clientY - rect.top;
    activePerturb = true;

    const midX = latCanvas.width / 2;
    const midY = latCanvas.height / 2;
    const dx = perturbedX - midX;
    const dy = perturbedY - midY;

    const rawAngle = Math.atan2(dy, dx);
    const deg = (rawAngle * 180 / Math.PI) + 180;

    document.getElementById('lattice-norm').textContent = `${deg.toFixed(2)}° Azimuth`;
    document.getElementById('lattice-error').textContent = `σ = ${(Math.sin(perturbedX * 0.05) * 5.2).toFixed(4)} shift`;

    triggerBeep(320 + (deg * 1.2), 0.02, 'triangle');
    drawLattice();
  }

  latCanvas.addEventListener('mousedown', (e) => {
    handlePerturb(e);
    latCanvas.addEventListener('mousemove', handlePerturb);
  });

  window.addEventListener('mouseup', () => {
    latCanvas.removeEventListener('mousemove', handlePerturb);
  });

  window.resetLatticeVector = function () {
    activePerturb = false;
    document.getElementById('lattice-norm').textContent = "0.00° Azimuth";
    document.getElementById('lattice-error').textContent = "Grid Static";
    triggerBeep(330, 0.1);
    drawLattice();
  };

  function initLatticeCanvas() {
    latCanvas.width = latCanvas.parentElement.clientWidth;
    latCanvas.height = 350;
    drawLattice();
  }
  window.addEventListener('resize', initLatticeCanvas);
  setTimeout(initLatticeCanvas, 100);
});
