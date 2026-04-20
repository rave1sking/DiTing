import { addReport } from '../../utils/cloud';

const { calculateBazi, getShichenList, getCityList } = require('../../utils/bazi');
const shichenList = getShichenList();
const cityList = getCityList();

Page({
  data: {
    name: '',
    gender: '',
    birthDate: '',
    dateValue: '2000-01-01',
    shichenIndex: 0,
    shichenName: '',
    birthCityIndex: -1,
    birthCityName: '',
    currentCityIndex: -1,
    currentCityName: '',
    showDatePicker: false,
    showShichenPicker: false,
    showBirthCityPicker: false,
    showCurrentCityPicker: false,
    canSubmit: false,
    today: new Date().toISOString().slice(0, 10),
    shichenOptions: shichenList.map((s) => ({
      label: `${s.name}（${s.label}）`,
      value: s.index,
    })),
    cityOptions: cityList.map((c, i) => ({
      label: `${c.province}·${c.name}`,
      value: i,
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

  openBirthCityPicker() { this.setData({ showBirthCityPicker: true }); },
  onBirthCityCancel() { this.setData({ showBirthCityPicker: false }); },

  onBirthCityConfirm(e) {
    const idx = e.detail.value[0];
    const city = cityList[idx];
    this.setData({
      birthCityIndex: idx,
      birthCityName: `${city.province}·${city.name}`,
      showBirthCityPicker: false,
    });
    this.checkSubmit();
  },

  openCurrentCityPicker() { this.setData({ showCurrentCityPicker: true }); },
  onCurrentCityCancel() { this.setData({ showCurrentCityPicker: false }); },

  onCurrentCityConfirm(e) {
    const idx = e.detail.value[0];
    const city = cityList[idx];
    this.setData({
      currentCityIndex: idx,
      currentCityName: `${city.province}·${city.name}`,
      showCurrentCityPicker: false,
    });
    this.checkSubmit();
  },

  checkSubmit() {
    const { name, gender, birthDate, shichenName, birthCityIndex, currentCityIndex } = this.data;
    this.setData({
      canSubmit: !!(name && name.length >= 2 && gender && birthDate && shichenName
        && birthCityIndex >= 0 && currentCityIndex >= 0),
    });
  },

  async onSubmit() {
    if (!this.data.canSubmit) return;
    wx.showLoading({ title: '谛听正在感应...' });

    try {
      const [y, m, d] = this.data.birthDate.split('-').map(Number);
      const birthCity = cityList[this.data.birthCityIndex];
      const currentCity = cityList[this.data.currentCityIndex];
      const baziResult = calculateBazi(
        y, m, d,
        this.data.shichenIndex,
        this.data.gender,
        this.data.name,
        birthCity,
        currentCity,
      );
      const app = getApp();

      const reportId = await addReport({
        userId: app.globalData.openid || 'local',
        birthInfo: {
          name: this.data.name,
          solarDate: this.data.birthDate,
          shichenIndex: this.data.shichenIndex,
          shichenName: this.data.shichenName,
          gender: this.data.gender,
          birthPlace: birthCity,
          currentPlace: currentCity,
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
