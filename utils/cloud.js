/**
 * 云服务统一封装层
 * useMock=true 时使用本地 Storage 模拟，无需开通云开发
 * useMock=false 时透传到真实云开发
 */
import config from '../config';
import { DEFAULT_USER_SETTINGS, SETTINGS_CONTENT, mergeUserSettings } from './settingsDefaults';

let _db = null;

function getDb() {
  if (config.useMock) return null;
  if (!_db) _db = wx.cloud.database();
  return _db;
}

// ======================== Mock 数据层 ========================

function mockGetUser() {
  const user = wx.getStorageSync('mock_user') || {
    _id: 'mock_openid_001',
    nickName: '',
    avatarUrl: '',
    lingliBalance: 30,
    memberType: 'normal',
    memberExpiry: null,
    consecutiveCheckIns: 0,
    lastCheckInDate: '',
    inviterId: '',
    settings: { ...DEFAULT_USER_SETTINGS },
  };
  if (!user.settings) user.settings = { ...DEFAULT_USER_SETTINGS };
  wx.setStorageSync('mock_user', user);
  return user;
}

function mockSaveUser(user) {
  wx.setStorageSync('mock_user', user);
}

function mockGetReports() {
  return wx.getStorageSync('mock_reports') || [];
}

function mockSaveReports(reports) {
  wx.setStorageSync('mock_reports', reports);
}

function mockGetTransactions() {
  return wx.getStorageSync('mock_transactions') || [];
}

function mockSaveTransactions(txns) {
  wx.setStorageSync('mock_transactions', txns);
}

function mockGetCheckins() {
  return wx.getStorageSync('mock_checkins') || [];
}

function mockSaveCheckins(checkins) {
  wx.setStorageSync('mock_checkins', checkins);
}

function generateId() {
  return `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ======================== 公开 API ========================

export async function login() {
  if (config.useMock) {
    const user = mockGetUser();
    return { openid: user._id, userInfo: user, isNew: false };
  }
  const { result } = await wx.cloud.callFunction({ name: 'login' });
  return result;
}

/** 保存用户出生日期（排盘时写入，供灵耳星座运势使用） */
export async function saveUserBirthDate(userId, birthDate) {
  if (!birthDate) return { success: false };
  if (config.useMock) {
    const user = mockGetUser();
    user.birthDate = birthDate;
    user.birthDateUpdatedAt = new Date().toISOString();
    mockSaveUser(user);
    return { success: true, birthDate };
  }
  const db = getDb();
  try {
    await db.collection('users').doc(userId).update({
      data: { birthDate, birthDateUpdatedAt: db.serverDate() },
    });
  } catch (e) {
    await db.collection('users').doc(userId).set({
      data: { birthDate, birthDateUpdatedAt: db.serverDate() },
    });
  }
  return { success: true, birthDate };
}

/** 获取用户出生日期：优先用户档案，其次最近排盘报告 */
export async function getUserBirthDate(userId) {
  if (config.useMock) {
    const user = mockGetUser();
    if (user.birthDate) {
      return { success: true, birthDate: user.birthDate, source: 'profile' };
    }
    const reports = mockGetReports();
    const sorted = [...reports].sort((a, b) => {
      const ta = a.createdAt || '';
      const tb = b.createdAt || '';
      return tb.localeCompare(ta);
    });
    const match = sorted.find((r) => r.birthInfo && r.birthInfo.solarDate);
    if (match) {
      return { success: true, birthDate: match.birthInfo.solarDate, source: 'report' };
    }
    return { success: false, birthDate: null };
  }
  const db = getDb();
  try {
    const { data: user } = await db.collection('users').doc(userId).get();
    if (user && user.birthDate) {
      return { success: true, birthDate: user.birthDate, source: 'profile' };
    }
    const { data: reports } = await db.collection('reports')
      .where({ userId })
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    if (reports[0] && reports[0].birthInfo && reports[0].birthInfo.solarDate) {
      return { success: true, birthDate: reports[0].birthInfo.solarDate, source: 'report' };
    }
  } catch (e) {
    console.warn('getUserBirthDate failed', e);
  }
  return { success: false, birthDate: null };
}

export async function updateProfile(userInfo) {
  if (config.useMock) {
    const user = mockGetUser();
    if (userInfo.nickName) user.nickName = userInfo.nickName;
    if (userInfo.avatarUrl) user.avatarUrl = userInfo.avatarUrl;
    if (userInfo.birthDate) user.birthDate = userInfo.birthDate;
    mockSaveUser(user);
    return { success: true };
  }
  const { result } = await wx.cloud.callFunction({
    name: 'login',
    data: { action: 'updateProfile', userInfo },
  });
  return result;
}

export async function addReport(reportData) {
  if (config.useMock) {
    const id = generateId();
    const reports = mockGetReports();
    const record = { ...reportData, _id: id, createdAt: new Date().toISOString() };
    reports.unshift(record);
    mockSaveReports(reports);
    return id;
  }
  const db = getDb();
  const { _id } = await db.collection('reports').add({ data: { ...reportData, createdAt: db.serverDate() } });
  return _id;
}

export async function getReport(reportId) {
  if (config.useMock) {
    const reports = mockGetReports();
    return reports.find((r) => r._id === reportId) || null;
  }
  const db = getDb();
  const { data } = await db.collection('reports').doc(reportId).get();
  return data;
}

export async function updateReport(reportId, updateData) {
  if (config.useMock) {
    const reports = mockGetReports();
    const idx = reports.findIndex((r) => r._id === reportId);
    if (idx >= 0) {
      reports[idx] = { ...reports[idx], ...updateData };
      mockSaveReports(reports);
    }
    return { success: true };
  }
  const db = getDb();
  await db.collection('reports').doc(reportId).update({ data: updateData });
  return { success: true };
}

export async function getReportList(userId) {
  if (config.useMock) {
    const reports = mockGetReports();
    return reports.filter((r) => r.userId === userId || config.useMock);
  }
  const db = getDb();
  const { data } = await db.collection('reports')
    .where({ userId })
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();
  return data;
}

export async function checkin(date) {
  if (config.useMock) {
    const user = mockGetUser();
    const checkins = mockGetCheckins();

    if (checkins.find((c) => c.date === date)) {
      return { success: false, error: '今日已打卡' };
    }

    const yesterday = getYesterday(date);
    let consecutive = user.lastCheckInDate === yesterday ? (user.consecutiveCheckIns || 0) + 1 : 1;

    const FORTUNE_POOL = [
      '今日宜放松心情，好运自然来敲门',
      '心怀善意，世界便会温柔以待',
      '保持微笑，你的能量场正在吸引美好',
      '深呼吸，你比想象中更强大',
      '今日灵感充沛，适合创造与表达',
      '你的温柔，是世界最珍贵的力量',
      '今天会有一个意想不到的小惊喜',
      '相信直觉，它正在引导你走向正确的方向',
      '慢一点也没关系，每一步都算数',
      '今天的你，闪闪发光',
    ];

    const fortuneIdx = hashStr(date) % FORTUNE_POOL.length;
    let earnedLingli = config.lingli.checkin;
    if (consecutive === 3) earnedLingli += config.lingli.checkinStreak3;
    if (consecutive === 7) earnedLingli += config.lingli.checkinStreak7;

    user.lastCheckInDate = date;
    user.consecutiveCheckIns = consecutive;
    user.lingliBalance = (user.lingliBalance || 0) + earnedLingli;
    mockSaveUser(user);

    checkins.push({ _id: generateId(), date, fortuneText: FORTUNE_POOL[fortuneIdx] });
    mockSaveCheckins(checkins);

    const txns = mockGetTransactions();
    txns.unshift({ _id: generateId(), type: 'earn', amount: earnedLingli, source: 'checkin', createdAt: new Date().toISOString() });
    mockSaveTransactions(txns);

    return {
      success: true,
      fortuneText: FORTUNE_POOL[fortuneIdx],
      earnedLingli,
      consecutiveCheckIns: consecutive,
    };
  }
  const { result } = await wx.cloud.callFunction({ name: 'checkin', data: { date } });
  return result;
}

export async function getLingliBalance() {
  if (config.useMock) {
    const user = mockGetUser();
    return { success: true, balance: user.lingliBalance || 0 };
  }
  const { result } = await wx.cloud.callFunction({ name: 'lingli', data: { action: 'getBalance' } });
  return result;
}

export async function spendLingli(amount, source, refId) {
  if (config.useMock) {
    const user = mockGetUser();
    if ((user.lingliBalance || 0) < amount) return { success: false, error: '灵力不足' };
    user.lingliBalance -= amount;
    mockSaveUser(user);
    const txns = mockGetTransactions();
    txns.unshift({ _id: generateId(), type: 'spend', amount, source, refId, createdAt: new Date().toISOString() });
    mockSaveTransactions(txns);
    return { success: true, balance: user.lingliBalance };
  }
  const { result } = await wx.cloud.callFunction({ name: 'lingli', data: { action: 'spend', amount, source, refId } });
  return result;
}

export async function earnLingli(amount, source) {
  if (config.useMock) {
    const user = mockGetUser();
    user.lingliBalance = (user.lingliBalance || 0) + amount;
    mockSaveUser(user);
    const txns = mockGetTransactions();
    txns.unshift({ _id: generateId(), type: 'earn', amount, source, createdAt: new Date().toISOString() });
    mockSaveTransactions(txns);
    return { success: true, balance: user.lingliBalance };
  }
  const { result } = await wx.cloud.callFunction({ name: 'lingli', data: { action: 'earn', amount, source } });
  return result;
}

export async function getLingliHistory(page) {
  if (config.useMock) {
    const txns = mockGetTransactions();
    const pageSize = 20;
    const start = page * pageSize;
    const slice = txns.slice(start, start + pageSize);
    return { success: true, data: slice, hasMore: start + pageSize < txns.length };
  }
  const { result } = await wx.cloud.callFunction({ name: 'lingli', data: { action: 'getHistory', page } });
  return result;
}

export async function getUserSettings() {
  if (config.useMock) {
    const user = mockGetUser();
    return { success: true, settings: mergeUserSettings(user.settings) };
  }
  const { result } = await wx.cloud.callFunction({
    name: 'settings',
    data: { action: 'getSettings' },
  });
  return result;
}

export async function updateUserSettings(patch) {
  if (config.useMock) {
    const user = mockGetUser();
    const next = mergeUserSettings({ ...user.settings, ...patch });
    user.settings = next;
    mockSaveUser(user);
    return { success: true, settings: next };
  }
  const { result } = await wx.cloud.callFunction({
    name: 'settings',
    data: { action: 'updateSettings', settings: patch },
  });
  return result;
}

export async function getSettingsContent(contentType) {
  if (config.useMock) {
    const content = SETTINGS_CONTENT[contentType];
    if (!content) return { success: false, error: '无效内容类型' };
    return { success: true, content };
  }
  const { result } = await wx.cloud.callFunction({
    name: 'settings',
    data: { action: 'getContent', contentType },
  });
  return result;
}

export async function logout() {
  if (config.useMock) {
    return { success: true };
  }
  const { result } = await wx.cloud.callFunction({
    name: 'settings',
    data: { action: 'logout' },
  });
  return result;
}

export async function generateAIReport(reportId, type) {
  if (config.useMock) {
    const report = await getReport(reportId);
    const baziRaw = report?.baziRaw || {};
    const data = type === 'summary'
      ? { summary: buildMockSummary(report) }
      : type === 'energy'
        ? { energyData: buildMockEnergy(baziRaw) }
        : { deepReport: buildMockDeep(baziRaw) };

    await updateReport(reportId, data);
    return { success: true, data, type };
  }
  const { result } = await wx.cloud.callFunction({ name: 'ai-report', data: { reportId, type } });
  return result;
}

// ======================== 辅助函数 ========================

function buildMockSummary(report) {
  const baziRaw = report?.baziRaw || {};
  const name = report?.birthInfo?.name || baziRaw.name || '你';
  const dayMaster = baziRaw.dayMaster || '己';
  const solar = report?.birthInfo?.solarDate || '';
  const time = report?.birthInfo?.shichenName || '未知时辰';
  const prompts = [
    '先把步子迈稳，答案会在前方等你',
    '把今天过好，光就会慢慢聚拢',
    '稳住节奏，努力会替你开路',
    '心里有光，前路就不会太暗',
    '继续向前，属于你的好消息正在赶来',
  ];
  const seed = `${dayMaster}${solar}${time}${name}`;
  const idx = hashStr(seed) % prompts.length;
  return prompts[idx];
}

function buildMockEnergy(baziRaw) {
  const wc = baziRaw.wuxingCount || { '金': 50, '木': 50, '水': 50, '火': 50, '土': 50 };
  return {
    energy: wc,
    interpretation: `${baziRaw.dayMasterElement || '五行'}能量较醒，适合稳步推进`,
  };
}

function buildMockDeep(baziRaw) {
  const base = Math.max(1, (baziRaw.dayMaster || '己').charCodeAt(0) % 10);
  return {
    career: { score: 70 + base, analysis: '近期适合把想法落到纸面，再推进执行。', advice: ['先明确目标，再拆成小步', '适合主动表达自己的方案', '注意节奏，避免同时开太多战线'] },
    wealth: { score: 60 + base, analysis: '财务上适合稳守，优先做好规划。', advice: ['先记账再消费', '减少冲动型开支', '把可预期收益放在前面'] },
    love: { score: 68 + base, analysis: '关系互动有回暖趋势，真诚沟通最重要。', advice: ['多说具体感受', '给彼此留一点空间', '把关心落实到行动'] },
  };
}

function getYesterday(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function hashStr(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
