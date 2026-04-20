import { getReport, generateAIReport, spendLingli } from '../../utils/cloud';

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

      const { pillars, dayMaster, dayMasterElement, wuxingEnergy, nameAnalysis, solarTimeInfo } = report.baziRaw;
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

      this.setData({
        userName,
        nameGrids,
        birthPlaceText,
        currentPlaceText,
        solarTimeTip,
        pillarLabels: [
          { label: '年柱', gan: pillars.year.gan, zhi: pillars.year.zhi },
          { label: '月柱', gan: pillars.month.gan, zhi: pillars.month.zhi },
          { label: '日柱', gan: pillars.day.gan, zhi: pillars.day.zhi },
          { label: '时柱', gan: pillars.time.gan, zhi: pillars.time.zhi },
        ],
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
      success: async (res) => { if (res.confirm) await this.doGenerateDeep(); },
    });
  },

  async watchAdForDeep() {
    wx.showToast({ title: '广告功能开发中', icon: 'none' });
  },

  async doGenerateDeep() {
    this.setData({ deepLoading: true });
    try {
      await spendLingli(10, 'report', this.data.reportId);
      app.refreshLingli();
      const result = await generateAIReport(this.data.reportId, 'deep');
      if (result && result.success && result.data.deepReport) {
        this.setData({ deepReport: result.data.deepReport });
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
