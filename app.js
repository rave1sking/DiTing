import config from './config';
import createBus from './utils/eventBus';
import { login, updateProfile, getLingliBalance } from './utils/cloud';

App({
  onLaunch() {
    if (!config.useMock) {
      try {
        wx.cloud.init({ env: config.cloudEnv, traceUser: true });
      } catch (e) {
        console.warn('云开发初始化失败，自动切换到Mock模式:', e.message);
        config.useMock = true;
      }
    }

    const updateManager = wx.getUpdateManager();
    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) { if (res.confirm) updateManager.applyUpdate(); },
      });
    });

    this.silentLogin();
  },

  globalData: {
    userInfo: null,
    openid: null,
    lingliBalance: 0,
    isLoggedIn: false,
  },

  eventBus: createBus(),

  async silentLogin() {
    try {
      const result = await login();
      if (result && result.openid) {
        this.globalData.openid = result.openid;
        this.globalData.isLoggedIn = true;
        if (result.userInfo) {
          this.globalData.userInfo = result.userInfo;
          this.globalData.lingliBalance = result.userInfo.lingliBalance || 0;
        }
        this.eventBus.emit('login-success', result);
      }
    } catch (err) {
      console.warn('静默登录失败，使用离线模式:', err.message || err);
    }
  },

  async updateUserInfo(userInfo) {
    try {
      const result = await updateProfile(userInfo);
      if (result && result.success) {
        this.globalData.userInfo = { ...this.globalData.userInfo, ...userInfo };
        this.eventBus.emit('userinfo-updated', this.globalData.userInfo);
      }
      return result;
    } catch (err) {
      console.error('更新用户信息失败:', err);
      return null;
    }
  },

  async refreshLingli() {
    try {
      const result = await getLingliBalance();
      if (result && result.success) {
        this.globalData.lingliBalance = result.balance;
        this.eventBus.emit('lingli-changed', result.balance);
      }
      return result;
    } catch (err) {
      console.error('获取灵力值失败:', err);
      return null;
    }
  },
});
