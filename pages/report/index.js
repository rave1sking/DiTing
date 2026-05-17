import { getReport, generateAIReport, spendLingli, updateReport } from '../../utils/cloud';

const { showRewardedVideo, preloadRewardedVideo } = require('./utils/ad');

const app = getApp();

const WUXING_COLORS = {
  '金': '#D97706', '木': '#16A34A', '水': '#2563EB', '火': '#DC2626', '土': '#92400E',
};

Page({
  data: {
    reportId: '',
    userName: '',
    nameGrids: [],
    birthPlaceText: '',
    currentPlaceText: '',
    solarTimeTip: '',
    pillarLabels: [],
    pillarDetails: [],
    kongWangText: '',
    qiYunText: '',
    dayunList: [],
    liuNianList: [],
    shenShaList: [],
    shishenSummary: [],
    dayMaster: '',
    dayMasterElement: '',
    lunarInfo: '',
    summary: '',
    summaryLoading: false,
    wuxingList: [],
    energyInterpretation: '',
    deepReport: null,
    deepLoading: false,
  },

  onLoad(options) {
    preloadRewardedVideo();
    if (options.id) {
      this.setData({ reportId: options.id });
      this.loadReport(options.id);
    }
  },

  async loadReport(reportId) {
    try {
      const report = await getReport(reportId);
      if (!report || !report.baziRaw) {
        wx.showToast({ title: '报告数据异常', icon: 'none' });
        return;
      }

      const {
        pillars, dayMaster, dayMasterElement, wuxingEnergy, nameAnalysis, solarTimeInfo,
        enrichedPillars, kongWang, qiYun, dayun, liuNian, shenSha, shishenSummary,
      } = report.baziRaw;
      const lunar = report.baziRaw.lunar;
      const userName = report.birthInfo.name || report.baziRaw.name || '';

      const nameGrids = [];
      if (nameAnalysis && nameAnalysis.grids) {
        Object.values(nameAnalysis.grids).forEach((g) => {
          nameGrids.push({ label: g.label, value: g.value, wuxing: g.wuxing });
        });
      }

      const birthPlace = report.birthInfo.birthPlace || report.baziRaw.birthPlace;
      const currentPlace = report.birthInfo.currentPlace || report.baziRaw.currentPlace;
      const formatPlace = (p) => {
        if (!p) return '';
        if (p.fullName) return p.fullName;
        const parts = [p.province, p.city, p.district].filter(Boolean);
        return parts.length ? parts.join('·') : (p.name || '');
      };
      const birthPlaceText = formatPlace(birthPlace);
      const currentPlaceText = formatPlace(currentPlace);

      let solarTimeTip = '';
      if (solarTimeInfo && solarTimeInfo.corrected) {
        const sign = solarTimeInfo.diffMinutes >= 0 ? '+' : '';
        solarTimeTip = `已按出生地经度校正真太阳时（${sign}${solarTimeInfo.diffMinutes}分）`;
      }

      const ep = enrichedPillars || {};
      const pillarKeys = [
        { key: 'year', label: '年柱' },
        { key: 'month', label: '月柱' },
        { key: 'day', label: '日柱' },
        { key: 'time', label: '时柱' },
      ];
      const pillarLabels = pillarKeys.map(({ key, label }) => ({
        label,
        gan: pillars[key].gan,
        zhi: pillars[key].zhi,
      }));
      const pillarDetails = pillarKeys.map(({ key, label }) => {
        const p = ep[key] || pillars[key];
        const cangGanText = (p.cangGan || [])
          .map((c) => `${c.gan}(${c.shishen})`)
          .join(' ');
        return {
          label,
          gan: p.gan,
          zhi: p.zhi,
          nayin: p.nayin || '',
          ganShishen: p.ganShishen || '',
          cangGanText,
        };
      });

      const kongWangText = kongWang && kongWang.length
        ? `日柱空亡：${kongWang.join('、')}`
        : '';

      let qiYunText = '';
      if (qiYun && dayun) {
        qiYunText = `大运${dayun.direction}，${qiYun.startAgeText}起运（距${qiYun.targetJie || '节'}${qiYun.days || 0}天）`;
      }

      const dayunList = (dayun && dayun.list) ? dayun.list.map((d) => ({
        ...d,
        shishen: '', // filled below if we have dayMaster
      })) : (report.baziRaw.dayunList || []);

      const liuNianNear = (liuNian && liuNian.nearFuture) ? liuNian.nearFuture : [];
      const liuNianList = liuNianNear.slice(0, 6).map((ln) => ({
        year: ln.year,
        full: ln.full,
        nayin: ln.nayin,
        shishen: ln.shishen,
        age: ln.age,
      }));

      const shenShaList = (shenSha || []).map((s) => `${s.name}(${s.source})`);

      const shishenSummaryList = shishenSummary
        ? Object.keys(shishenSummary).map((name) => ({
          name,
          count: Math.round(shishenSummary[name] * 10) / 10,
        }))
        : [];

      this.setData({
        userName,
        nameGrids,
        birthPlaceText,
        currentPlaceText,
        solarTimeTip,
        pillarLabels,
        pillarDetails,
        kongWangText,
        qiYunText,
        dayunList,
        liuNianList,
        shenShaList,
        shishenSummary: shishenSummaryList,
        dayMaster,
        dayMasterElement,
        lunarInfo: lunar ? (lunar.text || `农历${lunar.year}年${lunar.month}月${lunar.day}`) : '',
        wuxingList: Object.keys(wuxingEnergy).map((name) => ({
          name, value: wuxingEnergy[name], color: WUXING_COLORS[name] || '#999',
        })),
        summary: report.summary || '',
        deepReport: report.deepReport || null,
      });

      if (report.energyData && report.energyData.interpretation) {
        this.setData({ energyInterpretation: report.energyData.interpretation });
      }

      this.drawWuxingChart(wuxingEnergy);
      if (!report.summary) this.generateSummary();
    } catch (err) {
      console.error('加载报告失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  async generateSummary() {
    this.setData({ summaryLoading: true });
    try {
      const result = await generateAIReport(this.data.reportId, 'summary');
      if (result && result.success) {
        this.setData({ summary: result.data.summary });
      }
    } catch (err) {
      console.error('生成听听一语失败:', err);
    }
    this.setData({ summaryLoading: false });
  },

  async unlockDeepReport() {
    const balance = app.globalData.lingliBalance || 0;
    if (balance < 10) {
      wx.showModal({
        title: '灵力不足',
        content: '深度解析需要10灵力值。可通过每日打卡或观看广告获取。',
        confirmText: '去获取',
        success: (res) => { if (res.confirm) wx.navigateTo({ url: '/pages/lingli/index' }); },
      });
      return;
    }
    wx.showModal({
      title: '深度解析',
      content: '将消耗10灵力值解锁深度解析报告，确定继续？',
      success: async (res) => { if (res.confirm) await this.doGenerateDeep({ viaAd: false }); },
    });
  },

  async watchAdForDeep() {
    if (this.data.deepLoading || this.data.deepReport) return;

    wx.showLoading({ title: '加载广告...', mask: true });
    try {
      const completed = await showRewardedVideo();
      wx.hideLoading();
      if (!completed) {
        wx.showToast({ title: '需完整观看广告才能解锁', icon: 'none' });
        return;
      }
      await this.doGenerateDeep({ viaAd: true });
    } catch (err) {
      wx.hideLoading();
      console.error('激励广告解锁失败:', err);
      wx.showToast({ title: err.message || '广告暂不可用', icon: 'none' });
    }
  },

  async doGenerateDeep(options = {}) {
    const { viaAd = false } = options;
    this.setData({ deepLoading: true });
    try {
      if (!viaAd) {
        await spendLingli(10, 'report', this.data.reportId);
        app.refreshLingli();
      } else {
        await updateReport(this.data.reportId, { deepUnlockedVia: 'ad' });
      }
      const result = await generateAIReport(this.data.reportId, 'deep');
      if (result && result.success && result.data.deepReport) {
        this.setData({ deepReport: result.data.deepReport });
        wx.showToast({
          title: viaAd ? '观看完成，已解锁' : '解锁成功',
          icon: 'success',
        });
      } else {
        wx.showToast({ title: '生成失败，请重试', icon: 'none' });
      }
    } catch (err) {
      console.error('深度解析失败:', err);
      wx.showToast({ title: '生成失败', icon: 'none' });
    }
    this.setData({ deepLoading: false });
  },

  drawWuxingChart(energy) {
    const query = wx.createSelectorQuery();
    query.select('#wuxingCanvas').fields({ node: true, size: true }).exec((res) => {
      if (!res[0]) return;
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getWindowInfo().pixelRatio;
      canvas.width = res[0].width * dpr;
      canvas.height = res[0].height * dpr;
      ctx.scale(dpr, dpr);

      const w = res[0].width, h = res[0].height;
      const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 30;
      const names = ['金', '木', '水', '火', '土'];
      const colors = ['#D97706', '#16A34A', '#2563EB', '#DC2626', '#92400E'];
      const values = names.map((n) => (energy[n] || 0) / 100);
      const step = (Math.PI * 2) / 5, start = -Math.PI / 2;

      for (let ring = 5; ring >= 1; ring--) {
        const rr = (r * ring) / 5;
        ctx.beginPath();
        for (let i = 0; i <= 5; i++) {
          const a = start + step * i, x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(139,92,246,0.08)';
        ctx.stroke();
      }

      for (let i = 0; i < 5; i++) {
        const a = start + step * i;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
        ctx.strokeStyle = 'rgba(139,92,246,0.06)';
        ctx.stroke();
      }

      ctx.beginPath();
      for (let i = 0; i <= 5; i++) {
        const idx = i % 5, a = start + step * idx;
        const vr = r * Math.max(values[idx], 0.05);
        const x = cx + vr * Math.cos(a), y = cy + vr * Math.sin(a);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(139,92,246,0.15)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(139,92,246,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      for (let i = 0; i < 5; i++) {
        const a = start + step * i, lr = r + 18;
        ctx.fillStyle = colors[i];
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(names[i], cx + lr * Math.cos(a), cy + lr * Math.sin(a));
      }
    });
  },

  sharePoster() {
    wx.navigateTo({ url: `/pages/poster/index?type=paipan&reportId=${this.data.reportId}` });
  },

  goPaipan() { wx.navigateTo({ url: '/pages/paipan/index' }); },

  onShareAppMessage() {
    return {
      title: '听听帮我算了一下，来听听你的命运之音',
      path: `/pages/home/index?inviterId=${app.globalData.openid || ''}`,
    };
  },
});
