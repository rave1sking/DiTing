const app = getApp();

Page({
  data: {
    userInfo: {},
    lingliBalance: 0,
  },

  onShow() {
    const { userInfo, lingliBalance } = app.globalData;
    this.setData({
      userInfo: userInfo || {},
      lingliBalance: lingliBalance || 0,
    });

    app.eventBus.on('lingli-changed', (balance) => {
      this.setData({ lingliBalance: balance });
    });
    app.eventBus.on('userinfo-updated', (info) => {
      this.setData({ userInfo: info });
    });
  },

  onHide() {
    app.eventBus.off('lingli-changed');
    app.eventBus.off('userinfo-updated');
  },

  onLogin() {
    if (app.globalData.userInfo && app.globalData.userInfo.nickName) return;
    wx.navigateTo({ url: '/pages/login/login' });
  },

  goHistory() {
    wx.navigateTo({ url: '/pages/history/index' });
  },

  goMembership() {
    wx.navigateTo({ url: '/pages/membership/index' });
  },

  goLingli() {
    wx.navigateTo({ url: '/pages/lingli/index' });
  },

  goSetting() {
    wx.navigateTo({ url: '/pages/setting/index' });
  },

  onShare() {
    wx.navigateTo({ url: '/pages/poster/index?type=invite' });
  },

  onShareAppMessage() {
    return {
      title: '听听 - 万物皆有灵，万事皆可听',
      path: `/pages/home/index?inviterId=${app.globalData.openid}`,
      imageUrl: '/static/images/share-cover.png',
    };
  },
});
