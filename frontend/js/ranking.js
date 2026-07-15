// ===================== ランキング =====================
async function renderRankingModal() {
  G.modalContent.dataset.mode = 'ranking';
  let html = `
    <h2 style="color:var(--gold);">🏆 ランキング</h2>
    <div class="sub">8×8サイズのスコアのみランキング対象です。</div>
    <div class="tab-row" style="margin-bottom:6px;">
      ${RANKING_TYPES.map(t => `
        <button class="tab-btn ${G.currentRankingType === t ? 'active' : ''}" data-rtype="${t}">${RANKING_TYPE_LABELS[t]}</button>
      `).join('')}
    </div>
    <div class="tab-row" id="modeTabs" style="margin-bottom:10px; ${G.currentRankingType === 'score' ? '' : 'display:none;'}">
      ${RANKING_MODES.map(m => `
        <button class="tab-btn ${G.currentRankingMode === m ? 'active' : ''}" data-rmode="${m}">${RANKING_MODE_LABELS[m]}</button>
      `).join('')}
    </div>
    <div id="rankingContent">
      <div class="sub">🔄 読み込み中...</div>
    </div>
  `;
  G.modalContent.innerHTML = html;

  G.modalContent.querySelectorAll('.tab-btn[data-rtype]').forEach(btn => {
    btn.addEventListener('click', () => {
      G.currentRankingType = btn.dataset.rtype;
      renderRankingModal();
    });
  });
  G.modalContent.querySelectorAll('.tab-btn[data-rmode]').forEach(btn => {
    btn.addEventListener('click', () => {
      G.currentRankingMode = btn.dataset.rmode;
      renderRankingModal();
    });
  });

  try {
    const res = await fetch(`${API_BASE_URL}/api/ranking?mode=${G.currentRankingMode}&type=${G.currentRankingType}`);
    const data = await res.json();
    let content = `<div style="text-align:left; max-height:380px; overflow-y:auto;">`;
    if (data.top && data.top.length > 0) {
      data.top.forEach((user, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        const isMe = user.id === G.currentUserId;
        const valueLabel = G.currentRankingType === 'coins' ? `${user.value}コイン` :
          G.currentRankingType === 'playtime' ? `${user.value}秒` :
          `${user.value}点`;
        content += `
          <div style="display:flex; justify-content:space-between; padding:8px 4px; border-bottom:1px solid rgba(255,255,255,0.05); ${isMe ? 'background:rgba(255,217,61,0.15); border-radius:8px;' : ''}">
            <span style="font-weight:700; ${isMe ? 'color:var(--gold);' : ''}">${medal} ${user.id} ${isMe ? '👈' : ''}</span>
            <span style="color:var(--gold); font-weight:800;">${valueLabel}</span>
          </div>
        `;
      });
    } else {
      const msg = G.currentRankingType === 'score' ? 'このモードのランキングデータがまだありません。' :
        G.currentRankingType === 'coins' ? 'まだコインデータがありません。' :
        'プレイ時間データがまだありません。';
      content += `<div class="sub">${msg}</div>`;
    }
    content += `</div>`;

    if (G.authToken && G.currentUserId) {
      let myValue = 0;
      try {
        const syncRes = await fetch(`${API_BASE_URL}/api/sync`, {
          headers: { 'Authorization': `Bearer ${G.authToken}` }
        });
        const syncData = await syncRes.json();
        if (G.currentRankingType === 'coins') {
          myValue = syncData.coins || 0;
        } else if (G.currentRankingType === 'playtime') {
          myValue = syncData.playTime || 0;
        } else {
          const bestScores = syncData.bestScores || {};
          myValue = bestScores[G.currentRankingMode] || 0;
        }
      } catch (e) {}

      if (myValue > 0) {
        const higherCount = data.top ? data.top.filter(u => u.value > myValue).length : 0;
        const myInTop = data.top ? data.top.some(u => u.id === G.currentUserId) : false;
        let rankDisplay = myInTop ? `${data.top.findIndex(u => u.id === G.currentUserId) + 1}位` :
          (data.top && data.top.length > 0 ? `${higherCount + 1}位以上` : '-');
        const valueLabel = G.currentRankingType === 'coins' ? `${myValue}コイン` :
          G.currentRankingType === 'playtime' ? `${myValue}秒` :
          `${myValue}点`;
        content += `
          <div style="margin-top:16px; padding:14px 16px; background:linear-gradient(135deg,var(--panel-light),var(--panel)); border-radius:14px; border:2px solid var(--gold); display:flex; justify-content:space-between; align-items:center; position:sticky; bottom:0; backdrop-filter:blur(8px);">
            <span style="font-weight:700; color:var(--gold);">👤 ${G.currentUserId} の順位</span>
            <span style="font-weight:800; font-size:20px; color:var(--gold);">
              ${rankDisplay}
              <span style="font-size:14px; color:var(--text-dim); font-weight:400; margin-left:8px;">${valueLabel}</span>
            </span>
          </div>
        `;
      } else {
        const msg = G.currentRankingType === 'score' ? 'まだこのモードのスコアがありません。' :
          G.currentRankingType === 'coins' ? 'まだコインがありません。' :
          'プレイ時間が記録されていません。';
        content += `
          <div style="margin-top:16px; padding:14px 16px; background:var(--panel-light); border-radius:14px; text-align:center; color:var(--text-dim);">
            📊 ${msg}
          </div>
        `;
      }
    } else {
      content += `
        <div style="margin-top:16px; padding:14px 16px; background:var(--panel-light); border-radius:14px; text-align:center; color:var(--text-dim);">
          🔐 ログインすると自分の順位が表示されます
        </div>
      `;
    }
    document.getElementById('rankingContent').innerHTML = content;
  } catch (err) {
    document.getElementById('rankingContent').innerHTML = `<div class="sub" style="color:var(--coral);">❌ ランキングの読み込みに失敗しました</div>`;
  }
}
