
const translations = {
    en: {
        home: 'Home',
        plan: 'Study Plan',
        ranks: 'Leaderboard',
        badges: 'Achievements',
        skins: 'Ace Skins',
        logout: 'Logout',
        parents: 'Parent Portal',
        mission_control: 'MISSION CONTROL',
        daily_training: 'Daily Training',
        welcome: 'Welcome back,',
        next_exam: 'NEXT EXAM: SEP 2026'
    },
    ur: {
        home: 'گھر',
        plan: 'مطالعہ کا منصوبہ',
        ranks: 'لیڈر بورڈ',
        badges: 'کامیابیاں',
        skins: 'اسکنز',
        logout: 'لاگ آؤٹ',
        parents: 'والدین کا پورٹل',
        mission_control: 'مشن کنٹرول',
        daily_training: 'روزانہ کی تربیت',
        welcome: 'خوش آمدید،',
        next_exam: 'اگلا امتحان: ستمبر 2026'
    }
};

let currentLang = localStorage.getItem('ace_lang') || 'en';

export function getTranslation(key) {
    return translations[currentLang][key] || key;
}

export function setLanguage(lang) {
    if (translations[lang]) {
        currentLang = lang;
        localStorage.setItem('ace_lang', lang);
        window.dispatchEvent(new CustomEvent('lang_changed', { detail: lang }));
        window.router.handleRoute(); // Refresh UI
    }
}

export function getCurrentLang() {
    return currentLang;
}
