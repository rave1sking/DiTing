/**
 * 传统八字命盘扩展：藏干、十神、纳音、空亡、神煞、大运、流年、精确节气
 */

const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const GAN_WUXING = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];

// 六十甲子纳音（索引 0 = 甲子）
const NAYIN_60 = [
  '海中金', '海中金', '炉中火', '炉中火', '大林木', '大林木', '路旁土', '路旁土', '剑锋金', '剑锋金',
  '山头火', '山头火', '涧下水', '涧下水', '城头土', '城头土', '白蜡金', '白蜡金', '杨柳木', '杨柳木',
  '泉中水', '泉中水', '屋上土', '屋上土', '霹雳火', '霹雳火', '松柏木', '松柏木', '长流水', '长流水',
  '沙中金', '沙中金', '山下火', '山下火', '平地木', '平地木', '壁上土', '壁上土', '金箔金', '金箔金',
  '覆灯火', '覆灯火', '天河水', '天河水', '大驿土', '大驿土', '钗钏金', '钗钏金', '桑柘木', '桑柘木',
  '大溪水', '大溪水', '沙中土', '沙中土', '天上火', '天上火', '石榴木', '石榴木', '大海水', '大海水',
];

// 地支藏干：本气、中气、余气（权重用于五行统计）
const CANG_GAN = {
  '子': [{ gan: '癸', weight: 1 }],
  '丑': [{ gan: '己', weight: 0.6 }, { gan: '癸', weight: 0.25 }, { gan: '辛', weight: 0.15 }],
  '寅': [{ gan: '甲', weight: 0.6 }, { gan: '丙', weight: 0.25 }, { gan: '戊', weight: 0.15 }],
  '卯': [{ gan: '乙', weight: 1 }],
  '辰': [{ gan: '戊', weight: 0.6 }, { gan: '乙', weight: 0.25 }, { gan: '癸', weight: 0.15 }],
  '巳': [{ gan: '丙', weight: 0.6 }, { gan: '庚', weight: 0.25 }, { gan: '戊', weight: 0.15 }],
  '午': [{ gan: '丁', weight: 0.7 }, { gan: '己', weight: 0.3 }],
  '未': [{ gan: '己', weight: 0.6 }, { gan: '丁', weight: 0.25 }, { gan: '乙', weight: 0.15 }],
  '申': [{ gan: '庚', weight: 0.6 }, { gan: '壬', weight: 0.25 }, { gan: '戊', weight: 0.15 }],
  '酉': [{ gan: '辛', weight: 1 }],
  '戌': [{ gan: '戊', weight: 0.6 }, { gan: '辛', weight: 0.25 }, { gan: '丁', weight: 0.15 }],
  '亥': [{ gan: '壬', weight: 0.7 }, { gan: '甲', weight: 0.3 }],
};

const WUXING_SHENG = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
const WUXING_KE = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };

// 十二节（起运、月柱分界用）：立春…小寒
const JIE_NAMES = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'];
// 节气序号：小寒=0, 立春=2, ... 对应 24 节气中的索引
const JIE_TERM_INDEX = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 0];

// 寿星万年历节气世纪常数 [C, D]（1900-2099）
const TERM_CENTURY = [
  [6.11, 5.405], [20.84, 6.318], [4.6295, 5.59], [19.4599, 6.5], [6.3826, 5.678],
  [21.4155, 6.6], [5.59, 5.888], [20.888, 6.318], [6.5, 5.59], [21.94, 6.5],
  [6.318, 5.678], [21.86, 6.6], [6.5, 5.888], [22.2, 6.318], [7.928, 5.59],
  [23.65, 6.5], [8.35, 5.678], [23.95, 6.6], [8.44, 5.888], [24.7, 6.318],
  [8.18, 5.59], [24.6, 6.5], [8.35, 5.678], [24.0, 6.6],
];

function solarToJD(year, month, day, hour = 12) {
  let y = year; let m = month;
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + hour / 24 + B - 1524.5;
}

function jdToSolar(jd) {
  const Z = Math.floor(jd + 0.5);
  const F = jd + 0.5 - Z;
  let A = Z;
  if (Z >= 2299161) {
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  const day = B - D - Math.floor(30.6001 * E);
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;
  return { year, month, day, fraction: F };
}

/** 计算某年第 n 个节气（0=小寒）的儒略日 */
function getSolarTermJD(year, termIndex) {
  const y = year % 100;
  const [C, D] = TERM_CENTURY[termIndex];
  let days = Math.floor(y * D + C) - Math.floor(y / 4);
  if (year < 2000 && termIndex === 0) days -= 1;
  if (year > 2099) days += 1;
  // 映射到公历月日（简化：按节气序排列的月）
  const monthMap = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12];
  const m = monthMap[termIndex];
  let day = days;
  if (day < 1) day = 1;
  if (day > 31) day = 31;
  return solarToJD(year, m, day, 12);
}

/** 获取某年十二「节」的儒略日 */
function getJieJDList(year) {
  return JIE_TERM_INDEX.map((ti) => getSolarTermJD(year, ti));
}

function getJiaZiIndex(gan, zhi) {
  const g = TIANGAN.indexOf(gan);
  const z = DIZHI.indexOf(zhi);
  for (let i = 0; i < 60; i++) {
    if (i % 10 === g && i % 12 === z) return i;
  }
  return 0;
}

function indexToGanZhi(idx) {
  const i = ((idx % 60) + 60) % 60;
  return { gan: TIANGAN[i % 10], zhi: DIZHI[i % 12], full: TIANGAN[i % 10] + DIZHI[i % 12] };
}

function getNaYin(gan, zhi) {
  return NAYIN_60[getJiaZiIndex(gan, zhi)];
}

function isYangGan(gan) {
  return TIANGAN.indexOf(gan) % 2 === 0;
}

function getShiShen(dayGan, targetGan) {
  const dm = TIANGAN.indexOf(dayGan);
  const tg = TIANGAN.indexOf(targetGan);
  if (dm < 0 || tg < 0) return '';
  const dmEl = GAN_WUXING[dm];
  const tgEl = GAN_WUXING[tg];
  const sameYY = (dm % 2) === (tg % 2);

  if (dmEl === tgEl) return sameYY ? '比肩' : '劫财';
  if (WUXING_SHENG[dmEl] === tgEl) return sameYY ? '食神' : '伤官';
  if (WUXING_KE[dmEl] === tgEl) return sameYY ? '偏财' : '正财';
  if (WUXING_KE[tgEl] === dmEl) return sameYY ? '七杀' : '正官';
  if (WUXING_SHENG[tgEl] === dmEl) return sameYY ? '偏印' : '正印';
  return '';
}

function getKongWang(dayGan, dayZhi) {
  const idx = getJiaZiIndex(dayGan, dayZhi);
  const xunStart = Math.floor(idx / 10) * 10;
  const kw1 = (xunStart + 10) % 12;
  const kw2 = (xunStart + 11) % 12;
  return [DIZHI[kw1], DIZHI[kw2]];
}

function getCangGanDetail(zhi, dayGan) {
  const list = CANG_GAN[zhi] || [];
  return list.map((item) => ({
    gan: item.gan,
    weight: item.weight,
    shishen: getShiShen(dayGan, item.gan),
    wuxing: GAN_WUXING[TIANGAN.indexOf(item.gan)],
  }));
}

function enrichPillar(pillar, dayGan, label) {
  const nayin = getNaYin(pillar.gan, pillar.zhi);
  const ganShishen = label === 'day' ? '日主' : getShiShen(dayGan, pillar.gan);
  const cangGan = getCangGanDetail(pillar.zhi, dayGan);
  return {
    ...pillar,
    label,
    nayin,
    ganShishen,
    cangGan,
  };
}

/** 根据精确节气确定月令索引 0=寅月 */
function getMonthIdxByJie(year, month, day) {
  const birthJD = solarToJD(year, month, day, 12);
  const jieList = getJieJDList(year);
  const prevYearJie = getJieJDList(year - 1);

  for (let i = 11; i >= 0; i--) {
    const jieJD = jieList[i];
    const useJD = (i === 11 && birthJD < jieJD) ? prevYearJie[11] : jieJD;
    if (birthJD >= useJD) return i;
  }
  if (birthJD < jieList[0]) {
    const prevJd = prevYearJie[11];
    if (birthJD >= prevJd) return 11;
  }
  return 0;
}

/** 起运：顺逆数到节令的天数 → 起运岁数 */
function calcQiYun(year, month, day, yearGan, gender) {
  const birthJD = solarToJD(year, month, day, 12);
  const forward = (isYangGan(yearGan) && gender === 'male')
    || (!isYangGan(yearGan) && gender === 'female');

  const yearsToCheck = [year - 1, year, year + 1];
  const allJie = [];
  yearsToCheck.forEach((y) => {
    getJieJDList(y).forEach((jd, i) => {
      allJie.push({ jd, name: JIE_NAMES[i], year: y });
    });
  });
  allJie.sort((a, b) => a.jd - b.jd);

  let targetJD = null;
  let targetName = '';
  if (forward) {
    const next = allJie.find((j) => j.jd > birthJD + 0.001);
    if (next) { targetJD = next.jd; targetName = next.name; }
  } else {
    const prev = [...allJie].reverse().find((j) => j.jd < birthJD - 0.001);
    if (prev) { targetJD = prev.jd; targetName = prev.name; }
  }

  if (!targetJD) {
    return { forward, startAge: 1, startAgeText: '1岁', targetJie: '', days: 0 };
  }

  const days = Math.abs(targetJD - birthJD);
  const years = Math.floor(days / 3);
  const months = Math.round(((days % 3) / 3) * 12);
  let startAge = years + months / 12;
  if (startAge < 0.1) startAge = 0.1;
  const startAgeText = months > 0 ? `${years}岁${months}个月` : `${years}岁`;

  return {
    forward,
    startAge: Math.round(startAge * 10) / 10,
    startAgeText,
    targetJie: targetName,
    days: Math.round(days),
  };
}

function calcDayunList(monthGan, monthZhi, yearGan, gender, qiYun) {
  const forward = qiYun.forward;
  let idx = getJiaZiIndex(monthGan, monthZhi);
  const list = [];
  const startAge = qiYun.startAge;

  for (let i = 0; i < 8; i++) {
    if (forward) idx = (idx + 1) % 60;
    else idx = (idx - 1 + 60) % 60;
    const gz = indexToGanZhi(idx);
    const ageStart = Math.round((startAge + i * 10) * 10) / 10;
    const ageEnd = Math.round((startAge + (i + 1) * 10) * 10) / 10;
    list.push({
      index: i + 1,
      gan: gz.gan,
      zhi: gz.zhi,
      full: gz.full,
      nayin: getNaYin(gz.gan, gz.zhi),
      ageStart,
      ageEnd,
      ageRange: `${ageStart}-${ageEnd}岁`,
    });
  }

  return {
    forward,
    direction: forward ? '顺行' : '逆行',
    startAge: qiYun.startAge,
    startAgeText: qiYun.startAgeText,
    targetJie: qiYun.targetJie,
    list,
  };
}

function getYearGanZhiByYear(year) {
  const ganIdx = (year - 4) % 10;
  const zhiIdx = (year - 4) % 12;
  return {
    gan: TIANGAN[ganIdx >= 0 ? ganIdx : ganIdx + 10],
    zhi: DIZHI[zhiIdx >= 0 ? zhiIdx : zhiIdx + 12],
  };
}

function calcLiuNian(birthYear, dayGan, fromYear, count = 10) {
  const start = fromYear || birthYear;
  const list = [];
  for (let y = start; y < start + count; y++) {
    const gz = getYearGanZhiByYear(y);
    const age = y - birthYear + 1;
    list.push({
      year: y,
      age,
      gan: gz.gan,
      zhi: gz.zhi,
      full: gz.gan + gz.zhi,
      nayin: getNaYin(gz.gan, gz.zhi),
      shishen: getShiShen(dayGan, gz.gan),
    });
  }
  return list;
}

/** 常用神煞 */
function calcShenSha(pillars, dayGan, dayZhi) {
  const result = [];
  const yearZhi = pillars.year.zhi;
  const dayZhiVal = dayZhi;
  const dayGanIdx = TIANGAN.indexOf(dayGan);

  const sanhe = (zhi) => {
    const groups = [
      ['申', '子', '辰'], ['寅', '午', '戌'], ['巳', '酉', '丑'], ['亥', '卯', '未'],
    ];
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].includes(zhi)) return i;
    }
    return -1;
  };

  const taohuaMap = ['酉', '午', '卯', '子'];
  const yimaMap = ['寅', '申', '巳', '亥'];
  const huagaiMap = ['辰', '戌', '丑', '未'];

  const g = sanhe(yearZhi);
  if (g >= 0) {
    const check = (zhi, name, map) => {
      if (zhi === map[g]) result.push({ name, source: '年支', zhi });
    };
    check(dayZhiVal, '桃花', taohuaMap);
    check(dayZhiVal, '驿马', yimaMap);
    check(dayZhiVal, '华盖', huagaiMap);
  }

  const tianyi = {
    '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
    '乙': ['子', '申'], '己': ['子', '申'],
    '丙': ['亥', '酉'], '丁': ['亥', '酉'],
    '壬': ['卯', '巳'], '癸': ['卯', '巳'],
    '辛': ['寅', '午'],
  };
  (tianyi[dayGan] || []).forEach((z) => {
    ['年', '月', '日', '时'].forEach((key) => {
      const p = pillars[key];
      if (p && p.zhi === z) result.push({ name: '天乙贵人', source: `${key}支`, zhi: z });
    });
  });

  const wenchang = { '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申', '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯' };
  const wc = wenchang[dayGan];
  if (wc) {
    ['年', '月', '日', '时'].forEach((key) => {
      const p = pillars[key];
      if (p && p.zhi === wc) result.push({ name: '文昌', source: `${key}支`, zhi: wc });
    });
  }

  const yangren = { '甲': '卯', '乙': '寅', '丙': '午', '丁': '巳', '戊': '午', '己': '巳', '庚': '酉', '辛': '申', '壬': '子', '癸': '亥' };
  const yr = yangren[dayGan];
  if (yr) {
    ['年', '月', '日', '时'].forEach((key) => {
      const p = pillars[key];
      if (p && p.zhi === yr) result.push({ name: '羊刃', source: `${key}支`, zhi: yr });
    });
  }

  const kw = getKongWang(dayGan, dayZhi);
  kw.forEach((z) => {
    ['年', '月', '日', '时'].forEach((key) => {
      const p = pillars[key];
      if (p && p.zhi === z) result.push({ name: '空亡', source: `${key}支`, zhi: z });
    });
  });

  const seen = new Set();
  return result.filter((item) => {
    const k = `${item.name}-${item.source}-${item.zhi}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function countWuxingWithCangGan(pillars, tianganWuxing, dizhiWuxing) {
  const count = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
  ['year', 'month', 'day', 'time'].forEach((p) => {
    const ge = tianganWuxing[pillars[p].gan];
    const ze = dizhiWuxing[pillars[p].zhi];
    if (ge) count[ge] += 1;
    if (ze) count[ze] += 1;
    const cg = CANG_GAN[pillars[p].zhi] || [];
    cg.forEach((item) => {
      const wx = GAN_WUXING[TIANGAN.indexOf(item.gan)];
      if (wx) count[wx] += item.weight;
    });
  });
  Object.keys(count).forEach((k) => {
    count[k] = Math.round(count[k] * 10) / 10;
  });
  return count;
}

function buildTraditionalChart(params) {
  const {
    year, month, day, gender, pillars, dayGan, dayZhi,
  } = params;

  const pillarKeys = ['year', 'month', 'day', 'time'];
  const pillarLabels = ['年柱', '月柱', '日柱', '时柱'];
  const enrichedPillars = {};
  pillarKeys.forEach((key, i) => {
    enrichedPillars[key] = enrichPillar(pillars[key], dayGan, pillarLabels[i]);
  });

  const kongWang = getKongWang(dayGan, dayZhi);
  const qiYun = calcQiYun(year, month, day, pillars.year.gan, gender || 'male');
  const dayun = calcDayunList(
    pillars.month.gan, pillars.month.zhi, pillars.year.gan, gender || 'male', qiYun,
  );

  const currentYear = new Date().getFullYear();
  const liuNianPast = calcLiuNian(year, dayGan, Math.max(year, currentYear - 5), 6);
  const liuNianFuture = calcLiuNian(year, dayGan, currentYear, 6);

  const shenSha = calcShenSha(pillars, dayGan, dayZhi);

  const shishenSummary = {};
  pillarKeys.forEach((key) => {
    const ep = enrichedPillars[key];
    const ss = ep.ganShishen;
    if (ss && ss !== '日主') shishenSummary[ss] = (shishenSummary[ss] || 0) + 1;
    (ep.cangGan || []).forEach((c) => {
      if (c.shishen) shishenSummary[c.shishen] = (shishenSummary[c.shishen] || 0) + c.weight;
    });
  });

  return {
    enrichedPillars,
    kongWang,
    qiYun,
    dayun,
    liuNian: {
      nearPast: liuNianPast,
      nearFuture: liuNianFuture,
    },
    shenSha,
    shishenSummary,
    monthIdxByJie: getMonthIdxByJie(year, month, day),
  };
}

module.exports = {
  buildTraditionalChart,
  getMonthIdxByJie,
  countWuxingWithCangGan,
  getNaYin,
  getShiShen,
  getKongWang,
  NAYIN_60,
  CANG_GAN,
};
