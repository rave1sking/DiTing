import { getLingliHistory, earnLingli } from '../../utils/cloud';

const app = getApp();

const SOURCE_LABELS = {
  checkin: '每日打卡', ad: '观看广告', purchase: '充值灵力',
  invite: '邀请好友', report: '深度解析', question: '追加提问',
};

Page({
  data: {
    balance: 0,
    history: [],
    hasMore: false,
    page: 0,
  },

  onShow() {
    this.setData({ balance: app.globalData.lingliBalance || 0 });
    this.loadHistory(0);
    app.refreshLingli();
    app.eventBus.on('lingli-changed', (balance) => { this.setData({ balance }); });
  },

  onHide() { app.eventBus.off('lingli-changed'); },

  async loadHistory(page) {
    try {
      const result = await getLingliHistory(page);
      if (result && result.success) {
        const items = result.data.map((item) => ({
          ...item,
          sourceLabel: SOURCE_LABELS[item.source] || item.source,
          timeLabel: this.formatTime(item.createdAt),
        }));
        this.setData({
          history: page === 0 ? items : [...this.data.history, ...items],
          hasMore: result.hasMore,
          page,
        });
      }
    } catch (err) {
      console.error('加载灵力明细失败:', err);
    }
  },

  loadMore() { this.loadHistory(this.data.page + 1); },

  formatTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  },

  goCheckin() { wx.switchTab({ url: '/pages/ear/index' }); },

  async watchAd() {
    try {
      await earnLingli(5, 'ad');
      app.refreshLingli();
      this.loadHistory(0);
      wx.showToast({ title: '+5 灵力值', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  goBuy() { wx.navigateTo({ url: '/pages/membership/index' }); },
});
