import { getReportList } from '../../utils/cloud';

const app = getApp();

Page({
  data: {
    reports: [],
    loading: true,
  },

  onShow() { this.loadReports(); },

  async loadReports() {
    this.setData({ loading: true });
    try {
      const openid = app.globalData.openid || 'local';
      const data = await getReportList(openid);
      this.setData({ reports: data || [] });
    } catch (err) {
      console.error('加载历史报告失败:', err);
    }
    this.setData({ loading: false });
  },

  goReport(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/report/index?id=${id}` });
  },

  goPaipan() { wx.navigateTo({ url: '/pages/paipan/index' }); },
});
