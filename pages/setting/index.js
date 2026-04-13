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
  },

  onEleClick(e) {
    const { title } = e.currentTarget.dataset.data;
    wx.showToast({ title, icon: 'none' });
  },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          const app = getApp();
          app.globalData.userInfo = null;
          app.globalData.openid = null;
          app.globalData.lingliBalance = 0;
          app.globalData.isLoggedIn = false;
          wx.reLaunch({ url: '/pages/home/index' });
        }
      },
    });
  },
});
