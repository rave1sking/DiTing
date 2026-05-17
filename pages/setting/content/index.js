import { getSettingsContent } from '~/utils/cloud';

const TYPE_TITLES = {
  about: '关于听听',
  userAgreement: '用户协议',
  privacyPolicy: '隐私政策',
};

Page({
  data: {
    loading: true,
    error: '',
    contentType: '',
    content: null,
  },

  onLoad(options) {
    const contentType = options.type || 'about';
    const navTitle = TYPE_TITLES[contentType] || '详情';
    wx.setNavigationBarTitle({ title: navTitle });
    this.setData({ contentType });
    this.loadContent(contentType);
  },

  async loadContent(contentType) {
    this.setData({ loading: true, error: '' });
    try {
      const res = await getSettingsContent(contentType);
      if (res && res.success && res.content) {
        this.setData({ content: res.content, loading: false });
        return;
      }
      this.setData({ loading: false, error: '内容加载失败' });
    } catch (err) {
      this.setData({ loading: false, error: '内容加载失败' });
    }
  },
});
