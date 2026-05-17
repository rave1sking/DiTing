/**
 * 激励视频广告（wx.createRewardedVideoAd）
 * 正式环境请在 config.js 配置 rewardedVideoAdUnitId
 */
import config from '../../../config.js';

let rewardedVideoAd = null;
let closeHandler = null;

function getAdUnitId() {
  return config.rewardedVideoAdUnitId || '';
}

function isPlaceholderAdUnit(id) {
  return !id || id.includes('your-reward') || id.includes('placeholder');
}

function shouldUseMockAd() {
  return config.useMock && config.adMockInDev !== false;
}

function getRewardedVideoAd() {
  if (shouldUseMockAd() || isPlaceholderAdUnit(getAdUnitId())) {
    return null;
  }
  if (rewardedVideoAd) return rewardedVideoAd;
  if (!wx.createRewardedVideoAd) return null;

  rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId: getAdUnitId() });

  rewardedVideoAd.onError((err) => {
    console.error('激励广告错误:', err);
  });

  return rewardedVideoAd;
}

function showMockRewardedVideo() {
  return new Promise((resolve) => {
    wx.showModal({
      title: '模拟激励视频',
      content: '当前为开发模式，确认后将模拟「完整观看」并发放奖励。',
      confirmText: '看完了',
      cancelText: '取消',
      success: (res) => resolve(!!res.confirm),
      fail: () => resolve(false),
    });
  });
}

/**
 * 展示激励视频广告
 * @returns {Promise<boolean>} 是否完整观看
 */
function showRewardedVideo() {
  if (shouldUseMockAd() || isPlaceholderAdUnit(getAdUnitId())) {
    return showMockRewardedVideo();
  }

  return new Promise((resolve, reject) => {
    const ad = getRewardedVideoAd();

    if (!ad) {
      showMockRewardedVideo().then(resolve);
      return;
    }

    if (closeHandler) {
      ad.offClose(closeHandler);
      closeHandler = null;
    }

    closeHandler = (res) => {
      ad.offClose(closeHandler);
      closeHandler = null;
      resolve(!!(res && res.isEnded));
    };

    ad.onClose(closeHandler);

    const tryShow = () => ad.show().catch(() => ad.load().then(() => ad.show()));

    tryShow().catch((err) => {
      ad.offClose(closeHandler);
      closeHandler = null;
      console.error('激励广告展示失败:', err);
      reject(new Error('广告加载失败，请稍后再试'));
    });
  });
}

/** 预加载广告（可在页面 onLoad 调用） */
function preloadRewardedVideo() {
  const ad = getRewardedVideoAd();
  if (ad) ad.load().catch(() => {});
}

module.exports = {
  showRewardedVideo,
  preloadRewardedVideo,
  getAdUnitId,
};
