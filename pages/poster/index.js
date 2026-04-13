import { getReport } from '../../utils/cloud';

const app = getApp();

Page({
  data: {
    posterType: 'fortune',
    reportId: '',
    fortuneText: '',
    reportData: null,
    showTypes: false,
    canvasWidth: 600,
    canvasHeight: 900,
  },

  canvas: null,
  ctx: null,

  onLoad(options) {
    const { type, reportId, text } = options;
    this.setData({
      posterType: type || 'fortune',
      reportId: reportId || '',
      fortuneText: text ? decodeURIComponent(text) : '',
      showTypes: !type,
    });
  },

  onReady() {
    this.initCanvas().then(() => this.drawPoster());
  },

  async initCanvas() {
    return new Promise((resolve) => {
      const query = wx.createSelectorQuery();
      query.select('#posterCanvas').fields({ node: true, size: true }).exec((res) => {
        if (!res[0]) return;
        this.canvas = res[0].node;
        this.ctx = this.canvas.getContext('2d');
        const dpr = wx.getWindowInfo().pixelRatio;
        this.canvas.width = this.data.canvasWidth * dpr;
        this.canvas.height = this.data.canvasHeight * dpr;
        this.ctx.scale(dpr, dpr);
        resolve();
      });
    });
  },

  switchType(e) {
    this.setData({ posterType: e.currentTarget.dataset.type });
    this.drawPoster();
  },

  async drawPoster() {
    if (!this.ctx) return;
    const type = this.data.posterType;
    if (type === 'paipan' && this.data.reportId) {
      await this.loadReportData();
      this.drawPaipanPoster();
    } else if (type === 'fortune') {
      this.drawFortunePoster();
    } else {
      this.drawInvitePoster();
    }
  },

  async loadReportData() {
    if (this.data.reportData) return;
    try {
      const data = await getReport(this.data.reportId);
      this.setData({ reportData: data });
    } catch (err) {
      console.error('加载报告数据失败:', err);
    }
  },

  drawFortunePoster() {
    const ctx = this.ctx, w = this.data.canvasWidth, h = this.data.canvasHeight;
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#F5EEFF');
    gradient.addColorStop(0.5, '#FDF8F4');
    gradient.addColorStop(1, '#F0E6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2, 260, 100, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(139, 92, 246, 0.1)';
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = 'rgba(139, 92, 246, 0.5)';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('— 今日好运签 —', w / 2, 400);

    ctx.fillStyle = '#1E1B4B';
    ctx.font = '600 22px sans-serif';
    this.wrapText(ctx, this.data.fortuneText || '心怀善意，世界便会温柔以待', w / 2, 460, w - 120, 36);

    ctx.fillStyle = '#8B5CF6';
    ctx.font = '600 28px sans-serif';
    ctx.fillText('听听', w / 2, h - 140);

    ctx.fillStyle = 'rgba(107,114,128,0.6)';
    ctx.font = '12px sans-serif';
    ctx.fillText('万物皆有灵，万事皆可听', w / 2, h - 100);
    ctx.fillText('长按识别小程序码', w / 2, h - 50);
  },

  drawPaipanPoster() {
    const ctx = this.ctx, w = this.data.canvasWidth, h = this.data.canvasHeight;
    const report = this.data.reportData;

    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#F5EEFF');
    gradient.addColorStop(1, '#E8DEFF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#8B5CF6';
    ctx.font = '600 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('听听 · 灵耳排盘', w / 2, 60);

    if (report && report.baziRaw) {
      const { pillars } = report.baziRaw;
      const labels = ['年柱', '月柱', '日柱', '时柱'];
      const pillarData = [pillars.year, pillars.month, pillars.day, pillars.time];
      const gap = (w - 160) / 4;

      pillarData.forEach((p, i) => {
        const x = 80 + gap * i + gap / 2;
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '13px sans-serif';
        ctx.fillText(labels[i], x, 120);
        ctx.fillStyle = '#D97706';
        ctx.font = '600 32px sans-serif';
        ctx.fillText(p.gan, x, 170);
        ctx.fillStyle = '#7C3AED';
        ctx.font = '600 32px sans-serif';
        ctx.fillText(p.zhi, x, 220);
      });

      if (report.summary) {
        ctx.fillStyle = 'rgba(139,92,246,0.5)';
        ctx.font = '13px sans-serif';
        ctx.fillText('— 听听一语 —', w / 2, 290);
        ctx.fillStyle = '#1E1B4B';
        ctx.font = '500 18px sans-serif';
        ctx.fillText(report.summary, w / 2, 330);
      }
    }

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('万物皆有灵，万事皆可听', w / 2, h - 80);
    ctx.fillText('长按识别小程序码 · 查看你的命运之音', w / 2, h - 50);
  },

  drawInvitePoster() {
    const ctx = this.ctx, w = this.data.canvasWidth, h = this.data.canvasHeight;
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#F5EEFF');
    gradient.addColorStop(1, '#FDF8F4');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2, 250, 120, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(139,92,246,0.08)';
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#1E1B4B';
    ctx.font = '600 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('听听', w / 2, 440);

    ctx.fillStyle = '#6B7280';
    ctx.font = '15px sans-serif';
    ctx.fillText('万物皆有灵，万事皆可听', w / 2, 480);

    ctx.fillStyle = '#1E1B4B';
    ctx.font = '500 18px sans-serif';
    this.wrapText(ctx, '听听刚帮我算了一下，这周运势不错！你也来摸摸它的灵耳试试？', w / 2, 550, w - 120, 32);

    ctx.strokeStyle = 'rgba(139,92,246,0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(w / 2 - 80, h - 220, 160, 160);
    ctx.setLineDash([]);
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '11px sans-serif';
    ctx.fillText('小程序码', w / 2, h - 130);
    ctx.fillText('长按识别 · 来听听你的命运之音', w / 2, h - 40);
  },

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    let line = '', currentY = y;
    for (let i = 0; i < text.length; i++) {
      const testLine = line + text[i];
      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(line, x, currentY);
        line = text[i];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  },

  async savePoster() {
    try {
      await wx.authorize({ scope: 'scope.writePhotosAlbum' }).catch(() => {});
      const tempPath = await new Promise((resolve, reject) => {
        wx.canvasToTempFilePath({ canvas: this.canvas, success: (r) => resolve(r.tempFilePath), fail: reject });
      });
      await wx.saveImageToPhotosAlbum({ filePath: tempPath });
      wx.showToast({ title: '已保存到相册', icon: 'success' });
    } catch (err) {
      if (err.errMsg && err.errMsg.includes('auth')) {
        wx.showModal({ title: '需要相册权限', content: '请在设置中允许', confirmText: '去设置', success: (r) => { if (r.confirm) wx.openSetting(); } });
      } else {
        wx.showToast({ title: '保存失败', icon: 'none' });
      }
    }
  },

  onShareAppMessage() {
    return { title: '听听 - 来听听你的命运之音', path: `/pages/home/index?inviterId=${app.globalData.openid || ''}` };
  },
});
