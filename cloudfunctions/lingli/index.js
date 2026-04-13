const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { action } = event;

  switch (action) {
    case 'getBalance':
      return getBalance(openid);
    case 'spend':
      return spendLingli(openid, event.amount, event.source, event.refId);
    case 'earn':
      return earnLingli(openid, event.amount, event.source, event.refId);
    case 'getHistory':
      return getHistory(openid, event.page || 0);
    default:
      return { success: false, error: '未知操作' };
  }
};

async function getBalance(openid) {
  try {
    const { data } = await db.collection('users').doc(openid).get();
    return { success: true, balance: data.lingliBalance || 0 };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function spendLingli(openid, amount, source, refId) {
  if (!amount || amount <= 0) return { success: false, error: '无效金额' };

  try {
    const { data: user } = await db.collection('users').doc(openid).get();

    if (user.memberType === 'vip' && user.memberExpiry && new Date(user.memberExpiry) > new Date()) {
      if (source === 'report') {
        await db.collection('transactions').add({
          data: {
            userId: openid,
            type: 'spend',
            amount: 0,
            source,
            refId: refId || '',
            note: '会员免费',
            createdAt: db.serverDate(),
          },
        });
        return { success: true, balance: user.lingliBalance, waived: true };
      }
    }

    if ((user.lingliBalance || 0) < amount) {
      return { success: false, error: '灵力不足', balance: user.lingliBalance || 0 };
    }

    await db.collection('users').doc(openid).update({
      data: {
        lingliBalance: _.inc(-amount),
        updatedAt: db.serverDate(),
      },
    });

    await db.collection('transactions').add({
      data: {
        userId: openid,
        type: 'spend',
        amount,
        source,
        refId: refId || '',
        createdAt: db.serverDate(),
      },
    });

    return { success: true, balance: (user.lingliBalance || 0) - amount };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function earnLingli(openid, amount, source, refId) {
  if (!amount || amount <= 0) return { success: false, error: '无效金额' };

  try {
    await db.collection('users').doc(openid).update({
      data: {
        lingliBalance: _.inc(amount),
        updatedAt: db.serverDate(),
      },
    });

    await db.collection('transactions').add({
      data: {
        userId: openid,
        type: 'earn',
        amount,
        source,
        refId: refId || '',
        createdAt: db.serverDate(),
      },
    });

    const { data: user } = await db.collection('users').doc(openid).get();
    return { success: true, balance: user.lingliBalance || 0 };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function getHistory(openid, page) {
  const pageSize = 20;
  try {
    const { data } = await db.collection('transactions')
      .where({ userId: openid })
      .orderBy('createdAt', 'desc')
      .skip(page * pageSize)
      .limit(pageSize)
      .get();

    return { success: true, data, hasMore: data.length === pageSize };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
