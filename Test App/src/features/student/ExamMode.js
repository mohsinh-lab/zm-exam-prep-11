
import { getSessionQuestions } from '../../engine/adaptiveEngine.js';
import { recordSession } from '../../engine/progressStore.js';
import { spawnConfetti } from '../../components/confetti.js';

export function renderExamMode() {
    return `
<div class="page exam-page" style="background:#f8fafc;min-height:100dvh;padding:0">
    <!-- Exam Header -->
    <nav class="navbar" style="background:white;box-shadow:var(--shadow-sm);position:sticky;top:0;z-index:100;height:70px">
        <div class="nav-logo" style="font-size:18px">📝 FULL MOCK EXAM</div>
        <div style="flex:1"></div>
        <div id="exam-timer" style="font-family:monospace;font-size:24px;font-weight:900;color:var(--c-danger);background:#fee2e2;padding:4px 16px;border-radius:8px">55:00</div>
        <div style="flex:1"></div>
        <button class="btn btn-outline btn-sm" onclick="window._exitExam()">EXIT</button>
    </nav>

    <div id="exam-container" style="max-width:800px;margin:40px auto;padding:0 20px pb-100px">
        <div id="exam-intro" class="card shadow-lg" style="text-align:center;padding:48px">
            <div style="font-size:64px;margin-bottom:24px">⏱️</div>
            <h1 style="font-family:var(--font-heading);font-weight:950;font-size:32px">Ready for Paper 1?</h1>
            <p style="color:var(--c-text-muted);font-size:18px;margin-bottom:32px">
                GL Assessment Format: English & Verbal Reasoning<br>
                50 Questions · 55 Minutes · No Hints
            </p>
            <button class="btn btn-primary btn-lg" style="width:100%;max-width:300px" onclick="window._startExam()">
                START MOCK EXAM
            </button>
        </div>
        <div id="exam-quiz" style="display:none">
            <!-- Quiz content will be injected here -->
        </div>
    </div>

    <!-- Exam Footer -->
    <div id="exam-footer" style="display:none;position:fixed;bottom:0;left:0;right:0;background:white;padding:20px;border-top:1px solid #e2e8f0;display:flex;justify-content:center;gap:20px">
        <div id="exam-progress-dots" style="display:flex;gap:4px;overflow-x:auto;max-width:600px;align-items:center"></div>
        <button id="exam-next-btn" class="btn btn-primary" style="min-width:180px">NEXT QUESTION</button>
    </div>
</div>
<style>
    .exam-page { --c-primary: #1e293b; --c-accent: #3b82f6; }
    .exam-option { border: 2px solid #e2e8f0; padding: 16px 20px; border-radius: 12px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s; font-weight: 700; text-align:left; background:white; width:100%; }
    .exam-option:hover { border-color: var(--c-accent); background: #f0f7ff; }
    .exam-option.selected { border-color: var(--c-accent); background: #3b82f6; color:white; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #e2e8f0; flex-shrink:0; }
    .dot.active { background: var(--c-accent); transform: scale(1.3); }
    .dot.answered { background: #94a3b8; }
</style>`;
}

export function mountExamMode() {
    let currentQuestions = [];
    let currentIndex = 0;
    let answers = [];
    let timerInterval = null;
    let timeLeft = 55 * 60; // 55 minutes

    window._exitExam = () => {
        if (confirm("Quit exam? Progress will not be saved.")) {
            clearInterval(timerInterval);
            window.router.navigate('#/student/home');
        }
    };

    window._startExam = () => {
        const enQ = getSessionQuestions('en', 25);
        const vrQ = getSessionQuestions('vr', 25);
        currentQuestions = [...enQ, ...vrQ];
        currentIndex = 0;
        answers = new Array(currentQuestions.length).fill(null);

        document.getElementById('exam-intro').style.display = 'none';
        document.getElementById('exam-quiz').style.display = 'block';
        document.getElementById('exam-footer').style.display = 'flex';
        
        startTimer();
        renderQuestion();
        renderDots();
    };

    function startTimer() {
        const timerEl = document.getElementById('exam-timer');
        timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                finishExam();
                return;
            }
            const min = Math.floor(timeLeft / 60);
            const sec = timeLeft % 60;
            timerEl.innerText = `${min}:${sec.toString().padStart(2, '0')}`;
            if (timeLeft < 300) timerEl.style.background = '#fecaca'; // Red alert at 5 mins
        }, 1000);
    }

    function renderQuestion() {
        const q = currentQuestions[currentIndex];
        const quizEl = document.getElementById('exam-quiz');
        
        quizEl.innerHTML = `
            <div class="card shadow-sm" style="margin-bottom:24px">
                <div style="font-size:12px;font-weight:800;color:var(--c-text-muted);margin-bottom:12px;text-transform:uppercase;letter-spacing:1px">
                    Question ${currentIndex + 1} of ${currentQuestions.length} · ${q.subject.toUpperCase()}
                </div>
                <h2 style="font-size:20px;font-weight:800;margin-bottom:24px;line-height:1.5">${q.text}</h2>
                <div id="options-grid">
                    ${q.options.map((opt, i) => `
                        <button class="exam-option ${answers[currentIndex] === i ? 'selected' : ''}" onclick="window._selectOption(${i})">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
            </div>`;

        const nextBtn = document.getElementById('exam-next-btn');
        nextBtn.innerText = currentIndex === currentQuestions.length - 1 ? 'FINISH EXAM' : 'NEXT QUESTION';
        nextBtn.onclick = () => {
            if (currentIndex === currentQuestions.length - 1) finishExam();
            else {
                currentIndex++;
                renderQuestion();
                renderDots();
            }
        };
    }

    function renderDots() {
        const dotsEl = document.getElementById('exam-progress-dots');
        dotsEl.innerHTML = currentQuestions.map((_, i) => `
            <div class="dot ${i === currentIndex ? 'active' : ''} ${answers[i] !== null ? 'answered' : ''}"></div>
        `).join('');
    }

    window._selectOption = (idx) => {
        answers[currentIndex] = idx;
        renderQuestion();
        renderDots();
    };

    function finishExam() {
        clearInterval(timerInterval);
        const results = currentQuestions.map((q, i) => ({
            isCorrect: answers[i] === q.correct
        }));

        const totalTime = 55 * 60 - timeLeft;
        const session = recordSession('mock_exam', currentQuestions, results, totalTime);
        
        const correct = results.filter(r => r.isCorrect).length;
        const score = Math.round((correct / currentQuestions.length) * 100);

        document.getElementById('exam-container').innerHTML = `
            <div class="card shadow-lg page-enter" style="text-align:center;padding:48px">
                <div style="font-size:64px;margin-bottom:24px">🎊</div>
                <h1 style="font-family:var(--font-heading);font-weight:950;font-size:32px">Exam Complete!</h1>
                <p style="color:var(--c-text-muted);font-size:18px;margin-bottom:32px">
                    You've finished your first full-length mock simulation.
                </p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:32px">
                    <div class="card" style="background:#f0f9ff;border:none">
                        <div style="font-size:12px;font-weight:800;margin-bottom:4px">SCORE</div>
                        <div style="font-size:32px;font-weight:900;color:#0369a1">${score}%</div>
                    </div>
                    <div class="card" style="background:#f0fdf4;border:none">
                        <div style="font-size:12px;font-weight:800;margin-bottom:4px">XP GAINED</div>
                        <div style="font-size:32px;font-weight:900;color:#15803d">+${session.xpGained * 2}</div>
                    </div>
                </div>
                <button class="btn btn-primary btn-lg" style="width:100%" onclick="window.router.navigate('#/student/home')">
                    RETURN TO DASHBOARD
                </button>
            </div>`;
        document.getElementById('exam-footer').style.display = 'none';
        spawnConfetti();
    }
}
