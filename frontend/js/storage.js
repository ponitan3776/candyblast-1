// ===================== 永続化 =====================
async function loadBest() {
  try {
    const res = await window.storage.get(STORAGE_BEST, false);
    if (res && res.value) best = parseInt(res.value, 10) || 0;
  } catch (err) { best = 0; }
  bestValEl.textContent = best;
}

async function saveBest(val) {
  try { await window.storage.set(STORAGE_BEST, String(val), false); } catch (err) {}
}

async function loadCoins() {
  try {
    const res = await window.storage.get(STORAGE_COINS, false);
    if (res && res.value) coins = parseInt(res.value, 10) || 0;
  } catch (err) { coins = 0; }
  coinValEl.textContent = coins;
}

async function saveCoins(val) {
  try { await window.storage.set(STORAGE_COINS, String(val), false); } catch (err) {}
}

async function loadSettings() {
  let isFirstTime = true;
  try {
    const res = await window.storage.get(STORAGE_SETTINGS, false);
    if (res && res.value) {
      const parsed = JSON.parse(res.value);
      currentMode = MODES[parsed.mode] ? parsed.mode : 'baked';
      SIZE = (currentMode === 'extreme') ? 8 : Math.min(18, Math.max(5, parsed.size || 8));
      isFirstTime = false;
    }
  } catch (err) {}
  return isFirstTime;
}

async function saveSettings() {
  try {
    await window.storage.set(STORAGE_SETTINGS, JSON.stringify({ mode: currentMode, size: SIZE }), false);
  } catch (err) {}
}

async function loadSkinsData() {
  try {
    const res = await window.storage.get(STORAGE_SKINS, false);
    if (res && res.value) {
      const parsed = JSON.parse(res.value);
      ownedSkins = (parsed.owned && parsed.owned.length) ? parsed.owned : ['default'];
      equippedSkin = parsed.equipped || 'default';
    }
  } catch (err) { ownedSkins = ['default']; equippedSkin = 'default'; }
  applySkin(equippedSkin);
}

async function saveSkinsData() {
  try {
    await window.storage.set(STORAGE_SKINS, JSON.stringify({ owned: ownedSkins, equipped: equippedSkin }), false);
  } catch (err) {}
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function loadDailyQuests() {
  const today = todayKey();
  try {
    const res = await window.storage.get(STORAGE_QUESTS, false);
    if (res && res.value) {
      const parsed = JSON.parse(res.value);
      if (parsed.date === today) {
        dailyStats = { ...DAILY_STATS_DEFAULT, ...parsed.stats, date: today };
        quests = parsed.quests;
        return;
      }
    }
  } catch (err) {}
  dailyStats = { date: today, ...DAILY_STATS_DEFAULT };
  quests = pickDailyQuests();
  await saveDailyQuests();
}

async function saveDailyQuests() {
  dailyStats.date = todayKey();
  try {
    await window.storage.set(STORAGE_QUESTS, JSON.stringify({ date: dailyStats.date, stats: dailyStats, quests }), false);
  } catch (err) {}
}
