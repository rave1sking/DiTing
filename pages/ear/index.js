import { checkin, getUserBirthDate } from '../../utils/cloud';

const { getTodayHoroscope, getZodiacFromBirthDate } = require('../../utils/horoscope');

const app = getApp();

const FORTUNE_TEXTS = [
  '今日宜放松心情，好运自然来敲门',
  '心怀善意，世界便会温柔以待',
  '保持微笑，你的能量场正在吸引美好',
  '今天适合做一件让自己开心的小事',
  '深呼吸，你比想象中更强大',
  '今日灵感充沛，适合创造与表达',
  '放下焦虑，当下即是最好的时刻',
  '你的温柔，是世界最珍贵的力量',
  '今天会有一个意想不到的小惊喜',
  '相信直觉，它正在引导你走向正确的方向',
  '今日适合与重要的人说说心里话',
  '宇宙正在为你悄悄安排一些美好',
  '慢一点也没关系，每一步都算数',
  '今日偏财运不错，留意身边的小机会',
  '你的善良终将被世界温柔以待',
  '给自己一个拥抱，你已经很棒了',
  '今日桃花微动，注意身边的目光',
  '保持好奇心，新世界正在向你展开',
  '困难只是暂时的，黎明就在前方',
  '今天的你，闪闪发光',
  '做自己就好，独特是最大的魅力',
  '你正在变成更好的自己，不要着急',
  '今天会有一句话，点亮你的心',
  '勇敢迈出第一步，后面的路会越来越宽',
  '今日五行平衡，万事皆顺',
  '你值得被爱，也值得爱自己',
  '小确幸正在路上，请保持期待',
  '今天的努力，是明天的礼物',
];

Page({
  data: {
    hasCheckedIn: false,
    showCard: false,
    fortuneText: '',
    animating: false,
    earnedLingli: 0,
    consecutiveCheckIns: 0,
    todayDate: '',
    progressPercent: 0,
    sparkles: [],
    horoscope: null,
    hasBirthDate: false,
    zodiacPreview: '',
    showHoroscopeCard: false,
  },

  onShow() {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    this.setData({ todayDate: dateStr });
    this.checkTodayStatus();
    this.loadBirthDatePreview();
  },

  async loadBirthDatePreview() {
    try {
      const userId = app.globalData.openid || 'local';
      const res = await getUserBirthDate(userId);
      if (res && res.birthDate) {
        const zodiac = getZodiacFromBirthDate(res.birthDate);
        this.setData({
          hasBirthDate: true,
          zodiacPreview: zodiac ? `${zodiac.symbol} ${zodiac.name}` : '',
        });
      } else {
        this.setData({ hasBirthDate: false, zodiacPreview: '' });
      }
    } catch (e) {
      this.setData({ hasBirthDate: false, zodiacPreview: '' });
    }
  },

  async loadHoroscope() {
    const userId = app.globalData.openid || 'local';
    const res = await getUserBirthDate(userId);
    if (!res || !res.birthDate) {
      this.setData({ horoscope: null, hasBirthDate: false });
      return null;
    }
    const horoscope = getTodayHoroscope(res.birthDate, this.data.todayDate);
    this.setData({ horoscope, hasBirthDate: true, showHoroscopeCard: true });
    return horoscope;
  },

  checkTodayStatus() {
    const userInfo = app.globalData.userInfo;
    if (userInfo) {
      const consecutive = userInfo.consecutiveCheckIns || 0;
      const lastDate = userInfo.lastCheckInDate || '';
      this.setData({
        hasCheckedIn: lastDate === this.data.todayDate,
        consecutiveCheckIns: consecutive,
        progressPercent: Math.min((consecutive / 7) * 100, 100),
      });
    }
  },

  async onTouchEar() {
    if (this.data.animating) return;

    if (this.data.hasCheckedIn) {
      wx.vibrateShort({ type: 'light' });
      const horoscope = await this.loadHoroscope();
      if (!horoscope) {
        wx.showModal({
          title: '暂无出生日期',
          content: '请先在「灵耳排盘」填写出生日期，即可查看专属星座运势。',
          confirmText: '去排盘',
          success: (res) => { if (res.confirm) this.goPaipan(); },
        });
        return;
      }
      this.setData({ showCard: true });
      return;
    }

    this.setData({
      animating: true,
      sparkles: Array.from({ length: 8 }, () => ({
        x: 20 + Math.random() * 60,
        y: 10 + Math.random() * 60,
        delay: Math.random() * 0.5,
      })),
    });

    wx.vibrateShort({ type: 'medium' });

    try {
      const result = await checkin(this.data.todayDate);

      if (result && result.success) {
        const fortuneIdx = this.getDateHash(this.data.todayDate) % FORTUNE_TEXTS.length;
        const fortuneText = result.fortuneText || FORTUNE_TEXTS[fortuneIdx];

        setTimeout(async () => {
          await this.loadHoroscope();
          this.setData({
            animating: false,
            hasCheckedIn: true,
            showCard: true,
            fortuneText,
            earnedLingli: result.earnedLingli || 5,
            consecutiveCheckIns: result.consecutiveCheckIns || this.data.consecutiveCheckIns + 1,
            progressPercent: Math.min(((result.consecutiveCheckIns || this.data.consecutiveCheckIns + 1) / 7) * 100, 100),
          });
          wx.vibrateShort({ type: 'light' });

          if (app.globalData.userInfo) {
            app.globalData.userInfo.lastCheckInDate = this.data.todayDate;
            app.globalData.userInfo.consecutiveCheckIns = result.consecutiveCheckIns;
          }
          app.refreshLingli();
        }, 800);
      } else {
        this.setData({ animating: false });
        wx.showToast({ title: result?.error || '打卡失败', icon: 'none' });
      }
    } catch (err) {
      console.error('打卡失败:', err);
      this.setData({ animating: false });
      wx.showToast({ title: '打卡失败', icon: 'none' });
    }
  },

  getDateHash(dateStr) {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  },

  shareFortune() {
    wx.navigateTo({ url: `/pages/poster/index?type=fortune&text=${encodeURIComponent(this.data.fortuneText)}` });
  },

  goPaipan() {
    wx.navigateTo({ url: '/pages/paipan/index' });
  },

  onShareAppMessage() {
    return {
      title: `今日好运签：${this.data.fortuneText || '来摸摸谛听的灵耳'}`,
      path: `/pages/home/index?inviterId=${app.globalData.openid || ''}`,
    };
  },
});
