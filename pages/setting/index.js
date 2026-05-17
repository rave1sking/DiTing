import { logout } from '~/utils/cloud';
import { SETTING_MENU_ROUTES } from './utils/menuRoutes';

Page({
  data: {
    menuData: [
      [
        { title: '通知设置', icon: 'notification' },
        { title: '隐私设置', icon: 'info-circle' },
      ],
      [
        { title: '关于听听', icon: 'help-circle' },
        { title: '用户协议', icon: 'file' },
        { title: '隐私政策', icon: 'secured' },
      ],
    ],
    loggingOut: false,
  },

  onEleClick(e) {
    const { title } = e.currentTarget.dataset.data;
    const url = SETTING_MENU_ROUTES[title];
    if (!url) {
      wx.showToast({ title: '功能开发中', icon: 'none' });
      return;
    }
    wx.navigateTo({ url });
  },

  onLogout() {
    if (this.data.loggingOut) return;
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？本地缓存将被清除。',
      success: async (res) => {
        if (!res.confirm) return;
        this.setData({ loggingOut: true });
        wx.showLoading({ title: '退出中' });
        try {
          await logout();
        } catch (err) {
          console.warn('服务端登出记录失败:', err);
        }
        wx.hideLoading();
        wx.clearStorageSync();
        const app = getApp();
        app.globalData.userInfo = null;
        app.globalData.openid = null;
        app.globalData.lingliBalance = 0;
        app.globalData.isLoggedIn = false;
        this.setData({ loggingOut: false });
        wx.reLaunch({ url: '/pages/home/index' });
      },
    });
  },
});
