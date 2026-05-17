import { getUserSettings, updateUserSettings } from '~/utils/cloud';

const ITEMS = [
  { key: 'privacyShowProfile', label: '展示头像与昵称', desc: '在「我的」等页面展示微信头像昵称' },
  { key: 'privacyPersonalized', label: '个性化推荐', desc: '根据使用习惯优化内容与运势推荐' },
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
