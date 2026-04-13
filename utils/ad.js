/**
 * 激励视频广告管理器
 * 广告位ID需要在微信公众平台申请后替换
 */
const AD_UNIT_ID = 'adunit-your-reward-video-id';

let rewardedVideoAd = null;

function getRewardedVideoAd() {
  if (rewardedVideoAd) return rewardedVideoAd;

  if (!wx.createRewardedVideoAd) return null;

  rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId: AD_UNIT_ID });

  rewardedVideoAd.onError((err) => {
    console.error('激励广告错误:', err);
  });

  return rewardedVideoAd;
}

/**
 * 展示激励视频广告
 * @returns {Promise<boolean>} 是否完整观看
 */
function showRewardedVideo() {
  return new Promise((resolve, reject) => {
    const ad = getRewardedVideoAd();

    if (!ad) {
      reject(new Error('当前环境不支持激励视频广告'));
      return;
    }

    ad.onClose(function onClose(res) {
      ad.offClose(onClose);
      resolve(res && res.isEnded);
    });

    ad.show().catch(() => {
      ad.load().then(() => ad.show()).catch(reject);
    });
  });
}

module.exports = {
  showRewardedVideo,
};
