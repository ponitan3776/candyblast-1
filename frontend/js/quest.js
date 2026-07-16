import { DAILY_STATS_DEFAULT } from './config.js';
import { loadQuestsData, saveQuestsData } from './storage.js';
import { syncToServer } from './api.js';

// クエストプール（元コードと同じ）
const QUEST_POOL = [
  { id:'singleScore400', desc:'1回のプレイでスコア400点以上を叩き出す', statKey:'bestSingleGameScore', target:400, reward:50 },
  { id:'tripleClear', desc:'1回の設置で3ライン以上同時に消す(トリプルクリア)', statKey:'tripleClearCount', target:1, reward:70 },
  { id:'comboStreak4', desc:'1回のプレイでコンボストリークを4連続つなげる', statKey:'maxComboStreak', target:4, reward:65 },
  { id:'lines25', desc:'ラインを合計25本消す', statKey:'linesCleared', target:25, reward:55 },
  { id:'hardMode1', desc:'「硬い」以上の難易度でゲームを1回プレイし切る', statKey:'hardModeGamesPlayed', target:1, reward:45 },
  { id:'pieces60', desc:'ピースを合計60個配置する', statKey:'piecesPlaced', target:60, reward:40 },
  { id:'score600total', desc:'1日の合計スコアを600点稼ぐ', statKey:'scoreEarned', target:600, reward:50 },
  { id:'noClearStreak10', desc:'ラインを消さずにピースを10個連続で置く我慢比べ', statKey:'maxNoClearStreak', target:10, reward:60 },
  { id:'bigPiece5', desc:'5マス以上の大きいブロックを5個配置する', statKey:'bigPiecesPlaced', target:5, reward:55 },
  { id:'play3', desc:'ゲームを3回プレイする', statKey:'gamesPlayed', target:3, reward:30 }
];

let _dailyStats = { date: '', ...DAILY_STATS_DEFAULT };
let _quests = [];
let _authToken = null;
let _coins = 0;
let _updateCoinUI = null;
let _modalContent = null;
let _modalOverlay = null;
let _renderTray = null;

/**
 * 依存注入（app.jsから呼ぶ）
 */
export function injectQuestDependencies({ authToken, coins, updateCoinUI, modalContent, modalOverlay, renderTray }) {
  _authToken = authToken;
  _coins = coins;
  _updateCoinUI = updateCoinUI;
  _modalContent = modalContent;
  _modalOverlay = modalOverlay;
  _renderTray = renderTray;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function pickDailyQuests() {
  const pool = [...QUEST_POOL];
  const picked = [];
  for (let i = 0; i < 3 && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const q = pool.splice(idx, 1)[0];
    picked.push({ ...q, progress: 0, claimed: false });
  }
  return picked;
}

/**
 * クエストデータを読み込む（初回または日付が変わったら新規生成）
 */
export async function loadDailyQuests() {
  const today = todayKey();
  const saved = await loadQuestsData();
  if (saved && saved.date === today) {
    _dailyStats = { ...DAILY_STATS_DEFAULT, ...saved.stats, date: today };
    _quests = saved.quests;
  } else {
    _dailyStats = { date: today, ...DAILY_STATS_DEFAULT };
    _quests = pickDailyQuests();
    await saveDailyQuests();
  }
}

/**
 * クエストデータを保存
 */
export async function saveDailyQuests() {
  _dailyStats.date = todayKey();
  await saveQuestsData({
    date: _dailyStats.date,
    stats: _dailyStats,
    quests: _quests
  });
}

/**
 * 進捗を更新（ゲーム内で呼ぶ）
 */
export function updateQuestProgress() {
  _quests.forEach(q => {
    q.progress = _dailyStats[q.statKey] || 0;
  });
  saveDailyQuests();
  // もしクエストモーダルが開いていれば再描画
  if (_modalOverlay && _modalOverlay.classList.contains('show') &&
      _modalContent && _modalContent.dataset.mode === 'quests') {
    renderQuestModal();
  }
}

/**
 * クエスト報酬を受け取る
 */
export function claimQuest(questId) {
  const q = _quests.find(q => q.id === questId);
  if (!q || q.claimed || q.progress < q.target) return;
  q.claimed = true;
  const reward = q.reward;
  _coins += reward;
  if (_updateCoinUI) _updateCoinUI();
  saveDailyQuests();
  renderQuestModal();
  if (_authToken) syncToServer(_authToken, { coins: _coins, quests: _quests });
}

/**
 * クエストモーダルを描画
 */
export function renderQuestModal() {
  if (!_modalContent) return;
  _modalContent.dataset.mode = 'quests';
  let html = `<h2 style="color:var(--mint);">📋 デイリークエスト</h2><div class="sub">毎日リセットされます。がんばって集めよう！</div>`;
  _quests.forEach(q => {
    const pct = Math.min(100, Math.floor((q.progress / q.target) * 100));
    const done = q.progress >= q.target;
    html += `
      <div class="quest-item">
        <div class="qtitle">${q.desc}</div>
        <div class="quest-bar-bg"><div class="quest-bar-fill" style="width:${pct}%"></div></div>
        <div class="quest-foot">
          <span>${Math.min(q.progress, q.target)} / ${q.target}</span>
          <button class="claim-btn" data-qid="${q.id}" ${(!done || q.claimed) ? 'disabled' : ''}>
            ${q.claimed ? '受取済み' : `🪙${q.reward} 受け取る`}
          </button>
        </div>
      </div>
    `;
  });
  _modalContent.innerHTML = html;
  _modalContent.querySelectorAll('.claim-btn').forEach(btn => {
    btn.addEventListener('click', () => claimQuest(btn.dataset.qid));
  });
}

/**
 * 日次統計を更新（ゲーム内で呼ぶ）
 */
export function updateDailyStats(statsUpdate) {
  Object.assign(_dailyStats, statsUpdate);
  saveDailyQuests();
}

/**
 * 現在のクエストリストを取得
 */
export function getQuests() {
  return _quests;
}

/**
 * 現在の日次統計を取得
 */
export function getDailyStats() {
  return _dailyStats;
}
