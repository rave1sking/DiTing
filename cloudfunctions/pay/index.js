const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const PRODUCTS = {
  lingli_small: {
    name: '灵力小礼包',
    price: 190,
    lingli: 50,
    desc: '50灵力值',
  },
  lingli_large: {
    name: '灵力大礼包',
    price: 990,
    lingli: 300,
    desc: '300灵力值',
  },
  vip_monthly: {
    name: '听听守护者月卡',
    price: 2990,
    lingli: 0,
    days: 30,
    desc: '30天无限深度报告',
  },
};

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { action, productId, orderId } = event;

  switch (action) {
    case 'createOrder':
      return createOrder(openid, productId);
    case 'confirmPay':
      return confirmPay(openid, orderId);
    case 'getProducts':
      return { success: true, products: PRODUCTS };
    default:
      return { success: false, error: '未知操作' };
  }
};

async function createOrder(openid, productId) {
  const product = PRODUCTS[productId];
  if (!product) return { success: false, error: '商品不存在' };

  try {
    const orderNo = `DT${Date.now()}${Math.random().toString(36).slice(2, 8)}`;

    const { _id: orderId } = await db.collection('orders').add({
      data: {
        _id: orderNo,
        userId: openid,
        productId,
        productName: product.name,
        amount: product.price,
        status: 'pending',
        createdAt: db.serverDate(),
      },
    });

    const res = await cloud.cloudPay.unifiedOrder({
      body: product.name,
      outTradeNo: orderNo,
      totalFee: product.price,
      spbillCreateIp: '127.0.0.1',
      envId: cloud.DYNAMIC_CURRENT_ENV,
      functionName: 'pay',
      subMchId: process.env.MCH_ID || '',
      nonceStr: orderNo,
    });

    return {
      success: true,
      payment: res.payment,
      orderId: orderNo,
    };
  } catch (err) {
    console.error('创建订单失败:', err);
    return { success: false, error: err.message };
  }
}

async function confirmPay(openid, orderId) {
  try {
    const { data: order } = await db.collection('orders').doc(orderId).get();

    if (!order || order.userId !== openid) {
      return { success: false, error: '订单不存在' };
    }

    if (order.status === 'paid') {
      return { success: true, message: '已处理' };
    }

    const product = PRODUCTS[order.productId];
    if (!product) return { success: false, error: '商品不存在' };

    await db.collection('orders').doc(orderId).update({
      data: { status: 'paid', paidAt: db.serverDate() },
    });

    if (product.lingli > 0) {
      await db.collection('users').doc(openid).update({
        data: {
          lingliBalance: _.inc(product.lingli),
          updatedAt: db.serverDate(),
        },
      });

      await db.collection('transactions').add({
        data: {
          userId: openid,
          type: 'earn',
          amount: product.lingli,
          source: 'purchase',
          refId: orderId,
          createdAt: db.serverDate(),
        },
      });
    }

    if (product.days) {
      const now = new Date();
      const { data: user } = await db.collection('users').doc(openid).get();
      let expiry = user.memberExpiry ? new Date(user.memberExpiry) : now;
      if (expiry < now) expiry = now;
      expiry.setDate(expiry.getDate() + product.days);

      await db.collection('users').doc(openid).update({
        data: {
          memberType: 'vip',
          memberExpiry: expiry,
          updatedAt: db.serverDate(),
        },
      });
    }

    return { success: true };
  } catch (err) {
    console.error('确认支付失败:', err);
    return { success: false, error: err.message };
  }
}
