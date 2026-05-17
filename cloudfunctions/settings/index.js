const cloud = require('wx-server-sdk');
const { DEFAULT_USER_SETTINGS, SETTINGS_CONTENT, mergeUserSettings } = require('./content');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const VALID_CONTENT_TYPES = ['about', 'userAgreement', 'privacyPolicy'];
const VALID_SETTING_KEYS = Object.keys(DEFAULT_USER_SETTINGS);

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { action } = event;

  switch (action) {
    case 'getSettings':
      return getSettings(openid);
    case 'updateSettings':
      return updateSettings(openid, event.settings || {});
    case 'getContent':
      return getContent(event.contentType);
    case 'logout':
      return logout(openid);
    default:
      return { success: false, error: '未知操作' };
  }
};

async function getSettings(openid) {
  try {
    const { data } = await db.collection('users').doc(openid).get();
    const settings = mergeUserSettings(data && data.settings);
    return { success: true, settings };
  } catch (err) {
    if (err.errCode === -1 || (err.message && err.message.includes('not exist'))) {
      return { success: true, settings: { ...DEFAULT_USER_SETTINGS } };
    }
    console.error('getSettings failed:', err);
    return { success: false, error: err.message };
  }
}

async function updateSettings(openid, patch) {
  const sanitized = {};
  VALID_SETTING_KEYS.forEach((key) => {
    if (typeof patch[key] === 'boolean') sanitized[key] = patch[key];
  });
  if (!Object.keys(sanitized).length) {
    return { success: false, error: '无有效设置项' };
  }

  try {
    const { data: user } = await db.collection('users').doc(openid).get();
    const merged = mergeUserSettings(user && user.settings);
    const nextSettings = { ...merged, ...sanitized };

    await db.collection('users').doc(openid).update({
      data: {
        settings: nextSettings,
        updatedAt: db.serverDate(),
      },
    });
    return { success: true, settings: nextSettings };
  } catch (err) {
    console.error('updateSettings failed:', err);
    return { success: false, error: err.message };
  }
}

async function getContent(contentType) {
  if (!VALID_CONTENT_TYPES.includes(contentType)) {
    return { success: false, error: '无效内容类型' };
  }

  try {
    const { data } = await db.collection('app_content').doc(contentType).get();
    if (data && data.title && data.sections) {
      return {
        success: true,
        content: {
          title: data.title,
          updatedAt: data.updatedAt || '',
          sections: data.sections,
        },
      };
    }
  } catch (err) {
    // 集合或文档不存在时使用内置默认文案
  }

  return { success: true, content: SETTINGS_CONTENT[contentType] };
}

async function logout(openid) {
  try {
    await db.collection('users').doc(openid).update({
      data: { lastLogoutAt: db.serverDate() },
    });
  } catch (err) {
    console.warn('logout record failed:', err.message);
  }
  return { success: true };
}
