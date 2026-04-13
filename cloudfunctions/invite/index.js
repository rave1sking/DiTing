const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const INVITE_REWARD = 20;

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { action, inviterId } = event;

  switch (action) {
    case 'bindInviter':
      return bindInviter(openid, inviterId);
    case 'getInviteStats':
      return getInviteStats(openid);
    default:
      return { success: false, error: '未知操作' };
  }
};

async function bindInviter(openid, inviterId) {
  if (!inviterId || inviterId === openid) {
    return { success: false, error: '无效邀请' };
  }

  try {
    const { data: user } = await db.collection('users').doc(openid).get();

    if (user.inviterId) {
      return { success: false, error: '已绑定邀请人' };
    }

    await db.collection('users').doc(openid).update({
      data: { inviterId, updatedAt: db.serverDate() },
    });

    await db.collection('users').doc(inviterId).update({
      data: {
        lingliBalance: _.inc(INVITE_REWARD),
        updatedAt: db.serverDate(),
      },
    });

    await db.collection('transactions').add({
      data: {
        userId: inviterId,
        type: 'earn',
        amount: INVITE_REWARD,
        source: 'invite',
        refId: openid,
        createdAt: db.serverDate(),
      },
    });

    return { success: true, reward: INVITE_REWARD };
  } catch (err) {
    console.error('绑定邀请人失败:', err);
    return { success: false, error: err.message };
  }
}

async function getInviteStats(openid) {
  try {
    const { total } = await db.collection('users')
      .where({ inviterId: openid })
      .count();

    return {
      success: true,
      inviteCount: total,
      totalReward: total * INVITE_REWARD,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
