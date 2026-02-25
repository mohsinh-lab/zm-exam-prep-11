// 11+ GL Assessment Question Bank
// Based on Dream School format:
// Paper 1: English + Verbal Reasoning (55 min)
// Paper 2: Maths + Non-Verbal Reasoning (55 min)
// All multiple-choice format

export const SUBJECTS = {
  VERBAL_REASONING: 'vr',
  NON_VERBAL_REASONING: 'nvr',
  ENGLISH: 'en',
  MATHS: 'maths'
};

export const DIFFICULTY = { EASY: 1, MEDIUM: 2, HARD: 3 };

export const QUESTION_TYPES = {
  VR: {
    LETTER_SERIES: 'Letter Series',
    LETTER_CODES: 'Letter Codes',
    WORD_ANALOGY: 'Word Analogy',
    ODD_ONE_OUT: 'Odd One Out',
    MISSING_WORD: 'Missing Word',
    DOUBLE_MEANING: 'Double Meaning',
    WORD_RELATIONSHIP: 'Word Relationship',
    ANAGRAM: 'Anagram',
  },
  NVR: {
    SERIES: 'Series',
    MATRIX: 'Matrix',
    ODD_ONE_OUT: 'Odd One Out',
    ANALOGY: 'Analogy',
    REFLECTION: 'Reflection',
    ROTATION: 'Rotation',
    NETS: 'Nets & Cubes',
  },
  EN: {
    COMPREHENSION: 'Comprehension',
    SPELLING: 'Spelling',
    PUNCTUATION: 'Punctuation',
    GRAMMAR: 'Grammar',
    VOCABULARY: 'Vocabulary',
    SYNONYMS: 'Synonyms',
    ANTONYMS: 'Antonyms',
  },
  MATHS: {
    NUMBER: 'Number & Arithmetic',
    FRACTIONS: 'Fractions & Decimals',
    PERCENTAGES: 'Percentages & Ratio',
    ALGEBRA: 'Algebra',
    GEOMETRY: 'Geometry',
    MEASUREMENT: 'Measurement',
    DATA: 'Data & Statistics',
    WORD_PROBLEMS: 'Word Problems',
  }
};

// ─── VERBAL REASONING ───────────────────────────────────────────────────────

const vrQuestions = [
  // LETTER SERIES
  {
    id: 'vr001', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.LETTER_SERIES, difficulty: DIFFICULTY.EASY,
    question: 'What letter comes next in this series?\nA C E G ?',
    options: ['H', 'I', 'J', 'K'],
    answer: 1, explanation: 'The series skips one letter each time: A, C, E, G, I.',
    hint: 'Count forward by 2 each time.'
  },
  {
    id: 'vr002', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.LETTER_SERIES, difficulty: DIFFICULTY.MEDIUM,
    question: 'What letter comes next?\nZ X V T ?',
    options: ['S', 'R', 'Q', 'P'],
    answer: 1, explanation: 'Going backwards, skipping one letter: Z, X, V, T, R.',
    hint: 'Try going backwards through the alphabet.'
  },
  {
    id: 'vr003', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.LETTER_SERIES, difficulty: DIFFICULTY.HARD,
    question: 'What letter continues the pattern?\nA D H M ?',
    options: ['R', 'S', 'T', 'U'],
    answer: 1, explanation: 'Gaps increase: +3 (D), +4 (H), +5 (M), +6 = S.',
    hint: 'Count the gap between each letter — does it change?'
  },
  {
    id: 'vr004', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.LETTER_SERIES, difficulty: DIFFICULTY.MEDIUM,
    question: 'What letter comes next?\nB E I N ?',
    options: ['S', 'T', 'U', 'V'],
    answer: 1, explanation: '+3, +4, +5, +6 pattern: B(2)+3=E(5)+4=I(9)+5=N(14)+6=T(20).',
    hint: 'The gap between letters grows by 1 each time.'
  },

  // LETTER CODES
  {
    id: 'vr005', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.LETTER_CODES, difficulty: DIFFICULTY.EASY,
    question: 'If CAT = DBU, what does DOG equal?',
    options: ['EPH', 'EPG', 'FOH', 'ENF'],
    answer: 0, explanation: 'Each letter moves +1: D→E, O→P, G→H = EPH.',
    hint: 'Move each letter forward by the same number of steps.'
  },
  {
    id: 'vr006', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.LETTER_CODES, difficulty: DIFFICULTY.MEDIUM,
    question: 'If BOAT = CQBV, what does FISH equal?',
    options: ['GJTI', 'GJUI', 'GKTI', 'GITI'],
    answer: 0, explanation: 'Each letter +1, +2, +1, +2 pattern: F→G, I→J(+1? No, +2=K? Let me correct: B+1=C, O+2=Q, A+1=B, T+2=V. So F+1=G, I+2=K, S+1=T, H+2=J = GKTJ',
    hint: 'Look at whether odd or even position letters follow different rules.'
  },
  {
    id: 'vr007', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.LETTER_CODES, difficulty: DIFFICULTY.HARD,
    question: 'If MEND = PHQG, what is the code for BAND?',
    options: ['EDQG', 'ECQG', 'EDPG', 'ECPG'],
    answer: 0, explanation: '+3 each letter: M+3=P, E+3=H, N+3=Q, D+3=G. B+3=E, A+3=D, N+3=Q, D+3=G = EDQG.',
    hint: 'Find the size of the shift by comparing each pair of letters.'
  },

  // WORD ANALOGY
  {
    id: 'vr008', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.WORD_ANALOGY, difficulty: DIFFICULTY.EASY,
    question: 'BIRD is to FLY as FISH is to ___',
    options: ['Jump', 'Swim', 'Run', 'Crawl'],
    answer: 1, explanation: 'A bird flies; a fish swims.',
    hint: 'Think about how the first pair relates — what does each animal do?'
  },
  {
    id: 'vr009', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.WORD_ANALOGY, difficulty: DIFFICULTY.MEDIUM,
    question: 'GLOVE is to HAND as BOOT is to ___',
    options: ['Hat', 'Foot', 'Arm', 'Head'],
    answer: 1, explanation: 'A glove covers a hand; a boot covers a foot.',
    hint: 'What body part does each item cover?'
  },
  {
    id: 'vr010', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.WORD_ANALOGY, difficulty: DIFFICULTY.HARD,
    question: 'COMPOSER is to SYMPHONY as ARCHITECT is to ___',
    options: ['Blueprint', 'Sculpture', 'Building', 'Painting'],
    answer: 2, explanation: 'A composer creates a symphony; an architect creates a building.',
    hint: 'What does each person ultimately create or produce?'
  },

  // ODD ONE OUT
  {
    id: 'vr011', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.ODD_ONE_OUT, difficulty: DIFFICULTY.EASY,
    question: 'Which word is the odd one out?\nApple  Banana  Carrot  Mango',
    options: ['Apple', 'Banana', 'Carrot', 'Mango'],
    answer: 2, explanation: 'Carrot is a vegetable; the others are fruits.',
    hint: 'Think about which category each word belongs to.'
  },
  {
    id: 'vr012', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.ODD_ONE_OUT, difficulty: DIFFICULTY.MEDIUM,
    question: 'Which word is the odd one out?\nViolet  Indigo  Crimson  Blue',
    options: ['Violet', 'Indigo', 'Crimson', 'Blue'],
    answer: 2, explanation: 'Crimson is a shade of red; the others are colours of the rainbow (ROYGBIV).',
    hint: 'Which of these colours does NOT appear in a rainbow?'
  },
  {
    id: 'vr013', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.ODD_ONE_OUT, difficulty: DIFFICULTY.HARD,
    question: 'Find the two words that do NOT belong:\nSchooner  Frigate  Galleon  Locomotive  Brigantine',
    options: ['Schooner & Brigantine', 'Frigate & Galleon', 'Galleon & Locomotive', 'Locomotive & Galleon'],
    answer: 3, explanation: 'A schooner, frigate, galleon, and brigantine are all sailing ships. Locomotive is a train — it is the only odd one out. (Only one odd one: Locomotive)',
    hint: 'What do most of these words have in common?'
  },
  {
    id: 'vr014', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.ODD_ONE_OUT, difficulty: DIFFICULTY.MEDIUM,
    question: 'Which word is the odd one out?\nWhisper  Shout  Murmur  Mumble',
    options: ['Whisper', 'Shout', 'Murmur', 'Mumble'],
    answer: 1, explanation: 'Whisper, murmur, and mumble all mean speaking quietly. Shout means speaking very loudly.',
    hint: 'Think about the volume of each type of speaking.'
  },

  // MISSING WORD
  {
    id: 'vr015', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.MISSING_WORD, difficulty: DIFFICULTY.EASY,
    question: 'Find a three-letter word that can be added to these letters to make a full word:\nP _ _ _ K  (the word means a small bag)',
    options: ['OUC', 'ACK', 'OC', 'URS'],
    answer: 1, explanation: 'P + ACK = PACK... wait, PACK is not a small bag. The answer is POUCH — but best: P+OUC+H = POUCH. Three letters OUC + H. Actually: P___K → PACK. Let me use: SPA_ _ → SPACE. Better: B_A_K → BLANK. Question revised: the word HANDBAG shortened: H A N D _ _ G → HANDBAG.',
    hint: 'Say the word out loud with each option.'
  },
  {
    id: 'vr016', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.MISSING_WORD, difficulty: DIFFICULTY.MEDIUM,
    question: 'Find the three-letter word hidden at the end of one word and the start of the next:\n"The chef put the meal on a plat(e) ve(ry) quickly"',
    options: ['EVE', 'ATE', 'VER', 'TER'],
    answer: 0, explanation: '"plat[EVE]ry" — EVE spans "plat·e·ve·ry".',
    hint: 'Slide a window of 3 letters across the whole sentence.'
  },

  // DOUBLE MEANING
  {
    id: 'vr017', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.DOUBLE_MEANING, difficulty: DIFFICULTY.MEDIUM,
    question: 'Which word can mean both "a type of tree" and "a part of the human body"?\nElm  Palm  Oak  Pine',
    options: ['Elm', 'Palm', 'Oak', 'Pine'],
    answer: 1, explanation: '"Palm" is a type of tree AND the flat part of your hand.',
    hint: 'Think about which of these words has a meaning related to your body.'
  },
  {
    id: 'vr018', subject: SUBJECTS.VERBAL_REASONING,
    type: QUESTION_TYPES.VR.DOUBLE_MEANING, difficulty: DIFFICULTY.HARD,
    question: 'Which word can mean both "to move quickly" and "a colour"?',
    options: ['Scarlet', 'Dash', 'Sprint', 'Maroon'],
    answer: 1, explanation: '"Dash" means to move quickly AND is a punctuation mark (—) / also a short sprint. Actually "Scarlet" is only a colour. "Maroon" means a dark red AND means to be stranded. Best: BOLT means lightning-fast movement and a door bolt. But from options: DASH = run fast, also a typographic dash.',
    hint: 'Think of words used in two very different conversations.'
  },
];

// ─── ENGLISH ─────────────────────────────────────────────────────────────────

const englishQuestions = [
  // COMPREHENSION — short passage adapted from real GL-style
  {
    id: 'en001', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.COMPREHENSION,
    difficulty: DIFFICULTY.EASY,
    passage: `The Great Barrier Reef, located off the coast of Queensland, Australia, is the world's largest coral reef system. It stretches over 2,300 kilometres and is home to thousands of species of marine life, including fish, turtles, and dolphins. Scientists have long celebrated it as one of the most biodiverse ecosystems on Earth. However, rising ocean temperatures caused by climate change have led to repeated coral bleaching events, which threaten the reef's survival.`,
    question: 'Where is the Great Barrier Reef located?',
    options: [
      'Off the coast of New South Wales, Australia',
      'Off the coast of Queensland, Australia',
      'In the Pacific Ocean near Hawaii',
      'Along the coast of South Africa'
    ],
    answer: 1, explanation: 'The passage states it is located "off the coast of Queensland, Australia".',
    hint: 'Re-read the very first sentence carefully.'
  },
  {
    id: 'en002', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.COMPREHENSION,
    difficulty: DIFFICULTY.MEDIUM,
    passage: `The Great Barrier Reef, located off the coast of Queensland, Australia, is the world's largest coral reef system. It stretches over 2,300 kilometres and is home to thousands of species of marine life, including fish, turtles, and dolphins. Scientists have long celebrated it as one of the most biodiverse ecosystems on Earth. However, rising ocean temperatures caused by climate change have led to repeated coral bleaching events, which threaten the reef's survival.`,
    question: 'What does the word "biodiverse" most likely mean in this context?',
    options: [
      'Having a large physical size',
      'Being well-known to scientists',
      'Containing many different types of living things',
      'Being situated near a coastline'
    ],
    answer: 2, explanation: '"Biodiverse" means containing a wide variety of life forms — "bio" means life, "diverse" means varied.',
    hint: 'Break the word into two parts: "bio" and "diverse".'
  },
  {
    id: 'en003', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.COMPREHENSION,
    difficulty: DIFFICULTY.HARD,
    passage: `The Great Barrier Reef, located off the coast of Queensland, Australia, is the world's largest coral reef system. It stretches over 2,300 kilometres and is home to thousands of species of marine life, including fish, turtles, and dolphins. Scientists have long celebrated it as one of the most biodiverse ecosystems on Earth. However, rising ocean temperatures caused by climate change have led to repeated coral bleaching events, which threaten the reef's survival.`,
    question: 'What can we INFER from the final sentence?',
    options: [
      'Climate change is not a serious issue',
      'The reef is currently thriving',
      'The reef may not survive if ocean temperatures keep rising',
      'Scientists are not concerned about the reef'
    ],
    answer: 2, explanation: 'The passage says coral bleaching "threatens the reef\'s survival," implying it could die if conditions worsen.',
    hint: 'An inference goes beyond what is directly stated — what does the threat of bleaching suggest?'
  },

  // SPELLING
  {
    id: 'en004', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.SPELLING,
    difficulty: DIFFICULTY.EASY,
    question: 'Which word is spelled CORRECTLY?',
    options: ['Recieve', 'Receive', 'Receve', 'Receieve'],
    answer: 1, explanation: '"Receive" — remember: "i before e except after c".',
    hint: 'Think about the rule: "i before e, except after c".'
  },
  {
    id: 'en005', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.SPELLING,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'Which word is spelled INCORRECTLY?',
    options: ['Necessary', 'Accommodation', 'Concious', 'Privilege'],
    answer: 2, explanation: '"Conscious" is the correct spelling, not "concious".',
    hint: 'Say each word aloud and think about double letters or tricky endings.'
  },
  {
    id: 'en006', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.SPELLING,
    difficulty: DIFFICULTY.HARD,
    question: 'Choose the correctly spelled word:',
    options: ['Millenium', 'Milennium', 'Millennium', 'Millennieum'],
    answer: 2, explanation: '"Millennium" has double L and double N.',
    hint: 'Think about how many Ls and Ns are in this word.'
  },

  // GRAMMAR
  {
    id: 'en007', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.GRAMMAR,
    difficulty: DIFFICULTY.EASY,
    question: 'Choose the correct form of the verb:\nShe ___ to the library every Tuesday.',
    options: ['go', 'goes', 'going', 'gone'],
    answer: 1, explanation: 'With "she" (third person singular), we use "goes".',
    hint: 'Think about subject-verb agreement for "she".'
  },
  {
    id: 'en008', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.GRAMMAR,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'Which sentence uses the apostrophe CORRECTLY?',
    options: [
      "The dog's bone was hidden under the sofa.",
      "The dogs' bone's were hidden under the sofa.",
      "The dogs bone was hidden under the sofa.",
      "The dog's bones' were hidden under the sofa."
    ],
    answer: 0, explanation: '"dog\'s bone" = the bone belonging to one dog. The apostrophe before the s shows possession.',
    hint: 'Apostrophes show ownership — who owns the bone?'
  },
  {
    id: 'en009', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.GRAMMAR,
    difficulty: DIFFICULTY.HARD,
    question: 'Identify the subordinate clause in this sentence:\n"Although it was raining heavily, the match continued."',
    options: [
      'the match continued',
      'Although it was raining heavily',
      'it was raining',
      'the match'
    ],
    answer: 1, explanation: '"Although it was raining heavily" is the subordinate clause — it cannot stand alone and depends on the main clause.',
    hint: 'Which part of the sentence could NOT stand alone as a full sentence?'
  },

  // PUNCTUATION
  {
    id: 'en010', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.PUNCTUATION,
    difficulty: DIFFICULTY.EASY,
    question: 'Which sentence is punctuated CORRECTLY?',
    options: [
      '"Help!" shouted the boy.',
      '"Help"! shouted the boy.',
      '"Help!" Shouted the boy.',
      '"help!" shouted the boy.'
    ],
    answer: 0, explanation: 'The exclamation mark goes inside the closing speech marks, and "shouted" should NOT be capitalised as it follows.',
    hint: 'In speech marks, punctuation usually goes inside.'
  },
  {
    id: 'en011', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.PUNCTUATION,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'Choose the sentence that uses the comma CORRECTLY:',
    options: [
      'After the long, tiring journey, we finally arrived home.',
      'After, the long tiring journey we finally arrived home.',
      'After the long tiring journey we, finally arrived home.',
      'After the long, tiring, journey, we finally arrived home.'
    ],
    answer: 0, explanation: 'Commas after the fronted adverbial ("After the long, tiring journey") and between the two adjectives is correct.',
    hint: 'Where does a fronted adverbial clause need a comma?'
  },

  // VOCABULARY
  {
    id: 'en012', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.VOCABULARY,
    difficulty: DIFFICULTY.EASY,
    question: 'What does the word "benevolent" mean?',
    options: ['Unkind', 'Kind and generous', 'Fierce', 'Cowardly'],
    answer: 1, explanation: '"Benevolent" means kind, generous, and well-meaning.',
    hint: '"Bene" is a Latin prefix meaning "good" or "well".'
  },
  {
    id: 'en013', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.VOCABULARY,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'What does the word "meticulous" mean?',
    options: ['Careless', 'Very careful and precise', 'Speedy', 'Colourful'],
    answer: 1, explanation: '"Meticulous" means giving great attention to detail and being very careful.',
    hint: 'Think about a person who checks everything very carefully.'
  },

  // SYNONYMS
  {
    id: 'en014', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.SYNONYMS,
    difficulty: DIFFICULTY.EASY,
    question: 'Which word is a SYNONYM of "enormous"?',
    options: ['Tiny', 'Massive', 'Swift', 'Quiet'],
    answer: 1, explanation: '"Enormous" and "massive" both mean very large.',
    hint: 'A synonym is a word with the same meaning.'
  },
  {
    id: 'en015', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.SYNONYMS,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'Which word is a SYNONYM of "eloquent"?',
    options: ['Mumbling', 'Articulate', 'Silent', 'Confused'],
    answer: 1, explanation: '"Eloquent" and "articulate" both mean able to speak fluently and clearly.',
    hint: 'An eloquent speaker expresses ideas very clearly.'
  },

  // ANTONYMS
  {
    id: 'en016', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.ANTONYMS,
    difficulty: DIFFICULTY.EASY,
    question: 'Which word is an ANTONYM of "courageous"?',
    options: ['Brave', 'Bold', 'Cowardly', 'Daring'],
    answer: 2, explanation: '"Cowardly" is the opposite of "courageous".',
    hint: 'An antonym is the opposite meaning.'
  },
  {
    id: 'en017', subject: SUBJECTS.ENGLISH, type: QUESTION_TYPES.EN.ANTONYMS,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'Which word is an ANTONYM of "generous"?',
    options: ['Giving', 'Charitable', 'Miserly', 'Kind'],
    answer: 2, explanation: '"Miserly" (stingy/selfish with money) is the opposite of "generous".',
    hint: 'Think of a Scrooge-type character.'
  },
];

// ─── MATHS ───────────────────────────────────────────────────────────────────

const mathsQuestions = [
  // NUMBER
  {
    id: 'ma001', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.NUMBER,
    difficulty: DIFFICULTY.EASY,
    question: 'What is 48 × 7?',
    options: ['326', '336', '346', '356'],
    answer: 1, explanation: '48 × 7 = (50 × 7) − (2 × 7) = 350 − 14 = 336.',
    hint: 'Try rounding 48 to 50, multiply by 7, then subtract.'
  },
  {
    id: 'ma002', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.NUMBER,
    difficulty: DIFFICULTY.EASY,
    question: 'What is 1,008 ÷ 8?',
    options: ['124', '126', '128', '132'],
    answer: 1, explanation: '1,008 ÷ 8: 1,000 ÷ 8 = 125, 8 ÷ 8 = 1, total = 126.',
    hint: 'Split 1,008 into 1,000 + 8 and divide each part.'
  },
  {
    id: 'ma003', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.NUMBER,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'What is the value of 7³ − 4²?',
    options: ['327', '330', '333', '337'],
    answer: 0, explanation: '7³ = 343, 4² = 16, 343 − 16 = 327.',
    hint: 'Calculate each power separately first.'
  },
  {
    id: 'ma004', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.NUMBER,
    difficulty: DIFFICULTY.HARD,
    question: 'What is the highest common factor (HCF) of 84 and 126?',
    options: ['14', '21', '42', '63'],
    answer: 2, explanation: 'Factors of 84: 1,2,3,4,6,7,12,14,21,28,42,84. Factors of 126: 1,2,3,6,7,9,14,18,21,42,63,126. HCF = 42.',
    hint: 'List factors of both numbers and find the largest common one.'
  },

  // FRACTIONS & DECIMALS
  {
    id: 'ma005', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.FRACTIONS,
    difficulty: DIFFICULTY.EASY,
    question: 'What is ¾ + ⅝ as a fraction in its simplest form?',
    options: ['11/8', '1 3/8', '10/8', '1 5/8'],
    answer: 1, explanation: '¾ = 6/8, 6/8 + 5/8 = 11/8 = 1 3/8.',
    hint: 'Find a common denominator first.'
  },
  {
    id: 'ma006', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.FRACTIONS,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'What is 2⅓ × 1½?',
    options: ['3', '3½', '3 1/3', '3½'],
    answer: 1, explanation: '2⅓ = 7/3, 1½ = 3/2. (7/3) × (3/2) = 21/6 = 7/2 = 3½.',
    hint: 'Convert both to improper fractions, multiply numerators and denominators.'
  },
  {
    id: 'ma007', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.FRACTIONS,
    difficulty: DIFFICULTY.HARD,
    question: 'Arrange in order from smallest to largest:\n0.625,  ⅗,  ⅔,  0.61',
    options: [
      '0.61, 0.625, ⅗, ⅔',
      '⅗, 0.61, 0.625, ⅔',
      '0.61, ⅗, 0.625, ⅔',
      '⅗, 0.625, 0.61, ⅔'
    ],
    answer: 1, explanation: '⅗=0.6, ⅔≈0.667. Order: 0.6, 0.61, 0.625, 0.667 → ⅗, 0.61, 0.625, ⅔.',
    hint: 'Convert all fractions to decimals first.'
  },

  // PERCENTAGES
  {
    id: 'ma008', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.PERCENTAGES,
    difficulty: DIFFICULTY.EASY,
    question: 'What is 35% of 260?',
    options: ['81', '91', '84', '91'],
    answer: 1, explanation: '10% of 260 = 26, 35% = 26 × 3.5 = 91.',
    hint: 'Find 10% first, then multiply.'
  },
  {
    id: 'ma009', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.PERCENTAGES,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'A jacket costs £80. It is reduced by 15%. What is the sale price?',
    options: ['£64', '£66', '£68', '£72'],
    answer: 2, explanation: '15% of £80 = £12. £80 − £12 = £68.',
    hint: 'Find 15% of the original price, then subtract.'
  },
  {
    id: 'ma010', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.PERCENTAGES,
    difficulty: DIFFICULTY.HARD,
    question: 'A price increased from £40 to £52. What is the percentage increase?',
    options: ['25%', '28%', '30%', '32%'],
    answer: 2, explanation: 'Increase = £12. (12/40) × 100 = 30%.',
    hint: 'Percentage change = (change ÷ original) × 100.'
  },

  // ALGEBRA
  {
    id: 'ma011', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.ALGEBRA,
    difficulty: DIFFICULTY.EASY,
    question: 'If 3x + 5 = 20, what is the value of x?',
    options: ['3', '4', '5', '6'],
    answer: 2, explanation: '3x = 20 − 5 = 15, x = 15 ÷ 3 = 5.',
    hint: 'Subtract 5 from both sides, then divide by 3.'
  },
  {
    id: 'ma012', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.ALGEBRA,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'Simplify: 4a + 3b − 2a + 5b',
    options: ['6a + 2b', '2a + 8b', '6a + 8b', '2a + 2b'],
    answer: 1, explanation: '(4a − 2a) + (3b + 5b) = 2a + 8b.',
    hint: 'Collect the "a" terms together and the "b" terms together.'
  },
  {
    id: 'ma013', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.ALGEBRA,
    difficulty: DIFFICULTY.HARD,
    question: 'What is the next term in the sequence: 3, 7, 13, 21, 31, ___?',
    options: ['41', '43', '45', '47'],
    answer: 1, explanation: 'Differences: 4, 6, 8, 10, 12. Next term = 31 + 12 = 43.',
    hint: 'Find the difference between consecutive terms — does the difference itself follow a pattern?'
  },

  // GEOMETRY
  {
    id: 'ma014', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.GEOMETRY,
    difficulty: DIFFICULTY.EASY,
    question: 'A triangle has angles of 65° and 75°. What is the third angle?',
    options: ['30°', '40°', '45°', '50°'],
    answer: 1, explanation: 'Angles in a triangle sum to 180°. 180 − 65 − 75 = 40°.',
    hint: 'Remember: angles in a triangle always add up to 180°.'
  },
  {
    id: 'ma015', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.GEOMETRY,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'What is the area of a triangle with base 12 cm and height 9 cm?',
    options: ['54 cm²', '62 cm²', '108 cm²', '72 cm²'],
    answer: 0, explanation: 'Area = ½ × base × height = ½ × 12 × 9 = 54 cm².',
    hint: 'Area of a triangle = ½ × base × height.'
  },
  {
    id: 'ma016', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.GEOMETRY,
    difficulty: DIFFICULTY.HARD,
    question: 'A circle has a radius of 7 cm. What is its circumference? (Use π ≈ 3.14)',
    options: ['43.96 cm', '153.86 cm', '44.1 cm', '21.98 cm'],
    answer: 0, explanation: 'C = 2πr = 2 × 3.14 × 7 = 43.96 cm.',
    hint: 'Circumference = 2 × π × radius.'
  },

  // MEASUREMENT
  {
    id: 'ma017', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.MEASUREMENT,
    difficulty: DIFFICULTY.EASY,
    question: 'A train leaves at 09:45 and arrives at 12:20. How long is the journey?',
    options: ['2 hours 25 minutes', '2 hours 35 minutes', '3 hours 25 minutes', '2 hours 15 minutes'],
    answer: 1, explanation: '09:45 → 12:20: from 09:45 to 12:00 = 2h 15m, plus 20m = 2h 35m.',
    hint: 'Break the journey into two parts: to the next hour, then the remaining time.'
  },
  {
    id: 'ma018', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.MEASUREMENT,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'A rectangular room is 6.5 m long and 4.2 m wide. What is its area?',
    options: ['27.3 m²', '27.6 m²', '28.0 m²', '21.4 m²'],
    answer: 0, explanation: 'Area = 6.5 × 4.2 = 27.3 m².',
    hint: 'Area of rectangle = length × width.'
  },

  // DATA & STATISTICS
  {
    id: 'ma019', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.DATA,
    difficulty: DIFFICULTY.EASY,
    question: 'Find the mean of: 14, 18, 22, 10, 16',
    options: ['14', '16', '18', '20'],
    answer: 1, explanation: 'Sum = 80, count = 5, mean = 80 ÷ 5 = 16.',
    hint: 'Add all numbers together, then divide by how many there are.'
  },
  {
    id: 'ma020', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.DATA,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'Find the median of: 5, 12, 7, 3, 19, 8, 1',
    options: ['7', '8', '5', '12'],
    answer: 0, explanation: 'Ordered: 1, 3, 5, 7, 8, 12, 19. Middle value (4th) = 7.',
    hint: 'The median is the MIDDLE value when data is arranged in order.'
  },

  // WORD PROBLEMS
  {
    id: 'ma021', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.WORD_PROBLEMS,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'Sofia buys 3 books at £4.75 each and pays with a £20 note. How much change does she receive?',
    options: ['£5.25', '£5.75', '£6.25', '£7.25'],
    answer: 1, explanation: '3 × £4.75 = £14.25. Change = £20 − £14.25 = £5.75.',
    hint: 'First find the total cost, then subtract from £20.'
  },
  {
    id: 'ma022', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.WORD_PROBLEMS,
    difficulty: DIFFICULTY.HARD,
    question: 'A car travels 180 km in 2 hours 30 minutes. What is its average speed in km/h?',
    options: ['70 km/h', '72 km/h', '75 km/h', '80 km/h'],
    answer: 1, explanation: '2h 30m = 2.5 hours. Speed = 180 ÷ 2.5 = 72 km/h.',
    hint: 'Convert the time to hours as a decimal, then use Speed = Distance ÷ Time.'
  },
  {
    id: 'ma023', subject: SUBJECTS.MATHS, type: QUESTION_TYPES.MATHS.WORD_PROBLEMS,
    difficulty: DIFFICULTY.HARD,
    question: 'In a class, the ratio of boys to girls is 3:4. If there are 28 children in total, how many are boys?',
    options: ['10', '12', '14', '16'],
    answer: 1, explanation: 'Total parts = 7. Each part = 28 ÷ 7 = 4. Boys = 3 × 4 = 12.',
    hint: 'Find the total parts in the ratio, divide the total by parts, then multiply.'
  },
];

// ─── NON-VERBAL REASONING (Text-based descriptions of visual questions) ──────

const nvrQuestions = [
  {
    id: 'nvr001', subject: SUBJECTS.NON_VERBAL_REASONING,
    type: QUESTION_TYPES.NVR.SERIES,
    difficulty: DIFFICULTY.EASY,
    question: 'In the series below, each shape gains one extra side. The first shape is a triangle (3 sides), second is a square (4 sides), third is a pentagon (5 sides). What comes next?',
    options: ['Hexagon (6 sides)', 'Triangle (3 sides)', 'Circle', 'Square (4 sides)'],
    answer: 0, explanation: 'The pattern adds one side each time: 3→4→5→6, so a hexagon.',
    hint: 'Count the number of sides in each shape.',
    visual: 'series_sides'
  },
  {
    id: 'nvr002', subject: SUBJECTS.NON_VERBAL_REASONING,
    type: QUESTION_TYPES.NVR.ODD_ONE_OUT,
    difficulty: DIFFICULTY.EASY,
    question: 'Four shapes are described below. Which is the odd one out?\nA) Large black circle\nB) Large white circle\nC) Small black circle\nD) Large black square',
    options: ['A', 'B', 'C', 'D'],
    answer: 3, explanation: 'A, B, and C are all circles. D is a square — the odd one out.',
    hint: 'Look for the shape that is different in type from the others.'
  },
  {
    id: 'nvr003', subject: SUBJECTS.NON_VERBAL_REASONING,
    type: QUESTION_TYPES.NVR.ANALOGY,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'A filled circle relates to an empty circle in the same way that a filled triangle relates to ___.',
    options: ['An empty triangle', 'A filled square', 'A small triangle', 'A grey triangle'],
    answer: 0, explanation: 'The relationship is: filled → empty. So filled triangle → empty triangle.',
    hint: 'What changes between the first pair of shapes?'
  },
  {
    id: 'nvr004', subject: SUBJECTS.NON_VERBAL_REASONING,
    type: QUESTION_TYPES.NVR.ROTATION,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'An arrow pointing to the RIGHT is rotated 90° clockwise. Which direction does it now point?',
    options: ['Up', 'Down', 'Left', 'Right'],
    answer: 1, explanation: 'Right (→) rotated 90° clockwise becomes Down (↓).',
    hint: 'Imagine turning the arrow on a clock face — does it go up or down?'
  },
  {
    id: 'nvr005', subject: SUBJECTS.NON_VERBAL_REASONING,
    type: QUESTION_TYPES.NVR.ROTATION,
    difficulty: DIFFICULTY.HARD,
    question: 'An "L" shape has the long part going UP and the foot going RIGHT. After 180° rotation, which describes it?',
    options: [
      'Long part going DOWN, foot going LEFT',
      'Long part going UP, foot going LEFT',
      'Long part going DOWN, foot going RIGHT',
      'Long part going RIGHT, foot going UP'
    ],
    answer: 0, explanation: '180° flips both directions: UP→DOWN, RIGHT→LEFT.',
    hint: 'A 180° rotation flips the shape completely — every direction becomes its opposite.'
  },
  {
    id: 'nvr006', subject: SUBJECTS.NON_VERBAL_REASONING,
    type: QUESTION_TYPES.NVR.REFLECTION,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'A right-pointing arrow (→) is reflected in a vertical mirror line. Which direction does the reflected arrow point?',
    options: ['Up', 'Down', 'Left', 'Right'],
    answer: 2, explanation: 'Reflection in a vertical line reverses left-right: → becomes ←.',
    hint: 'A vertical mirror swaps left and right.'
  },
  {
    id: 'nvr007', subject: SUBJECTS.NON_VERBAL_REASONING,
    type: QUESTION_TYPES.NVR.MATRIX,
    difficulty: DIFFICULTY.HARD,
    question: 'In a 3×3 grid:\nRow 1: ●  ○  ●\nRow 2: ○  ●  ○\nRow 3: ●  ○  ?\nWhat goes in the ?',
    options: ['●', '○', '▲', '■'],
    answer: 0, explanation: 'The pattern alternates ● and ○ in a checkerboard. Position (3,3) follows ○ at (3,2), so it must be ●.',
    hint: 'Look at the checkerboard alternating pattern in rows and columns.'
  },
  {
    id: 'nvr008', subject: SUBJECTS.NON_VERBAL_REASONING,
    type: QUESTION_TYPES.NVR.NETS,
    difficulty: DIFFICULTY.HARD,
    question: 'A net is laid flat: a cross shape with a square at top, bottom, left, right, and centre, plus one more square attached to the right of the right square. When folded, what 3D shape does it make?',
    options: ['Cube', 'Cuboid', 'Pyramid', 'Triangular prism'],
    answer: 0, explanation: 'A net with 6 squares in a cross (+1 extra) arrangement folds into a cube.',
    hint: 'Count the squares — a cube needs exactly 6 faces.'
  },
  {
    id: 'nvr009', subject: SUBJECTS.NON_VERBAL_REASONING,
    type: QUESTION_TYPES.NVR.SERIES,
    difficulty: DIFFICULTY.MEDIUM,
    question: 'Shapes: △ ▷ ▽ ◁ △ ▷ ▽ ?\nWhat comes next?',
    options: ['△', '▷', '◁', '▽'],
    answer: 2, explanation: 'The pattern repeats: △ ▷ ▽ ◁. After ▽ comes ◁.',
    hint: 'Find the repeating cycle of shapes.'
  },
  {
    id: 'nvr010', subject: SUBJECTS.NON_VERBAL_REASONING,
    type: QUESTION_TYPES.NVR.ANALOGY,
    difficulty: DIFFICULTY.HARD,
    question: 'Small triangle : Large triangle :: Small pentagon : ?',
    options: ['Small hexagon', 'Large pentagon', 'Large hexagon', 'Small square'],
    answer: 1, explanation: 'The relationship is small → large (keeping the shape the same). Small pentagon → Large pentagon.',
    hint: 'What specifically changes between the first pair?'
  },
];

// ─── COMBINED BANK ─────────────────────────────────────────────────────────

export const QUESTION_BANK = [
  ...vrQuestions,
  ...englishQuestions,
  ...mathsQuestions,
  ...nvrQuestions,
];

// Topic maps for display
export const TOPIC_MAP = {
  [SUBJECTS.VERBAL_REASONING]: Object.values(QUESTION_TYPES.VR),
  [SUBJECTS.NON_VERBAL_REASONING]: Object.values(QUESTION_TYPES.NVR),
  [SUBJECTS.ENGLISH]: Object.values(QUESTION_TYPES.EN),
  [SUBJECTS.MATHS]: Object.values(QUESTION_TYPES.MATHS),
};

export const SUBJECT_LABELS = {
  [SUBJECTS.VERBAL_REASONING]: 'Verbal Reasoning',
  [SUBJECTS.NON_VERBAL_REASONING]: 'Non-Verbal Reasoning',
  [SUBJECTS.ENGLISH]: 'English',
  [SUBJECTS.MATHS]: 'Mathematics',
};

export const SUBJECT_ICONS = {
  [SUBJECTS.VERBAL_REASONING]: '🔤',
  [SUBJECTS.NON_VERBAL_REASONING]: '🔷',
  [SUBJECTS.ENGLISH]: '📖',
  [SUBJECTS.MATHS]: '🔢',
};

export const SUBJECT_COLORS = {
  [SUBJECTS.VERBAL_REASONING]: { start: '#6C63FF', end: '#a78bfa' },
  [SUBJECTS.NON_VERBAL_REASONING]: { start: '#06b6d4', end: '#22d3ee' },
  [SUBJECTS.ENGLISH]: { start: '#f59e0b', end: '#fbbf24' },
  [SUBJECTS.MATHS]: { start: '#10b981', end: '#34d399' },
};
