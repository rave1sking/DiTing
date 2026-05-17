const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { action, userInfo } = event;

  if (action === 'updateProfile') {
    return updateProfile(openid, userInfo);
  }

  return silentLogin(openid);
};

async function silentLogin(openid) {
  const usersCol = db.collection('users');

  try {
    const { data } = await usersCol.where({ _id: openid }).get();

    if (data.length > 0) {
      await usersCol.doc(openid).update({
        data: { updatedAt: db.serverDate() },
      });
      return { openid, userInfo: data[0], isNew: false };
    }

    const newUser = {
      _id: openid,
      nickName: '',
      avatarUrl: '',
      lingliBalance: 0,
      memberType: 'normal',
      memberExpiry: null,
      consecutiveCheckIns: 0,
      lastCheckInDate: '',
      inviterId: '',
      settings: {
        notifyReport: true,
        notifyCheckin: true,
        notifyMarketing: false,
        privacyShowProfile: true,
        privacyPersonalized: true,
      },
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    };
    await usersCol.add({ data: newUser });
    return { openid, userInfo: newUser, isNew: true };
  } catch (err) {
    console.error('登录失败:', err);
    return { openid, error: err.message };
  }
}

async function updateProfile(openid, userInfo) {
  const usersCol = db.collection('users');

  try {
    const updateData = { updatedAt: db.serverDate() };
    if (userInfo.nickName) updateData.nickName = userInfo.nickName;
    if (userInfo.avatarUrl) updateData.avatarUrl = userInfo.avatarUrl;

    await usersCol.doc(openid).update({ data: updateData });
    return { success: true };
  } catch (err) {
    console.error('更新用户信息失败:', err);
    return { success: false, error: err.message };
  }
}
