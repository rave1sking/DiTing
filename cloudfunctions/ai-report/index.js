const cloud = require('wx-server-sdk');
const https = require('https');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-your-api-key';
const DEEPSEEK_MODEL = 'deepseek-chat';

const PROMPTS = {
  summary: `你是"听听"——一只来自上古的神兽谛听，拥有聆听万物心声的能力。你温柔、智慧、治愈。

请基于以下八字数据，生成一句不超过20字的诗意总结（"听听一语"）。

要求：
1. 语言优美，如古诗般意境
2. 蕴含积极的心理暗示
3. 严禁任何封建迷信、命定论词汇
4. 不要出现"八字""命"等术语
5. 像一位温柔的朋友给出鼓励

八字数据：{{BAZI_DATA}}

请直接输出一句话，不要加引号或其他格式。`,

  energy: `你是"听听"——一只来自上古的神兽谛听。

请基于以下八字数据，输出今日五行能量分析。

要求：
1. 以JSON格式输出五行能量值（0-100的整数）
2. 附加一句简短的能量解读（不超过30字）
3. 能量值应基于八字五行强弱，适当结合今日天干地支
4. 语气温暖治愈，带有积极暗示
5. 严禁封建迷信词汇

八字数据：{{BAZI_DATA}}
今日日期：{{TODAY}}

请严格按以下JSON格式输出：
{"energy":{"金":数值,"木":数值,"水":数值,"火":数值,"土":数值},"interpretation":"一句能量解读"}`,

  deep: `你是"听听"——一只来自上古的神兽谛听，拥有聆听万物心声的能力。你温柔、智慧且见解独到。

请基于以下八字数据，从事业、财运、感情三个维度给出深度解读报告。

核心要求：
1. 每个维度包含：当前状态分析（2-3句）+ 具体行动建议（2-3条）
2. 以"听听"的第一人称口吻，温柔而有洞察力
3. 大量使用心理暗示和积极引导，而非"命中注定"
4. 严禁任何封建迷信词汇，不说"命""运""劫""煞"等
5. 融入现代心理学的认知行为建议
6. 每个维度给出1-100的能量分数

八字数据：{{BAZI_DATA}}
性别：{{GENDER}}
今日日期：{{TODAY}}

请严格按以下JSON格式输出：
{
  "career": {
    "score": 数值,
    "analysis": "当前状态分析",
    "advice": ["建议1", "建议2", "建议3"]
  },
  "wealth": {
    "score": 数值,
    "analysis": "当前状态分析",
    "advice": ["建议1", "建议2", "建议3"]
  },
  "love": {
    "score": 数值,
    "analysis": "当前状态分析",
    "advice": ["建议1", "建议2", "建议3"]
  }
}`,
};

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { reportId, type } = event;

  if (!reportId || !type) {
    return { success: false, error: '缺少参数' };
  }

  try {
    const { data: report } = await db.collection('reports').doc(reportId).get();

    if (!report) {
      return { success: false, error: '报告不存在' };
    }

    const baziData = formatBaziForPrompt(report.baziRaw);
    const today = new Date().toISOString().slice(0, 10);
    const gender = report.birthInfo.gender === 'male' ? '男' : '女';

    let prompt = PROMPTS[type];
    if (!prompt) return { success: false, error: '未知的报告类型' };

    prompt = prompt.replace('{{BAZI_DATA}}', baziData);
    prompt = prompt.replace('{{TODAY}}', today);
    prompt = prompt.replace('{{GENDER}}', gender);

    const aiResponse = await callDeepSeek(prompt, type);

    const updateData = {};
    if (type === 'summary') {
      updateData.summary = aiResponse;
    } else if (type === 'energy') {
      try {
        updateData.energyData = JSON.parse(aiResponse);
      } catch {
        updateData.energyData = { raw: aiResponse };
      }
    } else if (type === 'deep') {
      try {
        updateData.deepReport = JSON.parse(aiResponse);
      } catch {
        updateData.deepReport = { raw: aiResponse };
      }
    }

    await db.collection('reports').doc(reportId).update({ data: updateData });

    return { success: true, data: updateData, type };
  } catch (err) {
    console.error('AI报告生成失败:', err);
    return { success: false, error: err.message };
  }
};

function formatBaziForPrompt(baziRaw) {
  if (!baziRaw) return '无数据';
  const { pillars, dayMaster, dayMasterElement, wuxingCount } = baziRaw;
  return `四柱: ${baziRaw.baziString}, 日主: ${dayMaster}(${dayMasterElement}), 五行统计: 金${wuxingCount['金']}木${wuxingCount['木']}水${wuxingCount['水']}火${wuxingCount['火']}土${wuxingCount['土']}`;
}

function callDeepSeek(prompt, type) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: '你是谛听，一只温柔智慧的上古神兽。' },
        { role: 'user', content: prompt },
      ],
      temperature: type === 'summary' ? 0.9 : 0.7,
      max_tokens: type === 'deep' ? 2000 : 500,
    });

    const url = new URL(DEEPSEEK_API_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.choices && parsed.choices[0]) {
            resolve(parsed.choices[0].message.content.trim());
          } else {
            reject(new Error('DeepSeek返回格式异常: ' + data));
          }
        } catch (e) {
          reject(new Error('解析DeepSeek响应失败: ' + e.message));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}
