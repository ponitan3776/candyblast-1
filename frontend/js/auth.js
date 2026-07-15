// ===================== アカウント =====================
let authToken = null;
let currentUserId = null;

function updateAccountButton() {
  accountBtn.textContent = currentUserId ? '👤' : '👤';
  accountBtn.title = currentUserId ? `ログイン中: ${currentUserId}` : '未ログイン';
  if (currentUserId === 'admin') {
    adminPanelBtn.style.display = 'flex';
    loadAdminSettings();
  } else {
    adminPanelBtn.style.display = 'none';
  }
}

async function deleteAccount() {
  if (!authToken) return;
  if (!confirm('⚠️ 本当にアカウントを削除しますか？\nこの操作は元に戻せません！')) return;
  if (!confirm('本当に削除しますか？（最終確認）')) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/account/delete`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error('削除に失敗しました');
    alert('アカウントを削除しました。');
    authToken = null;
    currentUserId = null;
    best = 0;
    bestValEl.textContent = '0';
    coins = 0;
    coinValEl.textContent = '0';
    updateAccountButton();
    renderAuthModal();
  } catch (err) {
    alert(err.message);
  }
}

function renderAuthModal() {
  modalContent.dataset.mode = 'auth';
  if (currentUserId) {
    modalContent.innerHTML = `
      <h2 style="color:var(--gold);">👤 アカウント</h2>
      <div class="sub">ログイン中: <b>${currentUserId}</b></div>
      <div class="sub">スコア・コインはサーバーと同期されています。</div>
      <button class="primary-btn" id="syncNowBtn">今すぐ同期する</button>
      <button class="ghost-btn" id="logoutBtn">ログアウト</button>
      <button class="ghost-btn" id="deleteAccountBtn" style="color:var(--coral);border-color:var(--coral);">🗑️ アカウント削除</button>
    `;
    document.getElementById('logoutBtn').addEventListener('click', () => {
      authToken = null;
      currentUserId = null;
      best = 0;
      bestValEl.textContent = '0';
      coins = 0;
      coinValEl.textContent = '0';
      stopPlayTimeTracking();
      playTime = 0;
      updateAccountButton();
      renderAuthModal();
      closeModal();
    });
    document.getElementById('syncNowBtn').addEventListener('click', async () => {
      await syncToServer();
      await syncFromServer();
    });
    document.getElementById('deleteAccountBtn').addEventListener('click', deleteAccount);
    return;
  }
  modalContent.innerHTML = `
    <h2 style="color:var(--gold);">👤 アカウント</h2>
    <div class="tab-row">
      <button class="tab-btn active" data-tab="login">ログイン</button>
      <button class="tab-btn" data-tab="register">新規登録</button>
      <button class="tab-btn" data-tab="recover">復元</button>
    </div>
    <form class="auth-form active" id="loginForm">
      <label>ID</label><input type="text" id="loginId" autocomplete="username" />
      <label>パスワード</label><input type="password" id="loginPw" autocomplete="current-password" />
      <button type="submit" class="primary-btn">ログイン</button>
      <div class="auth-msg" id="loginMsg"></div>
    </form>
    <form class="auth-form" id="registerForm">
      <label>ID (半角英数字3〜20文字)</label><input type="text" id="regId" autocomplete="username" />
      <label>パスワード (6文字以上)</label><input type="password" id="regPw" autocomplete="new-password" />
      <button type="submit" class="primary-btn">新規登録</button>
      <div class="auth-msg" id="regMsg"></div>
    </form>
    <form class="auth-form" id="recoverForm">
      <label>ID</label><input type="text" id="recId" />
      <label>復元コード(管理者から受け取ったもの)</label><input type="text" id="recCode" placeholder="XXXX-XXXX-XXXX-XXXX" />
      <label>新しいパスワード</label><input type="password" id="recPw" autocomplete="new-password" />
      <button type="submit" class="primary-btn">パスワードを再設定</button>
      <div class="auth-msg" id="recMsg"></div>
    </form>
  `;
  modalContent.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modalContent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      modalContent.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      modalContent.querySelector(`#${btn.dataset.tab}Form`).classList.add('active');
    });
  });
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('loginId').value.trim();
    const password = document.getElementById('loginPw').value;
    const msgEl = document.getElementById('loginMsg');
    msgEl.textContent = '処理中...';
    msgEl.className = 'auth-msg';
    try {
      const r = await fetch(`${API_BASE_URL}/api/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, password }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'ログインに失敗しました。');
      authToken = data.token;
      currentUserId = data.id;
      best = data.bestScore || 0;
      bestValEl.textContent = best;
      coins = data.coins || 0;
      coinValEl.textContent = coins;
      playTime = data.playTime || 0;
      startPlayTimeTracking();
      msgEl.textContent = 'ログインしました！';
      msgEl.className = 'auth-msg ok';
      await syncFromServer();
      updateAccountButton();
      setTimeout(renderAuthModal, 500);
    } catch (err) {
      msgEl.textContent = err.message + '(サーバーに接続できているか確認してください)';
      msgEl.className = 'auth-msg error';
    }
  });
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('regId').value.trim();
    const password = document.getElementById('regPw').value;
    const msgEl = document.getElementById('regMsg');
    msgEl.textContent = '処理中...';
    msgEl.className = 'auth-msg';
    try {
      const r = await fetch(`${API_BASE_URL}/api/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, password }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || '登録に失敗しました。');
      authToken = data.token;
      currentUserId = data.id;
      best = 0;
      bestValEl.textContent = '0';
      coins = 0;
      coinValEl.textContent = '0';
      playTime = 0;
      startPlayTimeTracking();
      msgEl.textContent = '登録が完了しました！復元コードは管理者のDiscordに通知されました。';
      msgEl.className = 'auth-msg ok';
      await syncToServer();
      updateAccountButton();
      setTimeout(renderAuthModal, 800);
    } catch (err) {
      msgEl.textContent = err.message;
      msgEl.className = 'auth-msg error';
    }
  });
  document.getElementById('recoverForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('recId').value.trim();
    const recoveryCode = document.getElementById('recCode').value.trim();
    const newPassword = document.getElementById('recPw').value;
    const msgEl = document.getElementById('recMsg');
    msgEl.textContent = '処理中...';
    msgEl.className = 'auth-msg';
    try {
      const r = await fetch(`${API_BASE_URL}/api/recover`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, recoveryCode, newPassword }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || '復元に失敗しました。');
      msgEl.textContent = 'パスワードを再設定しました。ログインしてください。';
      msgEl.className = 'auth-msg ok';
    } catch (err) {
      msgEl.textContent = err.message;
      msgEl.className = 'auth-msg error';
    }
  });
}
