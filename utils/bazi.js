/**
 * 八字排盘工具 - 纯本地实现，无外部依赖
 * 基于天干地支循环 + 儒略日算法
 */

const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const { solarToLunar, formatLunar } = require('./lunar');
const {
  buildTraditionalChart,
  getMonthIdxByJie,
  countWuxingWithCangGan,
} = require('./bazi-traditional');

// 方位五行（按出生地或所在地纬度+经度划分大致方位）
function getLocationWuxing(lng, lat) {
  // 中国版图参考中心约 105°E, 35°N
  // 东=木, 南=火, 西=金, 北=水, 中=土
  if (lat >= 32 && Math.abs(lng - 105) <= 10) return '土'; // 中原
  if (lng >= 115) return lat >= 33 ? '木' : '火'; // 东部
  if (lng < 105) return lat >= 35 ? '金' : '水';  // 西部
  return lat >= 35 ? '水' : '火';
}

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
  const monthIdx = getMonthIdxByJie(year, month, day);

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

// 真太阳时校正：根据经度调整时辰索引
// 北京时间以 120°E 为基准，每偏离 1° 相差 4 分钟
// 返回校正后的小时浮点值（0-24）
function applySolarTimeCorrection(hour, lng) {
  if (lng == null) return hour;
  const diffMinutes = (lng - 120) * 4;
  const correctedHour = hour + diffMinutes / 60;
  return ((correctedHour % 24) + 24) % 24;
}

// 根据校正后的真太阳时推算时辰索引
function getShichenIndexFromHour(hour) {
  const h = Math.round(hour);
  if (h >= 23 || h < 1) return 0;
  return Math.floor((h + 1) / 2);
}

function getTimeGanZhi(dayGan, shichenIndex) {
  const dayGanIdx = TIANGAN.indexOf(dayGan);
  // 日上起时：甲己起甲子，乙庚起丙子...
  const timeGanStart = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
  const ganIdx = (timeGanStart[dayGanIdx] + shichenIndex) % 10;
  return { gan: TIANGAN[ganIdx], zhi: DIZHI[shichenIndex] };
}

// 阳历转精确农历（使用 lunar.js 数据表）
function solarToLunarExact(year, month, day) {
  const lunar = solarToLunar(year, month, day);
  if (!lunar) return null;
  return {
    year: lunar.year,
    month: lunar.month,
    day: lunar.day,
    isLeap: lunar.isLeap,
    text: formatLunar(lunar.year, lunar.month, lunar.day, lunar.isLeap),
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

function calculateBazi(year, month, day, shichenIndex, gender, name, birthPlace, currentPlace) {
  // 真太阳时校正：若有出生地，根据其经度校正时辰
  let realShichenIndex = shichenIndex;
  let solarTimeInfo = null;
  if (birthPlace && typeof birthPlace.lng === 'number') {
    const originalHour = SHICHEN_MAP[shichenIndex].hours[0];
    const correctedHour = applySolarTimeCorrection(originalHour, birthPlace.lng);
    realShichenIndex = getShichenIndexFromHour(correctedHour);
    solarTimeInfo = {
      originalHour,
      correctedHour: Math.round(correctedHour * 100) / 100,
      diffMinutes: Math.round((birthPlace.lng - 120) * 4),
      corrected: realShichenIndex !== shichenIndex,
    };
  }

  const yearGZ = getYearGanZhi(year, month, day);
  const monthGZ = getMonthGanZhi(year, month, day);
  const dayGZ = getDayGanZhi(year, month, day);
  const timeGZ = getTimeGanZhi(dayGZ.gan, realShichenIndex);

  const pillars = {
    year: { gan: yearGZ.gan, zhi: yearGZ.zhi, full: yearGZ.gan + yearGZ.zhi },
    month: { gan: monthGZ.gan, zhi: monthGZ.zhi, full: monthGZ.gan + monthGZ.zhi },
    day: { gan: dayGZ.gan, zhi: dayGZ.zhi, full: dayGZ.gan + dayGZ.zhi },
    time: { gan: timeGZ.gan, zhi: timeGZ.zhi, full: timeGZ.gan + timeGZ.zhi },
  };

  const baziWuxingCount = countWuxing(pillars);
  const baziWuxingWithCangGan = countWuxingWithCangGan(pillars, TIANGAN_WUXING, DIZHI_WUXING);
  const nameAnalysis = name ? calcNameWuxing(name) : null;

  // 方位五行加成：出生地 + 所在地
  const locationWuxing = { birth: null, current: null };
  if (birthPlace && typeof birthPlace.lng === 'number') {
    locationWuxing.birth = getLocationWuxing(birthPlace.lng, birthPlace.lat);
  }
  if (currentPlace && typeof currentPlace.lng === 'number') {
    locationWuxing.current = getLocationWuxing(currentPlace.lng, currentPlace.lat);
  }

  // 姓名五格五行 + 方位五行 融合八字五行
  const wuxingCount = { ...baziWuxingCount };
  if (nameAnalysis) {
    Object.keys(nameAnalysis.nameWuxingCount).forEach((key) => {
      wuxingCount[key] += nameAnalysis.nameWuxingCount[key];
    });
  }
  if (locationWuxing.birth) wuxingCount[locationWuxing.birth] += 1;
  if (locationWuxing.current) wuxingCount[locationWuxing.current] += 1;

  const dayMaster = dayGZ.gan;
  const dayMasterElement = TIANGAN_WUXING[dayMaster];
  const lunar = solarToLunarExact(year, month, day);

  const traditional = buildTraditionalChart({
    year, month, day,
    gender: gender || 'male',
    pillars,
    dayGan: dayGZ.gan,
    dayZhi: dayGZ.zhi,
  });

  return {
    solar: { year, month, day, hour: SHICHEN_MAP[shichenIndex].hours[0] },
    lunar,
    shichen: SHICHEN_MAP[realShichenIndex],
    originalShichen: SHICHEN_MAP[shichenIndex],
    solarTimeInfo,
    pillars,
    baziString: `${pillars.year.full} ${pillars.month.full} ${pillars.day.full} ${pillars.time.full}`,
    dayMaster,
    dayMasterElement,
    name: name || '',
    nameAnalysis,
    birthPlace: birthPlace || null,
    currentPlace: currentPlace || null,
    locationWuxing,
    baziWuxingCount,
    baziWuxingWithCangGan,
    wuxingCount,
    wuxingEnergy: calcWuxingEnergy(wuxingCount),
    gender,
    traditional,
    enrichedPillars: traditional.enrichedPillars,
    kongWang: traditional.kongWang,
    qiYun: traditional.qiYun,
    dayun: traditional.dayun,
    dayunList: traditional.dayun.list,
    liuNian: traditional.liuNian,
    shenSha: traditional.shenSha,
    shishenSummary: traditional.shishenSummary,
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
