const app = getApp();

Page({
  data: {
    isTyping: false,
    isThinking: false,
    todaySummary: '',
    statusText: '谛听在此，静候您的到来',
    statusTexts: [
      '谛听在此，静候您的到来',
      '万物皆有灵，万事皆可听',
      '今日灵气充盈，宜问前程',
      '谛听耳朵微动，似有所感',
      '天地间灵气涌动...',
    ],
    statusIndex: 0,
  },

  statusTimer: null,

  onLoad(options) {
    if (options.inviterId) {
      wx.setStorageSync('inviterId', options.inviterId);
    }
  },

  onShow() {
    this.startStatusRotation();
    this.loadTodaySummary();
  },

  onHide() { this.stopStatusRotation(); },
  onUnload() { this.stopStatusRotation(); },

  startStatusRotation() {
    this.stopStatusRotation();
    this.statusTimer = setInterval(() => {
      const nextIndex = (this.data.statusIndex + 1) % this.data.statusTexts.length;
      this.setData({ statusIndex: nextIndex, statusText: this.data.statusTexts[nextIndex] });
    }, 5000);
  },

  stopStatusRotation() {
    if (this.statusTimer) { clearInterval(this.statusTimer); this.statusTimer = null; }
  },

  loadTodaySummary() {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const cached = wx.getStorageSync('todaySummary');
      if (cached && cached.date === today) {
        this.setData({ todaySummary: cached.text });
      }
    } catch (err) {
      console.warn('加载今日灵语失败:', err);
    }
  },

  goPaipan() { wx.navigateTo({ url: '/pages/paipan/index' }); },
  goEar() { wx.switchTab({ url: '/pages/ear/index' }); },
  goHistory() { wx.navigateTo({ url: '/pages/history/index' }); },

  onShareAppMessage() {
    return {
      title: '听听 - 万物皆有灵，万事皆可听',
      path: `/pages/home/index?inviterId=${app.globalData.openid || ''}`,
    };
  },

  onShareTimeline() {
    return { title: '听听 - AI灵耳排盘，聆听命运之音' };
  },
});
