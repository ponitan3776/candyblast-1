// ===================== UI更新 =====================
function updateScoreUI() {
  G.scoreValEl.textContent = G.score;
  if (G.score > G.best) {
    G.best = G.score;
    G.bestValEl.textContent = G.best;
    saveBest(G.best);
  }
}

function updateCoinUI() {
  G.coinValEl.textContent = G.coins;
  saveCoins(G.coins);
}

function updateModeBadge() {
  const m = MODES[G.currentMode];
  if (m) G.modeBadgeEl.textContent = `${m.emoji} ${m.label} · ${G.SIZE}×${G.SIZE}`;
}

function closeModal() {
  G.modalOverlay.classList.remove('show');
  G.modalContent.dataset.mode = '';
  if (G.chatPollingInterval) {
    clearInterval(G.chatPollingInterval);
    G.chatPollingInterval = null;
  }
}

function showCombo(linesCleared, streakVal) {
  if (linesCleared < 2 && streakVal < 2) return;
  let msg = '';
  if (linesCleared >= 2) msg = `COMBO x${linesCleared}!`;
  if (streakVal >= 2) msg += (msg ? '  ' : '') + `🔥x${streakVal}`;
  G.comboTextEl.textContent = msg;
  G.comboTextEl.className = 'combo-text show';
  setTimeout(() => { G.comboTextEl.className = 'combo-text'; }, 900);
}

function showComboText(msg) {
  G.comboTextEl.textContent = msg;
  G.comboTextEl.className = 'combo-text bonus show';
  setTimeout(() => { G.comboTextEl.className = 'combo-text'; }, 900);
}

function floatCoin(amount) {
  const rect = G.boardEl.getBoundingClientRect();
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
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < 5; i++) {
    const p = document.createElement('div');
    p.className = 'confetti';
    p.style.background = window.COLORS[Math.floor(Math.random() * window.COLORS.length)].bg;
    p.style.left = cx + 'px';
    p.style.top = cy + 'px';
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 50;
    p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
    p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
    p.style.setProperty('--rot', (Math.random() * 360) + 'deg');
    p.style.animation = 'confettiBurst 0.55s ease-out forwards';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 600);
  }
}

// ===================== 設定モーダル（新規追加！） =====================
function renderModeTab() {
  let html = `<div class="sub" style="margin-bottom:10px;">モードと盤面サイズを選んで「この設定でスタート」を押してください。</div>`;
  Object.entries(MODES).forEach(([key, m]) => {
    const selected = G.pendingMode === key;
    html += `
      <div class="mode-card ${selected ? 'selected' : ''}" data-mode="${key}">
        <div class="mode-card-head"><span class="mode-emoji">${m.emoji}</span><span>${m.label}</span>
          <span class="coin-tag">🪙×${MODE_COIN_MULT[key]}</span></div>
      </div>`;
  });
  const sizeNow = G.pendingMode === 'extreme' ? 8 : G.pendingSize;
  const totalMult = (MODE_COIN_MULT[G.pendingMode] * sizeCoinMult(sizeNow)).toFixed(2);
  html += `
    <div class="size-row">
      <div class="qtitle" style="margin-bottom:2px;">盤面サイズ: <span id="sizeVal">${sizeNow}</span> × ${sizeNow}</div>
      <input type="range" id="sizeSlider" min="5" max="18" step="1" value="${sizeNow}" ${G.pendingMode === 'extreme' ? 'disabled' : ''}>
      <div class="sub" style="margin-top:4px;">${G.pendingMode === 'extreme' ? '激硬モードは8×8で固定です。' : '盤面が小さいほどコイン倍率が上がります。'}</div>
      <div class="sub" style="margin-top:8px; color:var(--gold); font-weight:800;">獲得コイン倍率: ×<span id="totalMultVal">${totalMult}</span>(焼成8×8が基準の×1.00)</div>
    </div>
    <button class="primary-btn" id="applyModeBtn">この設定でスタート</button>`;
  return html;
}

function renderSettingsModal(tab) {
  G.modalContent.dataset.mode = 'settings';
  G.modalContent.innerHTML = `
    <h2 style="color:var(--gold);">⚙️ 設定</h2>
    <div class="tab-row">
      <button class="tab-btn ${tab === 'mode' ? 'active' : ''}" data-stab="mode">ゲームモード</button>
      <button class="tab-btn ${tab === 'skin' ? 'active' : ''}" data-stab="skin">🎨 スキン</button>
    </div>
    <div id="settingsTabBody">${tab === 'skin' ? renderSkinTab() : renderModeTab()}</div>
  `;
  G.modalContent.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => renderSettingsModal(btn.dataset.stab));
  });
  if (tab === 'skin') {
    G.modalContent.querySelectorAll('.claim-btn[data-skin]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.skin;
        const action = btn.dataset.action;
        if (action === 'buy') buySkin(id);
        else if (action === 'equip') equipSkin(id);
      });
    });
  } else {
    G.modalContent.querySelectorAll('.mode-card').forEach(card => {
      card.addEventListener('click', () => {
        G.pendingMode = card.dataset.mode;
        if (G.pendingMode === 'extreme') G.pendingSize = 8;
        renderSettingsModal('mode');
      });
    });
    const slider = document.getElementById('sizeSlider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        G.pendingSize = parseInt(e.target.value, 10);
        const label = document.getElementById('sizeVal');
        if (label) label.textContent = G.pendingSize;
        const multLabel = document.getElementById('totalMultVal');
        if (multLabel) multLabel.textContent = (MODE_COIN_MULT[G.pendingMode] * sizeCoinMult(G.pendingSize)).toFixed(2);
      });
    }
    const applyBtn = document.getElementById('applyModeBtn');
    if (applyBtn) applyBtn.addEventListener('click', () => {
      applyMode(G.pendingMode, G.pendingSize);
      closeModal();
    });
  }
}
