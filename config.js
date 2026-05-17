export default {
  useMock: true, // 开发阶段使用本地Mock，开通云开发后改为 false
  cloudEnv: 'diting-cloud',
  deepseek: {
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
  },
  lingli: {
    checkin: 5,
    checkinStreak3: 10,
    checkinStreak7: 20,
    watchAd: 5,
    inviteFriend: 20,
    deepReport: 10,
    askQuestion: 5,
  },
  // 激励视频广告位 ID（微信公众平台 → 流量主 → 广告管理 申请后填入）
  rewardedVideoAdUnitId: 'adunit-your-reward-video-id',
  // useMock 为 true 时，无真实广告位则走模拟观看（便于开发调试）
  adMockInDev: true,
};
