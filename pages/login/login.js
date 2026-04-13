const app = getApp();

Page({
  data: {
    radioValue: '',
    isCheck: false,
  },

  onCheckChange(e) {
    const { value } = e.detail;
    this.setData({
      radioValue: value,
      isCheck: value === 'agree',
    });
  },

  async onWechatLogin() {
    if (!this.data.isCheck) {
      wx.showToast({ title: '请先同意用户协议', icon: 'none' });
      return;
    }

    try {
      const { userInfo } = await new Promise((resolve, reject) => {
        wx.getUserProfile({
          desc: '用于展示您的头像和昵称',
          success: resolve,
          fail: reject,
        });
      });

      await app.updateUserInfo({
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
      });

      app.globalData.userInfo = {
        ...app.globalData.userInfo,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
      };

      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/home/index' });
      }, 800);
    } catch (err) {
      console.error('微信登录失败:', err);
      wx.showToast({ title: '登录失败，请重试', icon: 'none' });
    }
  },

  onSkip() {
    wx.switchTab({ url: '/pages/home/index' });
  },
});
