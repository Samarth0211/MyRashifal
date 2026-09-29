// Pythagorean number mapping: A=1, B=2... I=9, J=1... R=9, S=1... Z=8
const PYTHAGOREAN = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);
const MASTER_NUMBERS = [11, 22, 33];

function reduceToSingle(num) {
  while (num > 9 && !MASTER_NUMBERS.includes(num)) {
    num = String(num).split('').reduce((sum, d) => sum + Number(d), 0);
  }
  return num;
}

function sumLetters(name, filter = null) {
  return name
    .toUpperCase()
    .split('')
    .filter((ch) => {
      if (!PYTHAGOREAN[ch]) return false;
      if (filter === 'vowels') return VOWELS.has(ch);
      if (filter === 'consonants') return !VOWELS.has(ch);
      return true;
    })
    .reduce((sum, ch) => sum + PYTHAGOREAN[ch], 0);
}

export function calculateLifePathNumber(dob) {
  // DOB format: YYYY-MM-DD
  const digits = dob.replace(/-/g, '').split('').reduce((sum, d) => sum + Number(d), 0);
  return reduceToSingle(digits);
}

export function calculateExpressionNumber(fullName) {
  return reduceToSingle(sumLetters(fullName));
}

export function calculateSoulUrgeNumber(fullName) {
  return reduceToSingle(sumLetters(fullName, 'vowels'));
}

export function calculatePersonalityNumber(fullName) {
  return reduceToSingle(sumLetters(fullName, 'consonants'));
}

export function calculateBirthdayNumber(dob) {
  const day = parseInt(dob.split('-')[2], 10);
  return reduceToSingle(day);
}

export function calculateAllNumbers(name, dob) {
  return {
    lifePath: calculateLifePathNumber(dob),
    expression: calculateExpressionNumber(name),
    soulUrge: calculateSoulUrgeNumber(name),
    personality: calculatePersonalityNumber(name),
    birthday: calculateBirthdayNumber(dob),
  };
}

// Static interpretations for numbers 1-9, 11, 22, 33
export const LIFE_PATH_MEANINGS = {
  1: 'The Leader — Independent, ambitious, and pioneering. You are a natural-born leader with strong willpower and determination. You forge your own path.',
  2: 'The Diplomat — Cooperative, sensitive, and balanced. You thrive in partnerships and are gifted at bringing harmony. Your strength lies in collaboration.',
  3: 'The Communicator — Creative, expressive, and joyful. You have natural artistic talent and a gift for inspiring others through words and art.',
  4: 'The Builder — Practical, disciplined, and hardworking. You build strong foundations in everything you do. Stability and order are your strengths.',
  5: 'The Adventurer — Dynamic, versatile, and freedom-loving. You embrace change and thrive on new experiences. Life is your greatest teacher.',
  6: 'The Nurturer — Responsible, caring, and family-oriented. You have a deep sense of duty towards loved ones. Home and harmony are sacred to you.',
  7: 'The Seeker — Analytical, spiritual, and introspective. You are drawn to deeper truths and the mysteries of life. Wisdom comes through solitude.',
  8: 'The Powerhouse — Ambitious, authoritative, and material-minded. You have natural business acumen and the drive to achieve great material success.',
  9: 'The Humanitarian — Compassionate, generous, and idealistic. You are here to serve humanity. Your life purpose involves selfless giving.',
  11: 'Master Intuitive — Highly intuitive and spiritually aware. You are a visionary with the potential to inspire masses. Sensitive to energies around you.',
  22: 'Master Builder — The most powerful number. You can turn grand visions into reality. Capable of achieving great things on a large scale.',
  33: 'Master Teacher — The most spiritually evolved. You embody unconditional love and are here to uplift humanity through teaching and healing.',
};
