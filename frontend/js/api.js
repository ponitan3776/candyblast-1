import { API_BASE_URL } from './config.js';

/**
 * サーバーへデータを同期（POST）
 */
export async function syncToServer(authToken, data) {
  if (!authToken) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('同期失敗');
    return await res.json();
  } catch (err) {
    console.warn('サーバー同期に失敗:', err.message);
  }
}

/**
 * サーバーからデータを取得（GET）
 */
export async function syncFromServer(authToken) {
  if (!authToken) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/sync`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('サーバーからの取得に失敗:', err.message);
    return null;
  }
}

/**
 * ログイン
 */
export async function login(id, password) {
  const res = await fetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'ログインに失敗しました');
  return data; // { token, id, bestScore, coins, playTime }
}

/**
 * 新規登録
 */
export async function register(id, password) {
  const res = await fetch(`${API_BASE_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '登録に失敗しました');
  return data; // { token, id }
}

/**
 * パスワード復元
 */
export async function recoverPassword(id, recoveryCode, newPassword) {
  const res = await fetch(`${API_BASE_URL}/api/recover`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, recoveryCode, newPassword })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '復元に失敗しました');
  return data;
}

/**
 * アカウント削除
 */
export async function deleteAccount(authToken) {
  const res = await fetch(`${API_BASE_URL}/api/account/delete`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || '削除に失敗しました');
  }
  return await res.json();
}

/**
 * ランキング取得
 */
export async function fetchRanking(mode, type) {
  const res = await fetch(`${API_BASE_URL}/api/ranking?mode=${mode}&type=${type}`);
  if (!res.ok) throw new Error('ランキング取得失敗');
  return await res.json();
}

/**
 * チャットメッセージ一覧取得
 */
export async function fetchChatMessages() {
  const res = await fetch(`${API_BASE_URL}/api/chat/messages`);
  if (!res.ok) throw new Error('チャット取得失敗');
  return await res.json();
}

/**
 * チャット送信
 */
export async function sendChatMessage(authToken, message) {
  const res = await fetch(`${API_BASE_URL}/api/chat/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ message })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || '送信失敗');
  }
  return await res.json();
}

/**
 * プロフィール取得
 */
export async function fetchProfile(userId) {
  const res = await fetch(`${API_BASE_URL}/api/user/profile/${userId}`);
  if (!res.ok) throw new Error('ユーザーが見つかりません');
  return await res.json();
}

/**
 * 管理者設定取得（ブロック無効化・セーフティモード）
 */
export async function loadAdminSettings(authToken) {
  const res = await fetch(`${API_BASE_URL}/api/admin/block-settings`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  if (!res.ok) return null;
  return await res.json();
}

/**
 * 管理者コマンド実行
 */
export async function executeAdminCommand(authToken, cmd) {
  const res = await fetch(`${API_BASE_URL}/api/admin/command`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ command: cmd })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'コマンド実行に失敗しました');
  return data;
}

/**
 * ブロックトグル（管理者）
 */
export async function toggleBlock(authToken, blockIndex, enabled) {
  const res = await fetch(`${API_BASE_URL}/api/admin/block-toggle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ blockIndex, enabled })
  });
  if (!res.ok) throw new Error('トグル失敗');
  return await res.json();
}
