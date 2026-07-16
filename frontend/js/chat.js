import { fetchChatMessages, sendChatMessage, fetchProfile } from './api.js';
import { authToken, currentUserId, modalContent, modalOverlay } from './game-core.js';

let chatPollingInterval = null;
let chatMessages = [];

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderChatMessages() {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  if (chatMessages.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--text-dim);">まだメッセージがありません。</div>`;
    return;
  }
  container.innerHTML = chatMessages.map(msg => `
    <div style="display:flex; align-items:baseline; gap:6px; padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.03);">
      <span style="color:var(--gold); font-weight:700; cursor:pointer; flex-shrink:0;" onclick="window.showProfile('${msg.user_id}')">
        [${msg.user_id}]
      </span>
      <span style="color:var(--text); word-break:break-word;">${escapeHtml(msg.message)}</span>
      <span style="color:var(--text-dim); font-size:10px; margin-left:auto; flex-shrink:0;">
        ${new Date(msg.timestamp).toLocaleTimeString('ja-JP')}
      </span>
    </div>
  `).join('');
  container.scrollTop = container.scrollHeight;
}

async function refreshChat() {
  try {
    chatMessages = await fetchChatMessages();
    renderChatMessages();
  } catch (err) {
    console.warn('チャット取得失敗:', err);
  }
}

export function closeChatPolling() {
  if (chatPollingInterval) {
    clearInterval(chatPollingInterval);
    chatPollingInterval = null;
  }
}

export function renderChatModal() {
  modalContent.dataset.mode = 'chat';
  modalContent.innerHTML = `
    <h2 style="color:var(--gold);">💬 グローバルチャット</h2>
    <div class="sub">全ユーザーと会話できます。</div>
    <div id="chatMessages" style="height:300px; overflow-y:auto; background:var(--bg-deep2); border-radius:12px; padding:10px; margin:8px 0; text-align:left; border:1px solid rgba(255,255,255,0.05);">
      <div style="text-align:center; color:var(--text-dim);">読み込み中...</div>
    </div>
    <div style="display:flex; gap:6px;">
      <input type="text" id="chatInput" placeholder="メッセージを入力..." style="flex:1; padding:10px 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.12); background:var(--bg-deep2); color:var(--text); font-size:14px; font-family:'Nunito',sans-serif;">
      <button class="primary-btn" id="chatSendBtn" style="flex-shrink:0; width:auto; padding:10px 20px; margin:0;">送信</button>
    </div>
    <div style="margin-top:6px; text-align:right; font-size:10px; color:var(--text-dim);">最新50件を表示</div>
  `;
  modalOverlay.classList.add('show');

  refreshChat();

  document.getElementById('chatSendBtn').addEventListener('click', async () => {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    if (!authToken) {
      alert('ログインが必要です');
      return;
    }
    try {
      await sendChatMessage(authToken, msg);
      input.value = '';
      await refreshChat();
    } catch (err) {
      alert(err.message);
    }
  });

  document.getElementById('chatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('chatSendBtn').click();
    }
  });

  // ポーリング開始
  closeChatPolling();
  chatPollingInterval = setInterval(refreshChat, 3000);

  // モーダルが閉じられたときにポーリング停止するよう監視
  const observer = new MutationObserver(() => {
    if (!modalOverlay.classList.contains('show')) {
      closeChatPolling();
      observer.disconnect();
    }
  });
  observer.observe(modalOverlay, { attributes: true, attributeFilter: ['class'] });
}
