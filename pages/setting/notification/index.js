import { getUserSettings, updateUserSettings } from '~/utils/cloud';

const ITEMS = [
  { key: 'notifyReport', label: '报告生成通知', desc: '深度报告生成完成时提醒' },
  { key: 'notifyCheckin', label: '打卡提醒', desc: '每日打卡与连续奖励提醒' },
  { key: 'notifyMarketing', label: '活动与优惠', desc: '会员活动、灵力福利等消息' },
];

Page({
  data: {
    loading: true,
    saving: false,
    items: ITEMS,
    settings: {},
  },

  onShow() {
    this.loadSettings();
  },

  async loadSettings() {
    this.setData({ loading: true });
    try {
      const res = await getUserSettings();
      if (res && res.success) {
        this.setData({ settings: res.settings, loading: false });
        return;
      }
      wx.showToast({ title: '加载失败', icon: 'none' });
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
    this.setData({ loading: false });
  },

  async onSwitchChange(e) {
    const { key } = e.currentTarget.dataset;
    const value = e.detail.value;
    const prev = this.data.settings[key];
    this.setData({ [`settings.${key}`]: value, saving: true });

    try {
      const res = await updateUserSettings({ [key]: value });
      if (res && res.success) {
        this.setData({ settings: res.settings, saving: false });
        return;
      }
      this.setData({ [`settings.${key}`]: prev, saving: false });
      wx.showToast({ title: '保存失败', icon: 'none' });
    } catch (err) {
      this.setData({ [`settings.${key}`]: prev, saving: false });
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },
});
