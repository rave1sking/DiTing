/**
 * 构建 regions.js 数据
 * 输入：pca-code.json（modood 省市区三级结构）+ city-geo.json（88250 含经纬度）
 * 输出：pages/paipan/utils/regions.js
 */

const fs = require('fs');
const path = require('path');

const pcaRaw = fs.readFileSync(process.env.TEMP + '/pca-code.json', 'utf8');
const pca = JSON.parse(pcaRaw);

const geoRaw = fs.readFileSync(process.env.TEMP + '/city-geo.json', 'utf8');
const geoData = JSON.parse(geoRaw);

// 构建 geo 查询索引
// 1) areaIndex: 精确匹配 province + area
// 2) cityIndex: 精确匹配 province + city
// 3) provinceIndex: 按 province 聚合
const areaIndex = new Map();
const cityIndex = new Map();
const provinceCityAreas = new Map(); // province -> [{area, lng, lat}]

for (const row of geoData) {
  const lng = parseFloat(row.lng);
  const lat = parseFloat(row.lat);
  if (!isFinite(lng) || !isFinite(lat)) continue;

  if (row.area) {
    areaIndex.set(row.province + '|' + row.area, { lng, lat });
    if (!provinceCityAreas.has(row.province)) provinceCityAreas.set(row.province, []);
    provinceCityAreas.get(row.province).push({ area: row.area, city: row.city, lng, lat });
  } else if (row.city) {
    cityIndex.set(row.province + '|' + row.city, { lng, lat });
  }
}

// 正规化省名 (pca 可能是 "北京市", geo 是 "北京市" — 一致)
function normalizeProvinceName(name) {
  // 去除后缀 "自治区"、"特别行政区" 仅用于匹配
  return name;
}

function getCityGeo(provinceName, cityName) {
  // 先精确匹配
  const key = provinceName + '|' + cityName;
  if (cityIndex.has(key)) return cityIndex.get(key);
  // 直辖市的 city="市辖区"
  if (cityIndex.has(provinceName + '|市辖区')) return cityIndex.get(provinceName + '|市辖区');
  // 取该省该市下所有区县的平均坐标
  const areas = provinceCityAreas.get(provinceName) || [];
  const matched = areas.filter((a) => a.city === cityName || cityName === '市辖区');
  if (matched.length) {
    const lng = matched.reduce((s, a) => s + a.lng, 0) / matched.length;
    const lat = matched.reduce((s, a) => s + a.lat, 0) / matched.length;
    return { lng, lat };
  }
  return null;
}

function getAreaGeo(provinceName, cityName, areaName) {
  const key = provinceName + '|' + areaName;
  if (areaIndex.has(key)) return areaIndex.get(key);
  return null;
}

// 简化省名显示（去掉后缀用于 UI）
function shortenProvince(name) {
  if (!name) return name;
  return name
    .replace(/维吾尔自治区$/, '')
    .replace(/回族自治区$/, '')
    .replace(/壮族自治区$/, '')
    .replace(/自治区$/, '')
    .replace(/特别行政区$/, '')
    .replace(/省$/, '')
    .replace(/市$/, '');
}

// 追加港澳台（pca-code.json 不含）
const EXTRA_PROVINCES = [
  { name: '香港特别行政区', children: [
    { name: '香港特别行政区', children: [
      { name: '中西区' }, { name: '湾仔区' }, { name: '东区' }, { name: '南区' },
      { name: '油尖旺区' }, { name: '深水埗区' }, { name: '九龙城区' }, { name: '黄大仙区' },
      { name: '观塘区' }, { name: '荃湾区' }, { name: '屯门区' }, { name: '元朗区' },
      { name: '北区' }, { name: '大埔区' }, { name: '西贡区' }, { name: '沙田区' },
      { name: '葵青区' }, { name: '离岛区' },
    ] },
  ] },
  { name: '澳门特别行政区', children: [
    { name: '澳门特别行政区', children: [
      { name: '花地玛堂区' }, { name: '圣安多尼堂区' }, { name: '大堂区' },
      { name: '望德堂区' }, { name: '风顺堂区' }, { name: '嘉模堂区' },
      { name: '圣方济各堂区' }, { name: '路氹城' },
    ] },
  ] },
  { name: '台湾省', children: [
    { name: '台北市', children: [
      { name: '中正区' }, { name: '大同区' }, { name: '中山区' }, { name: '松山区' },
      { name: '大安区' }, { name: '万华区' }, { name: '信义区' }, { name: '士林区' },
      { name: '北投区' }, { name: '内湖区' }, { name: '南港区' }, { name: '文山区' },
    ] },
    { name: '新北市', children: [
      { name: '板桥区' }, { name: '三重区' }, { name: '中和区' }, { name: '永和区' },
      { name: '新庄区' }, { name: '新店区' }, { name: '土城区' }, { name: '芦洲区' },
    ] },
    { name: '桃园市', children: [
      { name: '桃园区' }, { name: '中坜区' }, { name: '平镇区' }, { name: '八德区' },
    ] },
    { name: '台中市', children: [
      { name: '中区' }, { name: '东区' }, { name: '南区' }, { name: '西区' }, { name: '北区' },
      { name: '北屯区' }, { name: '西屯区' }, { name: '南屯区' },
    ] },
    { name: '台南市', children: [
      { name: '中西区' }, { name: '东区' }, { name: '南区' }, { name: '北区' }, { name: '安平区' },
    ] },
    { name: '高雄市', children: [
      { name: '新兴区' }, { name: '前金区' }, { name: '苓雅区' }, { name: '盐埕区' },
      { name: '鼓山区' }, { name: '旗津区' }, { name: '前镇区' }, { name: '三民区' },
    ] },
    { name: '基隆市', children: [{ name: '仁爱区' }, { name: '信义区' }, { name: '中正区' }, { name: '中山区' }] },
    { name: '新竹市', children: [{ name: '东区' }, { name: '北区' }, { name: '香山区' }] },
    { name: '嘉义市', children: [{ name: '东区' }, { name: '西区' }] },
  ] },
];

// 手动的港澳台坐标表
const EXTRA_COORDS = {
  '香港特别行政区': { lng: 114.17, lat: 22.28 },
  '澳门特别行政区': { lng: 113.55, lat: 22.19 },
  '台北市': { lng: 121.52, lat: 25.03 },
  '新北市': { lng: 121.47, lat: 25.01 },
  '桃园市': { lng: 121.30, lat: 24.99 },
  '台中市': { lng: 120.68, lat: 24.15 },
  '台南市': { lng: 120.21, lat: 23.00 },
  '高雄市': { lng: 120.31, lat: 22.62 },
  '基隆市': { lng: 121.74, lat: 25.13 },
  '新竹市': { lng: 120.97, lat: 24.81 },
  '嘉义市': { lng: 120.45, lat: 23.48 },
};

const allProvinces = [...pca, ...EXTRA_PROVINCES];

const result = [];
let missingCity = 0;
let missingArea = 0;

for (const province of allProvinces) {
  const pName = province.name;
  const pShort = shortenProvince(pName);
  const pEntry = { name: pShort, cities: [] };

  for (const city of province.children || []) {
    const cName = city.name;
    let cityGeo = getCityGeo(pName, cName);
    if (!cityGeo && EXTRA_COORDS[cName]) cityGeo = EXTRA_COORDS[cName];
    if (!cityGeo && EXTRA_COORDS[pName]) cityGeo = EXTRA_COORDS[pName];

    // 直辖市 / 省直辖 特殊处理：把 "市辖区" 作为 city 时，用省名
    const displayCityName = cName === '市辖区' ? pName : cName;

    const cEntry = {
      name: displayCityName,
      lng: cityGeo ? Math.round(cityGeo.lng * 100) / 100 : null,
      lat: cityGeo ? Math.round(cityGeo.lat * 100) / 100 : null,
      districts: [],
    };

    if (!cityGeo) missingCity++;

    for (const area of city.children || []) {
      const aName = area.name;
      let aGeo = getAreaGeo(pName, cName, aName);
      if (!aGeo) aGeo = cityGeo; // fallback
      if (!aGeo) missingArea++;
      cEntry.districts.push({
        name: aName,
        lng: aGeo ? Math.round(aGeo.lng * 100) / 100 : (cityGeo ? cEntry.lng : null),
        lat: aGeo ? Math.round(aGeo.lat * 100) / 100 : (cityGeo ? cEntry.lat : null),
      });
    }

    // fallback：如果城市本身没有经纬度，用区县平均
    if (cEntry.lng == null && cEntry.districts.length) {
      const valid = cEntry.districts.filter((d) => d.lng != null);
      if (valid.length) {
        cEntry.lng = Math.round((valid.reduce((s, d) => s + d.lng, 0) / valid.length) * 100) / 100;
        cEntry.lat = Math.round((valid.reduce((s, d) => s + d.lat, 0) / valid.length) * 100) / 100;
      }
    }

    pEntry.cities.push(cEntry);
  }
  result.push(pEntry);
}

console.log(`省: ${result.length}, 缺城市坐标: ${missingCity}, 缺区坐标: ${missingArea}`);

// 生成 JS 文件
const jsLines = [];
jsLines.push('/**');
jsLines.push(' * 中国行政区划（省/市/区县）数据');
jsLines.push(' * 数据源：modood/Administrative-divisions-of-China + 88250/city-geo');
jsLines.push(' * 每个节点附带经纬度，用于真太阳时校正与方位五行');
jsLines.push(' */');
jsLines.push('');
jsLines.push('const REGIONS = [');

for (const p of result) {
  jsLines.push(`  { name: ${JSON.stringify(p.name)}, cities: [`);
  for (const c of p.cities) {
    const header = `    { name: ${JSON.stringify(c.name)}, lng: ${c.lng}, lat: ${c.lat}, districts: [`;
    jsLines.push(header);
    for (const d of c.districts) {
      jsLines.push(`      { name: ${JSON.stringify(d.name)}, lng: ${d.lng}, lat: ${d.lat} },`);
    }
    jsLines.push('    ] },');
  }
  jsLines.push('  ] },');
}

jsLines.push('];');
jsLines.push('');
jsLines.push(`function getProvinces() {
  return REGIONS.map((p) => p.name);
}

function getCities(provinceIdx) {
  if (provinceIdx < 0 || provinceIdx >= REGIONS.length) return [];
  return REGIONS[provinceIdx].cities.map((c) => c.name);
}

function getDistricts(provinceIdx, cityIdx) {
  if (provinceIdx < 0 || provinceIdx >= REGIONS.length) return [];
  const cities = REGIONS[provinceIdx].cities;
  if (cityIdx < 0 || cityIdx >= cities.length) return [];
  return cities[cityIdx].districts.map((d) => d.name);
}

function resolveLocation(provinceIdx, cityIdx, districtIdx) {
  if (provinceIdx < 0 || provinceIdx >= REGIONS.length) return null;
  const province = REGIONS[provinceIdx];
  const city = province.cities[cityIdx];
  if (!city) return null;
  const district = city.districts[districtIdx] || null;
  const point = district || city;
  return {
    province: province.name,
    city: city.name,
    district: district ? district.name : '',
    name: district ? district.name : city.name,
    fullName: district ? \`\${province.name}·\${city.name}·\${district.name}\` : \`\${province.name}·\${city.name}\`,
    lng: point.lng,
    lat: point.lat,
  };
}

module.exports = {
  REGIONS,
  getProvinces,
  getCities,
  getDistricts,
  resolveLocation,
};
`);

const outPath = path.join(__dirname, '..', 'pages', 'paipan', 'utils', 'regions.js');
fs.writeFileSync(outPath, jsLines.join('\n'), 'utf8');
console.log('pages/paipan/utils/regions.js 生成完毕，文件大小:', fs.statSync(outPath).size, 'bytes');

// 输出统计：每省城市数、每市区县数
let totalCities = 0;
let totalDistricts = 0;
for (const p of result) {
  totalCities += p.cities.length;
  for (const c of p.cities) totalDistricts += c.districts.length;
}
console.log(`统计：${result.length} 省 / ${totalCities} 市 / ${totalDistricts} 区县`);
