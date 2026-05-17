/** 用户设置默认值（与云函数 settings 保持一致） */
export const DEFAULT_USER_SETTINGS = {
  notifyReport: true,
  notifyCheckin: true,
  notifyMarketing: false,
  privacyShowProfile: true,
  privacyPersonalized: true,
};

export const SETTINGS_CONTENT = {
  about: {
    title: '关于听听',
    updatedAt: '2026-05-01',
    sections: [
      { heading: '产品简介', body: '「听听」是一款结合传统文化与 AI 的微信小程序，提供排盘解读、灵力成长与每日运势等服务，帮助你在忙碌生活中听见内心的声音。' },
      { heading: '联系我们', body: '如有问题或建议，请通过小程序内反馈渠道与我们联系。' },
      { heading: '版本信息', body: '当前版本：1.0.0' },
    ],
  },
  userAgreement: {
    title: '用户协议',
    updatedAt: '2026-05-01',
    sections: [
      { heading: '一、服务说明', body: '欢迎使用听听。使用本小程序即表示您同意本协议。我们提供命理分析、内容浏览、灵力与会员等相关功能，具体内容以页面展示为准。' },
      { heading: '二、账号与安全', body: '您应妥善保管微信账号及设备。因您自身原因导致的账号风险或损失，由您自行承担。' },
      { heading: '三、用户行为规范', body: '您不得利用本服务从事违法违规活动，不得干扰服务正常运行或侵害他人合法权益。' },
      { heading: '四、知识产权', body: '小程序内的界面、文案、算法输出等受法律保护，未经授权不得复制、传播或用于商业用途。' },
      { heading: '五、免责声明', body: '本产品提供的分析内容仅供娱乐与参考，不构成医疗、法律、投资等专业建议。' },
      { heading: '六、协议变更', body: '我们可能适时修订本协议，修订后将通过小程序内公告等方式提示。继续使用即视为接受修订内容。' },
    ],
  },
  privacyPolicy: {
    title: '隐私政策',
    updatedAt: '2026-05-01',
    sections: [
      { heading: '一、我们收集的信息', body: '为提供基础服务，我们可能收集微信开放平台提供的 OpenID、您授权的头像昵称，以及您主动填写的出生信息、排盘记录、灵力与打卡数据等。' },
      { heading: '二、信息的使用', body: '收集的信息用于账号识别、功能实现、服务优化与安全风控。未经您同意，我们不会向第三方出售您的个人信息。' },
      { heading: '三、信息的存储', body: '数据存储于微信云开发环境，并采取合理措施保障安全。您可通过设置页管理部分隐私偏好。' },
      { heading: '四、您的权利', body: '您可在设置中关闭部分通知与个性化选项，也可通过退出登录清除本地缓存。如需删除云端数据，请联系我们处理。' },
      { heading: '五、未成年人保护', body: '若您为未成年人，请在监护人指导下使用本服务。' },
      { heading: '六、政策更新', body: '我们可能更新本政策，更新后将通过适当方式告知您。' },
    ],
  },
};

export function mergeUserSettings(stored) {
  return { ...DEFAULT_USER_SETTINGS, ...(stored || {}) };
}
