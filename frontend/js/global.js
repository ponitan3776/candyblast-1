// ===================== グローバル変数 =====================
// すべてのファイルで共有する変数をここに定義

window.G = {
  // ゲーム状態
  SIZE: 8,
  board: [],
  cellEls: [],
  tray: [],
  score: 0,
  best: 0,
  coins: 0,
  streak: 0,
  noClearStreak: 0,
  soundOn: true,
  dragState: null,
  currentMode: 'baked',
  pendingMode: 'baked',
  pendingSize: 8,

  // 管理者
  adminDisabledBlocks: [],
  adminSafetyMode: false,

  // クエスト
  dailyStats: { date: '', ...DAILY_STATS_DEFAULT },
  quests: [],

  // 認証
  authToken: null,
  currentUserId: null,
  playTime: 0,
  playTimeInterval: null,

  // チャット
  chatMessages: [],
  chatPollingInterval: null,

  // ランキング
  currentRankingMode: 'soft',
  currentRankingType: 'score',

  // DOM要素（後でセット）
  boardEl: null,
  trayEl: null,
  ghostEl: null,
  scoreValEl: null,
  bestValEl: null,
  coinValEl: null,
  comboTextEl: null,
  overlayEl: null,
  finalScoreEl: null,
  newBestNoteEl: null,
  coinEarnedNoteEl: null,
  restartBtn: null,
  soundBtn: null,
  questBtn: null,
  settingsBtn: null,
  modeBadgeEl: null,
  accountBtn: null,
  rankingBtn: null,
  adminPanelBtn: null,
  chatBtn: null,
  modalOverlay: null,
  modalContent: null,
  modalClose: null
};
