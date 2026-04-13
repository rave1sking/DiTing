const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const LINGLI_CHECKIN = 5;
const LINGLI_STREAK_3 = 10;
const LINGLI_STREAK_7 = 20;

const FORTUNE_POOL = [
  '今日宜放松心情，好运自然来敲门',
  '心怀善意，世界便会温柔以待',
  '保持微笑，你的能量场正在吸引美好',
  '今天适合做一件让自己开心的小事',
  '深呼吸，你比想象中更强大',
  '今日灵感充沛，适合创造与表达',
  '放下焦虑，当下即是最好的时刻',
  '你的温柔，是世界最珍贵的力量',
  '今天会有一个意想不到的小惊喜',
  '相信直觉，它正在引导你走向正确的方向',
  '今日适合与重要的人说说心里话',
  '宇宙正在为你悄悄安排一些美好',
  '慢一点也没关系，每一步都算数',
  '今日偏财运不错，留意身边的小机会',
  '你的善良终将被世界温柔以待',
  '今天适合学习新技能，灵耳帮你开窍',
  '给自己一个拥抱，你已经很棒了',
  '今日桃花微动，注意身边的目光',
  '保持好奇心，新世界正在向你展开',
  '困难只是暂时的，黎明就在前方',
  '今天的你，闪闪发光',
  '做自己就好，独特是最大的魅力',
  '今日适合断舍离，清理空间迎接新能量',
  '你正在变成更好的自己，不要着急',
  '今天会有一句话，点亮你的心',
  '勇敢迈出第一步，后面的路会越来越宽',
  '今日五行平衡，万事皆顺',
  '你值得被爱，也值得爱自己',
  '小确幸正在路上，请保持期待',
  '今天的努力，是明天的礼物',
];

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { date } = event;

  if (!date) return { success: false, error: '缺少日期' };

  try {
    const existing = await db.collection('checkins')
      .where({ userId: openid, date })
      .count();

    if (existing.total > 0) {
      return { success: false, error: '今日已打卡' };
    }

    const { data: userData } = await db.collection('users').doc(openid).get();
    const lastDate = userData.lastCheckInDate || '';
    const yesterday = getYesterday(date);
    let consecutive = lastDate === yesterday ? (userData.consecutiveCheckIns || 0) + 1 : 1;

    const fortuneIdx = hashDate(date) % FORTUNE_POOL.length;
    const fortuneText = FORTUNE_POOL[fortuneIdx];

    await db.collection('checkins').add({
      data: {
        userId: openid,
        date,
        fortuneCard: { text: fortuneText, bgId: fortuneIdx % 10 },
        createdAt: db.serverDate(),
      },
    });

    let earnedLingli = LINGLI_CHECKIN;
    if (consecutive === 3) earnedLingli += LINGLI_STREAK_3;
    if (consecutive === 7) earnedLingli += LINGLI_STREAK_7;

    await db.collection('users').doc(openid).update({
      data: {
        lastCheckInDate: date,
        consecutiveCheckIns: consecutive,
        lingliBalance: _.inc(earnedLingli),
        updatedAt: db.serverDate(),
      },
    });

    await db.collection('transactions').add({
      data: {
        userId: openid,
        type: 'earn',
        amount: earnedLingli,
        source: 'checkin',
        refId: date,
        createdAt: db.serverDate(),
      },
    });

    return {
      success: true,
      fortuneText,
      earnedLingli,
      consecutiveCheckIns: consecutive,
    };
  } catch (err) {
    console.error('打卡失败:', err);
    return { success: false, error: err.message };
  }
};

function getYesterday(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function hashDate(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
