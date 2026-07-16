// 元コードで使われている window.storage 互換のラッパー
export const storage = {
  get: (key, isJson = false) => {
    return new Promise((resolve) => {
      try {
        const value = localStorage.getItem(key);
        resolve({ value: isJson ? JSON.parse(value) : value });
      } catch (e) {
        resolve({ value: null });
      }
    });
  },
  set: (key, value, isJson = false) => {
    return new Promise((resolve) => {
      try {
        localStorage.setItem(key, isJson ? JSON.stringify(value) : value);
        resolve();
      } catch (e) {
        resolve();
      }
    });
  }
};

// ゲーム固有の永続化関数
const STORAGE_BEST = 'candyblast-highscore';
const STORAGE_COINS = 'candyblast-coins';
const STORAGE_QUESTS = 'candyblast-quests-v1';
const STORAGE_SETTINGS = 'candyblast-settings-v1';
const STORAGE_SKINS = 'candyblast-skins-v1';

export async function loadBest() {
  try {
    const res = await storage.get(STORAGE_BEST);
    if (res && res.value) return parseInt(res.value, 10) || 0;
  } catch (e) {}
  return 0;
}
export async function saveBest(val) {
  try { await storage.set(STORAGE_BEST, String(val)); } catch(e) {}
}

export async function loadCoins() {
  try {
    const res = await storage.get(STORAGE_COINS);
    if (res && res.value) return parseInt(res.value, 10) || 0;
  } catch (e) {}
  return 0;
}
export async function saveCoins(val) {
  try { await storage.set(STORAGE_COINS, String(val)); } catch(e) {}
}

export async function loadSettings() {
  let isFirstTime = true;
  let mode = 'baked', size = 8;
  try {
    const res = await storage.get(STORAGE_SETTINGS);
    if (res && res.value) {
      const parsed = JSON.parse(res.value);
      mode = parsed.mode || 'baked';
      size = parsed.size || 8;
      isFirstTime = false;
    }
  } catch(e) {}
  return { mode, size, isFirstTime };
}
export async function saveSettings(mode, size) {
  try { await storage.set(STORAGE_SETTINGS, JSON.stringify({ mode, size })); } catch(e) {}
}

export async function loadQuestsData() {
  try {
    const res = await storage.get(STORAGE_QUESTS);
    if (res && res.value) {
      return JSON.parse(res.value);
    }
  } catch(e) {}
  return null;
}
export async function saveQuestsData(data) {
  try { await storage.set(STORAGE_QUESTS, JSON.stringify(data)); } catch(e) {}
}

export async function loadSkinsData() {
  try {
    const res = await storage.get(STORAGE_SKINS);
    if (res && res.value) {
      const parsed = JSON.parse(res.value);
      return { owned: parsed.owned || ['default'], equipped: parsed.equipped || 'default' };
    }
  } catch(e) {}
  return { owned: ['default'], equipped: 'default' };
}
export async function saveSkinsData(owned, equipped) {
  try { await storage.set(STORAGE_SKINS, JSON.stringify({ owned, equipped })); } catch(e) {}
}
