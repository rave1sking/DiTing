const app = getApp();

Page({
  data: {
    isVip: false,
    memberExpiry: '',
    selectedProduct: 'vip_monthly',
  },

  onShow() { this.checkVipStatus(); },

  checkVipStatus() {
    const userInfo = app.globalData.userInfo;
    if (userInfo && userInfo.memberType === 'vip' && userInfo.memberExpiry) {
      const expiry = new Date(userInfo.memberExpiry);
      if (expiry > new Date()) {
        this.setData({
          isVip: true,
          memberExpiry: `${expiry.getFullYear()}-${String(expiry.getMonth() + 1).padStart(2, '0')}-${String(expiry.getDate()).padStart(2, '0')}`,
        });
        return;
      }
    }
    this.setData({ isVip: false });
  },

  selectProduct(e) {
    this.setData({ selectedProduct: e.currentTarget.dataset.id });
  },

  onBuy() {
    if (!this.data.selectedProduct) return;
    wx.showToast({ title: '支付功能需开通云开发后启用', icon: 'none', duration: 2000 });
  },
});
