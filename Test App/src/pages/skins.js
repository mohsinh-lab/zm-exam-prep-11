
import { getProgress, updateProgress, SKIN_DEFINITIONS } from '../engine/progressStore.js';

export function renderSkins() {
    const progress = getProgress();
    const active = progress.activeSkin || 'default';
    const unlocked = progress.unlockedSkins || ['default'];
    
    return `
<div class="page page-enter">
    <div style="text-align:center;margin-bottom:32px">
        <h1 class="page-title">Personalize Ace</h1>
        <p class="page-subtitle">Unlock new suits as you earn XP</p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:20px;max-width:900px;margin:0 auto">
        <!-- Default Skin -->
        <div class="card ${active === 'default' ? 'active-skin' : ''}" 
             style="border:2px solid ${active === 'default' ? 'var(--c-primary)' : 'transparent'};position:relative;cursor:pointer"
             onclick="window._equipSkin('default')"
             role="button" aria-pressed="${active === 'default'}" aria-label="Classic Ace Scholar Skin">
            <div style="font-size:48px;text-align:center;margin-bottom:12px" aria-hidden="true">🎓</div>
            <h3 style="text-align:center;font-weight:800">Classic Ace</h3>
            <p style="text-align:center;font-size:13px;color:var(--c-text-muted)">The original scholar</p>
            ${active === 'default' ? '<div class="tag tag-vr" style="position:absolute;top:10px;right:10px">EQUIPPED</div>' : ''}
        </div>

        ${SKIN_DEFINITIONS.map(skin => {
            const isUnlocked = unlocked.includes(skin.id);
            const isActive = active === skin.id;
            
            return `
            <div class="card ${isActive ? 'active-skin' : ''} ${!isUnlocked ? 'locked-skin' : ''}" 
                 style="border:2px solid ${isActive ? skin.color : 'transparent'};position:relative;cursor:${isUnlocked ? 'pointer' : 'not-allowed'};opacity:${isUnlocked ? 1 : 0.6}"
                 onclick="${isUnlocked ? `window._equipSkin('${skin.id}')` : ''}"
                 role="button" aria-pressed="${isActive}" aria-disabled="${!isUnlocked}" aria-label="${skin.label} Skin - ${isUnlocked ? 'Unlocked' : `Locked: Needs ${skin.xp} XP`}">
                <div style="font-size:48px;text-align:center;margin-bottom:12px" aria-hidden="true">${isUnlocked ? skin.emoji : '🔒'}</div>
                <h3 style="text-align:center;font-weight:800;color:${isUnlocked ? skin.color : 'inherit'}">${skin.label}</h3>
                <p style="text-align:center;font-size:13px;color:var(--c-text-muted)">
                    ${isUnlocked ? 'Legendary uniform' : `Unlocks at ${skin.xp.toLocaleString()} XP`}
                </p>
                ${isActive ? `<div class="tag" style="position:absolute;top:10px;right:10px;background:${skin.color};color:white">EQUIPPED</div>` : ''}
                ${!isUnlocked ? `
                <div class="progress-bar" style="height:4px;margin-top:12px">
                    <div class="progress-fill" style="width:${Math.min(100, (progress.xp / skin.xp) * 100)}%;background:${skin.color}"></div>
                </div>` : ''}
            </div>`;
        }).join('')}
    </div>

    <div style="text-align:center;margin-top:40px">
        <button class="btn btn-outline" onclick="window.router.navigate('#/student/badges')">🏅 Back to Badges</button>
    </div>
</div>
<style>
    .active-skin { transform: scale(1.05); box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important; z-index: 1; }
    .locked-skin { filter: grayscale(0.2); }
</style>`;
}

export function mountSkins() {
    window._equipSkin = (id) => {
        const progress = getProgress();
        if (progress.unlockedSkins.includes(id) || id === 'default') {
            progress.activeSkin = id;
            updateProgress(progress);
            window.router.handleRoute();
        }
    };
}
