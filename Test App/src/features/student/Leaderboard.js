
import { getTopLeaderboard } from '../../engine/leaderboard.js';

export function renderLeaderboard() {
    return `
<div class="page page-enter">
  <div style="text-align:center;margin-bottom:32px">
    <div style="font-size:48px;margin-bottom:8px" aria-hidden="true">🏆</div>
    <h1 class="page-title">Hall of Fame</h1>
    <p class="page-subtitle">The top AcePrep students this season</p>
  </div>

  <div class="card shadow-lg" style="max-width:600px;margin:0 auto;padding:0;overflow:hidden">
    <div id="leaderboard-list" style="min-height:300px">
        <div style="padding:40px;text-align:center">
            <div class="loader-bar" style="width:100px;margin:0 auto"><div class="loader-fill"></div></div>
            <p style="margin-top:16px;color:var(--c-text-muted)">Loading global rankings...</p>
        </div>
    </div>
  </div>

  <div style="text-align:center;margin-top:32px;color:var(--c-text-muted);font-size:14px">
    Want to climb higher? Complete daily challenges and master topics!
  </div>
</div>`;
}

export async function mountLeaderboard() {
    const listEl = document.getElementById('leaderboard-list');
    const top = await getTopLeaderboard(10);
    
    if (top.length === 0) {
        listEl.innerHTML = `
            <div style="padding:48px;text-align:center;color:var(--c-text-muted)">
                <p>No champions recorded yet. Be the first!</p>
            </div>`;
        return;
    }

    listEl.innerHTML = top.map((entry, i) => {
        const isTop3 = i < 3;
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
        const bg = i === 0 ? 'rgba(255,215,0,0.05)' : i === 1 ? 'rgba(192,192,192,0.05)' : i === 2 ? 'rgba(205,127,50,0.05)' : 'transparent';
        
        return `
        <div class="report-row" style="padding:20px 24px;border-bottom:1px solid rgba(0,0,0,0.03);background:${bg};display:flex;align-items:center;gap:16px">
            <div style="width:40px;font-weight:900;font-size:${isTop3 ? '24px' : '16px'};text-align:center">${medal}</div>
            <div style="flex:1">
                <div style="font-weight:900;font-size:16px;color:var(--c-text)">${entry.name}</div>
                <div style="font-size:12px;color:var(--c-text-muted);text-transform:uppercase;font-weight:700">Level ${entry.level || 1}</div>
            </div>
            <div style="text-align:right">
                <div style="font-weight:900;font-size:18px;color:var(--c-primary)">${(entry.xp || 0).toLocaleString()}</div>
                <div style="font-size:10px;color:var(--c-text-muted);font-weight:800;letter-spacing:1px">TOTAL XP</div>
            </div>
        </div>`;
    }).join('');
}
