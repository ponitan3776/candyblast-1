import { SHAPES } from './config.js';
import { loadAdminSettings, executeAdminCommand, toggleBlock, syncFromServer } from './api.js';
import { 
  authToken, currentUserId, 
  adminDisabledBlocks, adminSafetyMode,
  modalContent, 
  updateCoinUI, updateScoreUI, 
  best, coins, shapeBounds, 
  saveBest, saveCoins,
  fillTray
} from './game-core.js';

export async function renderAdminPanel() {
  if (currentUserId !== 'admin') {
    modalContent.innerHTML = `<h2 style="color:var(--coral);">⛔ 管理者権限がありません</h2>`;
    return;
  }

  // 最新設定を読み込む
  const settings = await loadAdminSettings(authToken);
  if (settings) {
    adminDisabledBlocks = settings.disabledBlocks || [];
    adminSafetyMode = settings.safetyMode || false;
  }

  modalContent.dataset.mode = 'admin';
  let html = `
    <h2 style="color:var(--gold);">🔧 管理者パネル</h2>
    <div class="sub">admin専用コマンド実行欄です。</div>
    <div class="admin-setting-item">
      <div class="label-row"><span>⌨️ 管理者コマンド</span></div>
      <input type="text" id="adminCmdInput" placeholder="コマンドを入力..." style="width:100%;padding:8px 12px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:var(--bg-deep2);color:var(--text);font-size:14px;font-family:'Nunito',sans-serif;margin-bottom:6px;">
      <button class="primary-btn" id="adminCmdBtn">実行</button>
      <div class="cmd-output" id="adminCmdOutput">📋 コマンド一覧:
  /setcoins &lt;amount&gt; - コインを指定値に設定
  /setscore &lt;mode&gt; &lt;score&gt; - モード別スコア設定 (soft, baked, hard, extreme)
  /safety [on|off] - 強制セーフティモード（引数なしで状態表示）
  /resetquests - 全ユーザーのクエスト進捗リセット
  /setplaytime &lt;seconds&gt; - プレイ時間を設定
  /ban &lt;ID&gt; - ユーザーをBAN
  /unban &lt;ID&gt; - BAN解除
  /resetuser &lt;ID&gt; - ユーザーデータリセット
  /listusers - ユーザー一覧表示
  /search &lt;ID&gt; - ユーザー情報検索
  /stats - サーバー統計情報
  /help - このヘルプ</div>
    </div>
    <div class="admin-setting-item">
      <div class="label-row"><span>🧩 ブロック出現設定（オフにすると出現しなくなります）</span></div>
      <div style="max-height:200px; overflow-y:auto;">
  `;
  SHAPES.forEach((shape, idx) => {
    const isOff = adminDisabledBlocks.includes(idx);
    const { rows, cols } = shapeBounds(shape);
    const size = 24;
    html += `
      <div style="display:flex; align-items:center; gap:10px; padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
        <div class="block-grid-preview" style="grid-template-columns:repeat(${cols}, ${size}px); grid-template-rows:repeat(${rows}, ${size}px);">
          ${Array.from({length: rows*cols}, (_, i) => {
            const r = Math.floor(i/cols), c = i%cols;
            const filled = shape.some(([sr,sc])=>sr===r&&sc===c);
            return `<div class="block-cell ${filled?'':'empty'}"></div>`;
          }).join('')}
        </div>
        <span style="font-size:12px; color:var(--text-dim);">#${idx}</span>
        <div style="margin-left:auto; display:flex; align-items:center; gap:8px;">
          <span style="font-size:12px; color:${isOff ? 'var(--coral)' : 'var(--mint)'};">${isOff ? 'OFF' : 'ON'}</span>
          <div class="toggle-switch ${isOff ? '' : 'active'}" data-block-index="${idx}" style="cursor:pointer;">
            <div class="knob"></div>
          </div>
        </div>
      </div>
    `;
  });
  html += `</div></div>`;
  modalContent.innerHTML = html;

  // コマンド実行
  document.getElementById('adminCmdBtn').addEventListener('click', async () => {
    const input = document.getElementById('adminCmdInput');
    const output = document.getElementById('adminCmdOutput');
    const cmd = input.value.trim();
    if (!cmd) return;
    output.textContent = '⏳ 実行中...';
    try {
      const data = await executeAdminCommand(authToken, cmd);
      // コマンドの結果に応じてローカル状態を更新
      if (cmd.startsWith('/setcoins')) {
        const parts = cmd.split(' ');
        const newCoins = parseInt(parts[1]);
        if (!isNaN(newCoins) && newCoins >= 0) {
          coins = newCoins;
          updateCoinUI();
          saveCoins(coins);
        }
      }
      if (cmd.startsWith('/setscore')) {
        const parts = cmd.split(' ');
        const mode = parts[1];
        const scoreVal = parseInt(parts[2]);
        if (!isNaN(scoreVal) && scoreVal >= 0) {
          best = scoreVal;
          updateScoreUI();
          saveBest(best);
        }
      }
      if (cmd.startsWith('/safety')) {
        // 状態更新のため再読み込み
        const settings = await loadAdminSettings(authToken);
        if (settings) {
          adminSafetyMode = settings.safetyMode;
        }
        // 必要に応じてトレイ再生成
        fillTray();
      }
      output.innerHTML = data.result || '✅ コマンドを実行しました';
    } catch(err) {
      output.innerHTML = '❌ ' + err.message;
    }
    input.value = '';
  });

  // ブロックトグル
  document.querySelectorAll('.toggle-switch[data-block-index]').forEach(el => {
    el.addEventListener('click', async function() {
      const idx = parseInt(this.dataset.blockIndex, 10);
      const currentOff = adminDisabledBlocks.includes(idx);
      const enabled = currentOff; // 現在OFFならONにする（enabled=true）
      try {
        const data = await toggleBlock(authToken, idx, enabled);
        adminDisabledBlocks = data.settings.disabledBlocks || [];
        renderAdminPanel(); // 再描画
      } catch(err) {
        alert('トグル失敗: ' + err.message);
      }
    });
  });
}
