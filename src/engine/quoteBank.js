// src/engine/quoteBank.js — Curated Wisdom for Junior Scholars

export const ISLAMIC_QUOTES = [
    {
        text: "The best among you are those who have the best manners and character.",
        source: "Prophet Muhammad (pbuh)",
        category: "Character"
    },
    {
        text: "He who travels in search of knowledge, to him Allah shows the way to Paradise.",
        source: "Prophet Muhammad (pbuh)",
        category: "Knowledge"
    },
    {
        text: "Knowledge without action is insanity, and action without knowledge is vanity.",
        source: "Imam Ghazali",
        category: "Action"
    },
    {
        text: "The ink of the scholar is more holy than the blood of the martyr.",
        source: "Prophet Muhammad (pbuh)",
        category: "Knowledge"
    },
    {
        text: "Be like the flower that gives its fragrance even to the hand that crushes it.",
        source: "Ali ibn Abi Talib (ra)",
        category: "Kindness"
    },
    {
        text: "Allah is gentle and He loves gentleness.",
        source: "Prophet Muhammad (pbuh)",
        category: "Gentleness"
    },
    {
        text: "Knowledge is a treasure, but practice is the key to it.",
        source: "Ibn Hazm",
        category: "Practice"
    },
    {
        text: "Happiness is not in having much, but in being content with what you have.",
        source: "Prophet Muhammad (pbuh)",
        category: "Gratitude"
    },
    {
        text: "The closest a servant comes to his Lord is when he is in prostration (Sajdah).",
        source: "Prophet Muhammad (pbuh)",
        category: "Worship"
    },
    {
        text: "O Allah, help me to remember You, to thank You, and to worship You in the best way.",
        source: "Prophet Muhammad (pbuh)",
        category: "Worship"
    },
    {
        text: "Worship Allah as if you see Him, for if you do not see Him, He sees you.",
        source: "Prophet Muhammad (pbuh)",
        category: "Spiritual Path"
    },
    {
        text: "Taking the righteous path leads to peace of mind and the love of Allah.",
        source: "Muslim Scholar",
        category: "Righteous Path"
    },
    {
        text: "Establish prayer at the two ends of the day and in the early part of the night.",
        source: "The Holy Quran",
        category: "Worship"
    }
];

export const GENERAL_MOTIVATIONS = [
    { text: "Believe you can and you're halfway there.", source: "T. Roosevelt" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", source: "W. Churchill" },
    { text: "The only way to do great work is to love what you do.", source: "Steve Jobs" }
];

export function getRandomWeekendQuote() {
    const combined = [...ISLAMIC_QUOTES];
    return combined[Math.floor(Math.random() * combined.length)];
}

export function getMinuteAwareQuote() {
    // Rotates quotes based on the current hour and minute
    const date = new Date();
    const minute = date.getMinutes();
    const hour = date.getHours();
    const allQuotes = [...ISLAMIC_QUOTES, ...GENERAL_MOTIVATIONS];

    // Seeded index that changes every minute
    const index = (hour * 60 + minute) % allQuotes.length;
    return allQuotes[index].text;
}
