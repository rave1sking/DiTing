/**
 * 西方星座与今日运势（本地生成，按日期+星座确定性随机）
 */

const ZODIAC_SIGNS = [
  { name: '摩羯座', symbol: '♑', element: '土', start: [12, 22], end: [1, 19] },
  { name: '水瓶座', symbol: '♒', element: '风', start: [1, 20], end: [2, 18] },
  { name: '双鱼座', symbol: '♓', element: '水', start: [2, 19], end: [3, 20] },
  { name: '白羊座', symbol: '♈', element: '火', start: [3, 21], end: [4, 19] },
  { name: '金牛座', symbol: '♉', element: '土', start: [4, 20], end: [5, 20] },
  { name: '双子座', symbol: '♊', element: '风', start: [5, 21], end: [6, 21] },
  { name: '巨蟹座', symbol: '♋', element: '水', start: [6, 22], end: [7, 22] },
  { name: '狮子座', symbol: '♌', element: '火', start: [7, 23], end: [8, 22] },
  { name: '处女座', symbol: '♍', element: '土', start: [8, 23], end: [9, 22] },
  { name: '天秤座', symbol: '♎', element: '风', start: [9, 23], end: [10, 23] },
  { name: '天蝎座', symbol: '♏', element: '水', start: [10, 24], end: [11, 22] },
  { name: '射手座', symbol: '♐', element: '火', start: [11, 23], end: [12, 21] },
];

const FORTUNE_POOLS = {
  overall: [
    '整体能量平稳向上，适合按自己的节奏推进计划。',
    '今日直觉敏锐，细微处藏着不错的机会。',
    '心态放松时，好运更容易主动靠近你。',
    '适合整理思绪，把精力放在真正重要的事上。',
    '社交运回暖，一句真诚的问候可能带来惊喜。',
    '执行力在线，完成一件小事就能提振信心。',
    '宜慢不宜急，稳扎稳打比冲刺更划算。',
    '创意灵感活跃，表达与分享会收获好评。',
  ],
  love: [
    '单身者不妨多微笑，亲和力是最好的桃花。',
    '有伴者适合制造小浪漫，日常也能很甜。',
    '沟通比猜测更有效，把心里话温柔说出来。',
    '给彼此一点空间，关系反而更轻松。',
    '旧友联络可能带来温暖的情绪价值。',
  ],
  career: [
    '工作上适合推进细节，认真会被看见。',
    '团队协作顺畅，主动分担能赢得信任。',
    '不宜贪多，专注一件事更容易出成果。',
    '学习新技能的好日子，投资自己不吃亏。',
    '会议与洽谈宜准备充分，表达要简洁有力。',
  ],
  wellness: [
    '注意作息，午后适合短暂休息充电。',
    '轻运动或散步有助于舒缓压力。',
    '多喝水、少熬夜，身体会给你好反馈。',
    '情绪宜疏导，写日记或听音乐都不错。',
    '饮食清淡一些，肠胃会更舒服。',
  ],
};

const LUCKY_COLORS = ['雾霾蓝', '薄荷绿', '暖杏色', '薰衣草紫', '珊瑚粉', '香槟金', '天空白', '琥珀棕'];
const LUCKY_NUMBERS = [1, 2, 3, 5, 6, 7, 8, 9, 11, 16, 18, 21, 28, 33];

function hashStr(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function isInRange(month, day, start, end) {
  const [sm, sd] = start;
  const [em, ed] = end;
  const cur = month * 100 + day;
  const s = sm * 100 + sd;
  const e = em * 100 + ed;
  if (s <= e) return cur >= s && cur <= e;
  return cur >= s || cur <= e;
}

/** 根据阳历月日获取星座 */
function getZodiacSign(month, day) {
  for (let i = 0; i < ZODIAC_SIGNS.length; i++) {
    const z = ZODIAC_SIGNS[i];
    if (isInRange(month, day, z.start, z.end)) return { ...z, index: i };
  }
  return { ...ZODIAC_SIGNS[0], index: 0 };
}

/** 根据出生日期字符串 YYYY-MM-DD */
function getZodiacFromBirthDate(birthDateStr) {
  if (!birthDateStr) return null;
  const parts = birthDateStr.split('-').map(Number);
  if (parts.length < 3 || !parts[0] || !parts[1] || !parts[2]) return null;
  const [, month, day] = parts;
  return getZodiacSign(month, day);
}

function pickFromPool(pool, seed) {
  return pool[seed % pool.length];
}

function starsFromScore(score) {
  const full = Math.floor(score / 20);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

/**
 * 生成今日星座运势
 * @param {string} birthDateStr - YYYY-MM-DD
 * @param {string} [todayStr] - YYYY-MM-DD，默认今天
 */
function getTodayHoroscope(birthDateStr, todayStr) {
  const zodiac = getZodiacFromBirthDate(birthDateStr);
  if (!zodiac) return null;

  const today = todayStr || new Date().toISOString().slice(0, 10);
  const seedBase = `${today}_${zodiac.name}_${birthDateStr}`;
  const h = hashStr(seedBase);

  const overallScore = 60 + (h % 35);
  const loveScore = 55 + ((h >> 3) % 40);
  const careerScore = 55 + ((h >> 6) % 40);
  const wellnessScore = 55 + ((h >> 9) % 40);

  return {
    signName: zodiac.name,
    symbol: zodiac.symbol,
    element: zodiac.element,
    date: today,
    birthDate: birthDateStr,
    overall: pickFromPool(FORTUNE_POOLS.overall, h),
    love: pickFromPool(FORTUNE_POOLS.love, h >> 2),
    career: pickFromPool(FORTUNE_POOLS.career, h >> 4),
    wellness: pickFromPool(FORTUNE_POOLS.wellness, h >> 6),
    overallScore,
    loveScore,
    careerScore,
    wellnessScore,
    overallStars: starsFromScore(overallScore),
    loveStars: starsFromScore(loveScore),
    careerStars: starsFromScore(careerScore),
    wellnessStars: starsFromScore(wellnessScore),
    luckyColor: LUCKY_COLORS[h % LUCKY_COLORS.length],
    luckyNumber: LUCKY_NUMBERS[h % LUCKY_NUMBERS.length],
    summary: pickFromPool(FORTUNE_POOLS.overall, h >> 1),
  };
}

module.exports = {
  ZODIAC_SIGNS,
  getZodiacSign,
  getZodiacFromBirthDate,
  getTodayHoroscope,
};
