import { addReport, saveUserBirthDate } from '../../utils/cloud';

const { calculateBazi, getShichenList } = require('./utils/bazi');
const { REGIONS, resolveLocation } = require('./utils/regions');
const { solarToLunar, formatLunar } = require('./utils/lunar');

const shichenList = getShichenList();
const provinceOptions = REGIONS.map((p, i) => ({ label: p.name, value: i }));

function buildCityOptions(provinceIdx) {
  if (provinceIdx < 0 || provinceIdx >= REGIONS.length) return [];
  return REGIONS[provinceIdx].cities.map((c, i) => ({ label: c.name, value: i }));
}

function buildDistrictOptions(provinceIdx, cityIdx) {
  if (provinceIdx < 0 || provinceIdx >= REGIONS.length) return [];
  const cities = REGIONS[provinceIdx].cities;
  if (cityIdx < 0 || cityIdx >= cities.length) return [];
  return cities[cityIdx].districts.map((d, i) => ({ label: d.name, value: i }));
}

Page({
  data: {
    name: '',
    gender: '',
    birthDate: '',
    dateValue: '2000-01-01',
    lunarDateText: '',
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

    showBirthRegionPicker: false,
    birthRegionValue: [0, 0, 0],
    birthRegionText: '',
    birthProvinceOptions: provinceOptions,
    birthCityOptions: buildCityOptions(0),
    birthDistrictOptions: buildDistrictOptions(0, 0),

    showCurrentRegionPicker: false,
    currentRegionValue: [0, 0, 0],
    currentRegionText: '',
    currentProvinceOptions: provinceOptions,
    currentCityOptions: buildCityOptions(0),
    currentDistrictOptions: buildDistrictOptions(0, 0),
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
    const birthDate = e.detail.value;
    const [y, m, d] = birthDate.split('-').map(Number);
    const lunar = solarToLunar(y, m, d);
    const lunarDateText = lunar ? formatLunar(lunar.year, lunar.month, lunar.day, lunar.isLeap) : '';
    this.setData({
      birthDate,
      dateValue: birthDate,
      lunarDateText,
      showDatePicker: false,
    });
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

  openBirthRegionPicker() { this.setData({ showBirthRegionPicker: true }); },
  onBirthRegionCancel() { this.setData({ showBirthRegionPicker: false }); },

  onBirthRegionPick(e) {
    const { column, index } = e.detail;
    const [p, c] = this.data.birthRegionValue;
    if (column === 0) {
      this.setData({
        birthRegionValue: [index, 0, 0],
        birthCityOptions: buildCityOptions(index),
        birthDistrictOptions: buildDistrictOptions(index, 0),
      });
    } else if (column === 1) {
      this.setData({
        birthRegionValue: [p, index, 0],
        birthDistrictOptions: buildDistrictOptions(p, index),
      });
    } else {
      this.setData({ birthRegionValue: [p, c, index] });
    }
  },

  onBirthRegionConfirm(e) {
    const [p, c, d] = e.detail.value;
    const location = resolveLocation(p, c, d);
    this.setData({
      birthRegionValue: [p, c, d],
      birthRegionText: location ? location.fullName : '',
      showBirthRegionPicker: false,
    });
    this.checkSubmit();
  },

  openCurrentRegionPicker() { this.setData({ showCurrentRegionPicker: true }); },
  onCurrentRegionCancel() { this.setData({ showCurrentRegionPicker: false }); },

  onCurrentRegionPick(e) {
    const { column, index } = e.detail;
    const [p, c] = this.data.currentRegionValue;
    if (column === 0) {
      this.setData({
        currentRegionValue: [index, 0, 0],
        currentCityOptions: buildCityOptions(index),
        currentDistrictOptions: buildDistrictOptions(index, 0),
      });
    } else if (column === 1) {
      this.setData({
        currentRegionValue: [p, index, 0],
        currentDistrictOptions: buildDistrictOptions(p, index),
      });
    } else {
      this.setData({ currentRegionValue: [p, c, index] });
    }
  },

  onCurrentRegionConfirm(e) {
    const [p, c, d] = e.detail.value;
    const location = resolveLocation(p, c, d);
    this.setData({
      currentRegionValue: [p, c, d],
      currentRegionText: location ? location.fullName : '',
      showCurrentRegionPicker: false,
    });
    this.checkSubmit();
  },

  checkSubmit() {
    const { name, gender, birthDate, shichenName, birthRegionText, currentRegionText } = this.data;
    this.setData({
      canSubmit: !!(name && name.length >= 2 && gender && birthDate && shichenName
        && birthRegionText && currentRegionText),
    });
  },

  async onSubmit() {
    if (!this.data.canSubmit) return;
    wx.showLoading({ title: '谛听正在感应...' });

    try {
      const [y, m, d] = this.data.birthDate.split('-').map(Number);
      const birthPlace = resolveLocation(...this.data.birthRegionValue);
      const currentPlace = resolveLocation(...this.data.currentRegionValue);

      const baziResult = calculateBazi(
        y, m, d,
        this.data.shichenIndex,
        this.data.gender,
        this.data.name,
        birthPlace,
        currentPlace,
      );
      const app = getApp();

      const userId = app.globalData.openid || 'local';
      await saveUserBirthDate(userId, this.data.birthDate);

      const reportId = await addReport({
        userId,
        birthInfo: {
          name: this.data.name,
          solarDate: this.data.birthDate,
          lunarDate: this.data.lunarDateText,
          shichenIndex: this.data.shichenIndex,
          shichenName: this.data.shichenName,
          gender: this.data.gender,
          birthPlace,
          currentPlace,
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
