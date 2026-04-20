/**
 * 八字排盘工具 - 纯本地实现，无外部依赖
 * 基于天干地支循环 + 儒略日算法
 */

const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 常用城市经纬度数据（用于真太阳时校正和方位五行）
const CITY_DATA = [
  { name: '北京', lng: 116.40, lat: 39.90, province: '北京' },
  { name: '上海', lng: 121.47, lat: 31.23, province: '上海' },
  { name: '广州', lng: 113.26, lat: 23.13, province: '广东' },
  { name: '深圳', lng: 114.06, lat: 22.54, province: '广东' },
  { name: '成都', lng: 104.07, lat: 30.67, province: '四川' },
  { name: '杭州', lng: 120.15, lat: 30.27, province: '浙江' },
  { name: '武汉', lng: 114.31, lat: 30.60, province: '湖北' },
  { name: '南京', lng: 118.78, lat: 32.04, province: '江苏' },
  { name: '西安', lng: 108.94, lat: 34.27, province: '陕西' },
  { name: '重庆', lng: 106.55, lat: 29.56, province: '重庆' },
  { name: '天津', lng: 117.20, lat: 39.13, province: '天津' },
  { name: '苏州', lng: 120.59, lat: 31.30, province: '江苏' },
  { name: '长沙', lng: 112.94, lat: 28.23, province: '湖南' },
  { name: '郑州', lng: 113.63, lat: 34.75, province: '河南' },
  { name: '青岛', lng: 120.38, lat: 36.07, province: '山东' },
  { name: '济南', lng: 117.00, lat: 36.65, province: '山东' },
  { name: '沈阳', lng: 123.43, lat: 41.80, province: '辽宁' },
  { name: '大连', lng: 121.62, lat: 38.92, province: '辽宁' },
  { name: '哈尔滨', lng: 126.64, lat: 45.75, province: '黑龙江' },
  { name: '长春', lng: 125.32, lat: 43.82, province: '吉林' },
  { name: '合肥', lng: 117.27, lat: 31.86, province: '安徽' },
  { name: '福州', lng: 119.30, lat: 26.08, province: '福建' },
  { name: '厦门', lng: 118.10, lat: 24.46, province: '福建' },
  { name: '南昌', lng: 115.89, lat: 28.68, province: '江西' },
  { name: '昆明', lng: 102.72, lat: 25.04, province: '云南' },
  { name: '贵阳', lng: 106.63, lat: 26.65, province: '贵州' },
  { name: '南宁', lng: 108.37, lat: 22.82, province: '广西' },
  { name: '海口', lng: 110.32, lat: 20.03, province: '海南' },
  { name: '太原', lng: 112.55, lat: 37.87, province: '山西' },
  { name: '石家庄', lng: 114.50, lat: 38.05, province: '河北' },
  { name: '兰州', lng: 103.83, lat: 36.06, province: '甘肃' },
  { name: '乌鲁木齐', lng: 87.62, lat: 43.82, province: '新疆' },
  { name: '拉萨', lng: 91.11, lat: 29.65, province: '西藏' },
  { name: '呼和浩特', lng: 111.73, lat: 40.84, province: '内蒙古' },
  { name: '银川', lng: 106.23, lat: 38.49, province: '宁夏' },
  { name: '西宁', lng: 101.78, lat: 36.62, province: '青海' },
  { name: '香港', lng: 114.17, lat: 22.28, province: '香港' },
  { name: '澳门', lng: 113.55, lat: 22.19, province: '澳门' },
  { name: '台北', lng: 121.52, lat: 25.03, province: '台湾' },
];

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
  const lunar = solarToLunarApprox(year, month, day);

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
    wuxingCount,
    wuxingEnergy: calcWuxingEnergy(wuxingCount),
    gender,
    dayunList: [],
  };
}

function getCityList() {
  return CITY_DATA.slice();
}

function getShichenList() {
  return SHICHEN_MAP.map((s, index) => ({ ...s, index }));
}

module.exports = {
  calculateBazi,
  getShichenList,
  getCityList,
  CITY_DATA,
  SHICHEN_MAP,
  TIANGAN_WUXING,
  DIZHI_WUXING,
};
