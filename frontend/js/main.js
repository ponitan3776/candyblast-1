// ===================== メイン（起動時に実行） =====================
(function() {
  // ===================== DOM要素をセット =====================
  G.boardEl = document.getElementById('board');
  G.trayEl = document.getElementById('tray');
  G.ghostEl = document.getElementById('ghost');
  G.scoreValEl = document.getElementById('scoreVal');
  G.bestValEl = document.getElementById('bestVal');
  G.coinValEl = document.getElementById('coinVal');
  G.comboTextEl = document.getElementById('comboText');
  G.overlayEl = document.getElementById('overlay');
  G.finalScoreEl = document.getElementById('finalScore');
  G.newBestNoteEl = document.getElementById('newBestNote');
  G.coinEarnedNoteEl = document.getElementById('coinEarnedNote');
  G.restartBtn = document.getElementById('restartBtn');
  G.soundBtn = document.getElementById('soundBtn');
  G.questBtn = document.getElementById('questBtn');
  G.settingsBtn = document.getElementById('settingsBtn');
  G.modeBadgeEl = document.getElementById('modeBadge');
  G.accountBtn = document.getElementById('accountBtn');
  G.rankingBtn = document.getElementById('rankingBtn');
  G.adminPanelBtn = document.getElementById('adminPanelBtn');
  G.chatBtn = document.getElementById('chatBtn');
  G.modalOverlay = document.getElementById('modalOverlay');
  G.modalContent = document.getElementById('modalContent');
  G.modalClose = document.getElementById('modalClose');

  // ===================== イベントリスナー =====================
  // ズーム無効化
  document.addEventListener('gesturestart', function(e) { e.preventDefault(); });
  document.addEventListener('gesturechange', function(e) { e.preventDefault(); });
  document.addEventListener('gestureend', function(e) { e.preventDefault(); });

  // 戻るボタン
  document.getElementById('backButton').addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm('本当に戻りますか？\nゲームの進行は保存されません。')) {
      window.location.href = 'https://my-link-portal.onrender.com';
    }
  });

  // サウンドボタン
  G.soundBtn.addEventListener('click', () => {
    unlockAudio();
    G.soundOn = !G.soundOn;
    G.soundBtn.textContent = G.soundOn ? '🔊' : '🔇';
  });

  // クエストボタン
  G.questBtn.addEventListener('click', () => {
    renderQuestModal();
    G.modalOverlay.classList.add('show');
  });

  // 設定ボタン
  G.settingsBtn.addEventListener('click', () => {
    G.pendingMode = G.currentMode;
    G.pendingSize = G.SIZE;
    renderSettingsModal('mode');
    G.modalOverlay.classList.add('show');
  });

  // アカウントボタン
  G.accountBtn.addEventListener('click', () => {
    renderAuthModal();
    G.modalOverlay.classList.add('show');
  });

  // ランキングボタン
  G.rankingBtn.addEventListener('click', () => {
    renderRankingModal();
    G.modalOverlay.classList.add('show');
  });

  // チャットボタン
  G.chatBtn.addEventListener('click', () => {
    renderChatModal();
    const observer = new MutationObserver(() => {
      if (!G.modalOverlay.classList.contains('show')) {
        if (G.chatPollingInterval) {
          clearInterval(G.chatPollingInterval);
          G.chatPollingInterval = null;
        }
      }
    });
    observer.observe(G.modalOverlay, { attributes: true, attributeFilter: ['class'] });
  });

  // 管理者ボタン
  G.adminPanelBtn.addEventListener('click', () => {
    if (G.currentUserId === 'admin') {
      renderAdminPanel();
      G.modalOverlay.classList.add('show');
    }
  });

  // モーダル閉じる
  G.modalClose.addEventListener('click', closeModal);
  G.modalOverlay.addEventListener('click', (e) => {
    if (e.target === G.modalOverlay) closeModal();
  });

  // リスタートボタン
  G.restartBtn.addEventListener('click', () => {
    G.overlayEl.classList.remove('show');
    G.score = 0;
    G.streak = 0;
    G.noClearStreak = 0;
    updateScoreUI();
    initBoard();
    fillTray();
  });

  // 音声アンロック（1回だけ）
  document.body.addEventListener('pointerdown', unlockAudio, { once: true });

  // ===================== ゲーム開始！ =====================
  (async function start() {
    await loadBest();
    await loadCoins();
    await loadSkinsData();
    const isFirstTime = await loadSettings();
    await loadDailyQuests();
    updateAccountButton();
    updateModeBadge();
    initBoard();
    fillTray();
    if (isFirstTime) {
      G.pendingMode = G.currentMode;
      G.pendingSize = G.SIZE;
      renderSettingsModal('mode');
      G.modalOverlay.classList.add('show');
    }
  })();

})();
