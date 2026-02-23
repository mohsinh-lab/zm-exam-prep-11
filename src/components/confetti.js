// components/confetti.js

export function spawnConfetti() {
    const colors = ['#6C63FF', '#a78bfa', '#10b981', '#f59e0b', '#06b6d4', '#f472b6'];
    for (let i = 0; i < 60; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        el.style.cssText = `
      left: ${Math.random() * 100}vw;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration: ${1.5 + Math.random() * 2}s;
      animation-delay: ${Math.random() * 0.8}s;
    `;
        document.body.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
    }
}
