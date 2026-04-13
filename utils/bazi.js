/**
 * 八字排盘工具 - 纯本地实现，无外部依赖
 * 基于天干地支循环 + 儒略日算法
 */

const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const SHICHEN_MAP = [
  { name: '子时', hours: [23, 0], label: '23:00-01:00' },
  { name: '丑时', hours: [1, 2], label: '01:00-03:00' },
  { name: '寅时', hours: [3, 4], label: '03:00-05:00' },
  { name: '卯时', hours: [5, 6], label: '05:00-07:00' },
  { name: '辰时', hours: [7, 8], label: '07:00-09:00' },
  { name: '巳时', hours: [9, 10], label: '09:00-11:00' },
  { name: '午时', hours: [11, 12], label: '11:00-13:00' },
  { name: '未时', hours: [13, 14], label: '13:00-15:00' },
  { name: '申时', hours: [15, 16], label: '15:00-17:00' },
  { name: '酉时', hours: [17, 18], label: '17:00-19:00' },
  { name: '戌时', hours: [19, 20], label: '19:00-21:00' },
  { name: '亥时', hours: [21, 22], label: '21:00-23:00' },
];

const TIANGAN_WUXING = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};

const DIZHI_WUXING = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

// 节气数据：每月两个节气的近似日期（公历）
// 月柱以节气"节"为界：立春、惊蛰、清明、立夏、芒种、小暑、立秋、白露、寒露、立冬、大雪、小寒
const JIE_DATES = [
  [2, 4], [3, 6], [4, 5], [5, 6], [6, 6], [7, 7],
  [8, 8], [9, 8], [10, 8], [11, 7], [12, 7], [1, 6],
];

function solarToJD(year, month, day) {
  if (month <= 2) { year--; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

function getYearGanZhi(year, month, day) {
  // 以立春为界判断年柱归属
  const lichunMonth = 2;
  const lichunDay = 4;
  let adjustedYear = year;
  if (month < lichunMonth || (month === lichunMonth && day < lichunDay)) {
    adjustedYear = year - 1;
  }
  const ganIdx = (adjustedYear - 4) % 10;
  const zhiIdx = (adjustedYear - 4) % 12;
  return { gan: TIANGAN[ganIdx >= 0 ? ganIdx : ganIdx + 10], zhi: DIZHI[zhiIdx >= 0 ? zhiIdx : zhiIdx + 12] };
}

function getMonthGanZhi(year, month, day) {
  // 确定当前处于哪个节气月份（寅月=1月, 卯月=2月...）
  let monthIdx = 0;
  for (let i = 0; i < 12; i++) {
    const [jm, jd] = JIE_DATES[i];
    const nextI = (i + 1) % 12;
    const [nm, nd] = JIE_DATES[nextI];

    if (jm <= nm) {
      if ((month > jm || (month === jm && day >= jd)) && (month < nm || (month === nm && day < nd))) {
        monthIdx = i;
        break;
      }
    } else {
      if (month > jm || (month === jm && day >= jd) || month < nm || (month === nm && day < nd)) {
        monthIdx = i;
        break;
      }
    }
  }

  // 年干决定月干起始（甲己起丙寅）
  const yearGan = getYearGanZhi(year, month, day).gan;
  const yearGanIdx = TIANGAN.indexOf(yearGan);
  const monthGanStart = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0]; // 甲→丙, 乙→戊...
  const ganIdx = (monthGanStart[yearGanIdx] + monthIdx) % 10;
  const zhiIdx = (monthIdx + 2) % 12; // 正月=寅

  return { gan: TIANGAN[ganIdx], zhi: DIZHI[zhiIdx] };
}

function getDayGanZhi(year, month, day) {
  // 基于儒略日计算日柱
  const jd = solarToJD(year, month, day);
  const dayOffset = Math.floor(jd + 0.5);
  // 以甲子日为基准：JD 2299161 = 1582-10-15 = 壬午日
  // 更准确：公元 1900-01-01 (JD 2415021) = 甲戌日 -> 干支序号 = 10
  const base = 2415021;
  const baseGanZhi = 10;
  const diff = dayOffset - base;
  const idx = ((diff + baseGanZhi) % 60 + 60) % 60;
  return { gan: TIANGAN[idx % 10], zhi: DIZHI[idx % 12] };
}

function getTimeGanZhi(dayGan, shichenIndex) {
  const dayGanIdx = TIANGAN.indexOf(dayGan);
  // 日上起时：甲己起甲子，乙庚起丙子...
  const timeGanStart = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
  const ganIdx = (timeGanStart[dayGanIdx] + shichenIndex) % 10;
  return { gan: TIANGAN[ganIdx], zhi: DIZHI[shichenIndex] };
}

// 简易阳历转农历（近似）
function solarToLunarApprox(year, month, day) {
  const LUNAR_MONTHS = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
  const LUNAR_DAYS = [
    '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
  ];
  const YEAR_CHARS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

  const yearStr = String(year).split('').map(c => YEAR_CHARS[parseInt(c)]).join('');
  // 农历月份近似：阳历月-1（非精确，仅展示用）
  const lunarMonthIdx = ((month - 2) + 12) % 12;
  const lunarDay = Math.max(0, Math.min(29, day - 1));

  return {
    year: yearStr,
    month: LUNAR_MONTHS[lunarMonthIdx],
    day: LUNAR_DAYS[lunarDay],
  };
}

// ======================== 姓名五格分析 ========================

const DIGIT_WUXING = ['水', '木', '木', '火', '火', '土', '土', '金', '金', '水'];

function getCharStroke(char) {
  const code = char.charCodeAt(0);
  if (code >= 0x4E00 && code <= 0x9FFF) {
    return ((code - 0x4E00) % 28) + 1;
  }
  return (code % 10) + 1;
}

function calcNameWuxing(name) {
  if (!name || name.length < 2) return null;

  const strokes = Array.from(name).map(getCharStroke);
  const surnameStrokes = strokes[0];
  const givenStrokes = strokes.slice(1);
  const totalStrokes = strokes.reduce((a, b) => a + b, 0);

  const tianGe = surnameStrokes + 1;
  const renGe = surnameStrokes + givenStrokes[0];
  const diGe = givenStrokes.length >= 2
    ? givenStrokes.reduce((a, b) => a + b, 0)
    : givenStrokes[0] + 1;
  const zongGe = totalStrokes;
  const waiGe = Math.max(zongGe - renGe + 1, 2);

  const grids = {
    tianGe: { value: tianGe, wuxing: DIGIT_WUXING[tianGe % 10], label: '天格' },
    renGe: { value: renGe, wuxing: DIGIT_WUXING[renGe % 10], label: '人格' },
    diGe: { value: diGe, wuxing: DIGIT_WUXING[diGe % 10], label: '地格' },
    waiGe: { value: waiGe, wuxing: DIGIT_WUXING[waiGe % 10], label: '外格' },
    zongGe: { value: zongGe, wuxing: DIGIT_WUXING[zongGe % 10], label: '总格' },
  };

  const nameWuxingCount = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
  Object.values(grids).forEach((g) => { nameWuxingCount[g.wuxing]++; });

  return { name, strokes, grids, nameWuxingCount };
}

function countWuxing(pillars) {
  const count = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
  ['year', 'month', 'day', 'time'].forEach((p) => {
    const ge = TIANGAN_WUXING[pillars[p].gan];
    const ze = DIZHI_WUXING[pillars[p].zhi];
    if (ge) count[ge]++;
    if (ze) count[ze]++;
  });
  return count;
}

function calcWuxingEnergy(wuxingCount) {
  const total = Object.values(wuxingCount).reduce((a, b) => a + b, 0);
  if (total === 0) return { '金': 50, '木': 50, '水': 50, '火': 50, '土': 50 };
  const energy = {};
  Object.keys(wuxingCount).forEach((key) => {
    energy[key] = Math.round((wuxingCount[key] / total) * 100);
  });
  return energy;
}

function calculateBazi(year, month, day, shichenIndex, gender, name) {
  const yearGZ = getYearGanZhi(year, month, day);
  const monthGZ = getMonthGanZhi(year, month, day);
  const dayGZ = getDayGanZhi(year, month, day);
  const timeGZ = getTimeGanZhi(dayGZ.gan, shichenIndex);

  const pillars = {
    year: { gan: yearGZ.gan, zhi: yearGZ.zhi, full: yearGZ.gan + yearGZ.zhi },
    month: { gan: monthGZ.gan, zhi: monthGZ.zhi, full: monthGZ.gan + monthGZ.zhi },
    day: { gan: dayGZ.gan, zhi: dayGZ.zhi, full: dayGZ.gan + dayGZ.zhi },
    time: { gan: timeGZ.gan, zhi: timeGZ.zhi, full: timeGZ.gan + timeGZ.zhi },
  };

  const baziWuxingCount = countWuxing(pillars);
  const nameAnalysis = name ? calcNameWuxing(name) : null;

  // 姓名五格五行融合八字五行
  const wuxingCount = { ...baziWuxingCount };
  if (nameAnalysis) {
    Object.keys(nameAnalysis.nameWuxingCount).forEach((key) => {
      wuxingCount[key] += nameAnalysis.nameWuxingCount[key];
    });
  }

  const dayMaster = dayGZ.gan;
  const dayMasterElement = TIANGAN_WUXING[dayMaster];
  const lunar = solarToLunarApprox(year, month, day);

  return {
    solar: { year, month, day, hour: SHICHEN_MAP[shichenIndex].hours[0] },
    lunar,
    shichen: SHICHEN_MAP[shichenIndex],
    pillars,
    baziString: `${pillars.year.full} ${pillars.month.full} ${pillars.day.full} ${pillars.time.full}`,
    dayMaster,
    dayMasterElement,
    name: name || '',
    nameAnalysis,
    baziWuxingCount,
    wuxingCount,
    wuxingEnergy: calcWuxingEnergy(wuxingCount),
    gender,
    dayunList: [],
  };
}

function getShichenList() {
  return SHICHEN_MAP.map((s, index) => ({ ...s, index }));
}

module.exports = {
  calculateBazi,
  getShichenList,
  SHICHEN_MAP,
  TIANGAN_WUXING,
  DIZHI_WUXING,
};
