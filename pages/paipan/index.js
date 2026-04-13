import { addReport } from '../../utils/cloud';

const { calculateBazi, getShichenList } = require('../../utils/bazi');
const shichenList = getShichenList();

Page({
  data: {
    name: '',
    gender: '',
    birthDate: '',
    dateValue: '2000-01-01',
    shichenIndex: 0,
    shichenName: '',
    showDatePicker: false,
    showShichenPicker: false,
    canSubmit: false,
    today: new Date().toISOString().slice(0, 10),
    shichenOptions: shichenList.map((s) => ({
      label: `${s.name}（${s.label}）`,
      value: s.index,
    })),
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value.trim() });
    this.checkSubmit();
  },

  selectGender(e) {
    this.setData({ gender: e.currentTarget.dataset.gender });
    this.checkSubmit();
  },

  openDatePicker() { this.setData({ showDatePicker: true }); },
  onDateCancel() { this.setData({ showDatePicker: false }); },

  onDateConfirm(e) {
    this.setData({ birthDate: e.detail.value, dateValue: e.detail.value, showDatePicker: false });
    this.checkSubmit();
  },

  openShichenPicker() { this.setData({ showShichenPicker: true }); },
  onShichenCancel() { this.setData({ showShichenPicker: false }); },

  onShichenConfirm(e) {
    const idx = e.detail.value[0];
    this.setData({
      shichenIndex: idx,
      shichenName: `${shichenList[idx].name}（${shichenList[idx].label}）`,
      showShichenPicker: false,
    });
    this.checkSubmit();
  },

  checkSubmit() {
    const { name, gender, birthDate, shichenName } = this.data;
    this.setData({ canSubmit: !!(name && name.length >= 2 && gender && birthDate && shichenName) });
  },

  async onSubmit() {
    if (!this.data.canSubmit) return;
    wx.showLoading({ title: '谛听正在感应...' });

    try {
      const [y, m, d] = this.data.birthDate.split('-').map(Number);
      const baziResult = calculateBazi(y, m, d, this.data.shichenIndex, this.data.gender, this.data.name);
      const app = getApp();

      const reportId = await addReport({
        userId: app.globalData.openid || 'local',
        birthInfo: {
          name: this.data.name,
          solarDate: this.data.birthDate,
          shichenIndex: this.data.shichenIndex,
          shichenName: this.data.shichenName,
          gender: this.data.gender,
        },
        baziRaw: baziResult,
        summary: '',
        energyData: baziResult.wuxingEnergy,
        deepReport: null,
      });

      wx.hideLoading();
      wx.navigateTo({ url: `/pages/report/index?id=${reportId}` });
    } catch (err) {
      wx.hideLoading();
      console.error('排盘失败:', err);
      wx.showToast({ title: '排盘失败，请重试', icon: 'none' });
    }
  },
});
