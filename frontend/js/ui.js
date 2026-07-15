// ===================== UI更新 =====================
let score = 0,
  best = 0,
  coins = 0,
  streak = 0,
  noClearStreak = 0;
let soundOn = true;

function updateScoreUI() {
  scoreValEl.textContent = score;
  if (score > best) { best = score;
    bestValEl.textContent = best;
    saveBest(best); }
}

function updateCoinUI() {
  coinValEl.textContent = coins;
  saveCoins(coins);
}

function updateModeBadge() {
  const m = MODES[currentMode];
  if (m) modeBadgeEl.textContent = `${m.emoji} ${m.label} · ${SIZE}×${SIZE}`;
}

function closeModal() {
  modalOverlay.classList.remove('show');
  modalContent.dataset.mode = '';
  if (chatPollingInterval) {
    clearInterval(chatPollingInterval);
    chatPollingInterval = null;
  }
}

function showCombo(linesCleared, streakVal) {
  if (linesCleared < 2 && streakVal < 2) return;
  let msg = '';
  if (linesCleared >= 2) msg = `COMBO x${linesCleared}!`;
  if (streakVal >= 2) msg += (msg ? '  ' : '') + `🔥x${streakVal}`;
  comboTextEl.textContent = msg;
  comboTextEl.className = 'combo-text show';
  setTimeout(() => { comboTextEl.className = 'combo-text'; }, 900);
}

function showComboText(msg) {
  comboTextEl.textContent = msg;
  comboTextEl.className = 'combo-text bonus show';
  setTimeout(() => { comboTextEl.className = 'combo-text'; }, 900);
}

function floatCoin(amount) {
  const rect = boardEl.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'coin-float';
  el.textContent = `+${amount}🪙`;
  el.style.left = (rect.left + rect.width / 2 - 20) + 'px';
  el.style.top = (rect.top + rect.height / 2) + 'px';
  el.style.animation = 'coinFloat 0.9s ease-out forwards';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

function spawnConfetti(cellEl) {
  const rect = cellEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2,
    cy = rect.top + rect.height / 2;
  for (let i = 0; i < 5; i++) {
    const p = document.createElement('div');
    p.className = 'confetti';
    p.style.background = COLORS[Math.floor(Math.random() * COLORS.length)].bg;
    p.style.left = cx + 'px';
    p.style.top = cy + 'px';
    const angle = Math.random() * Math.PI * 2,
      dist = 40 + Math.random() * 50;
    p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
    p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
    p.style.setProperty('--rot', (Math.random() * 360) + 'deg');
    p.style.animation = 'confettiBurst 0.55s ease-out forwards';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 600);
  }
}
