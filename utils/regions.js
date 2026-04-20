/**
 * 中国行政区划（省/市/区县）数据（精简版）
 * 含主要区县的大致经纬度，用于真太阳时校正与方位五行
 * 数据结构：[{ name, cities: [{ name, lng, lat, districts: [{ name, lng, lat }] }] }]
 */

const REGIONS = [
  { name: '北京', cities: [
    { name: '北京市', lng: 116.40, lat: 39.90, districts: [
      { name: '东城区', lng: 116.42, lat: 39.93 },
      { name: '西城区', lng: 116.37, lat: 39.92 },
      { name: '朝阳区', lng: 116.49, lat: 39.93 },
      { name: '海淀区', lng: 116.30, lat: 39.96 },
      { name: '丰台区', lng: 116.29, lat: 39.86 },
      { name: '石景山区', lng: 116.22, lat: 39.91 },
      { name: '通州区', lng: 116.66, lat: 39.91 },
      { name: '昌平区', lng: 116.23, lat: 40.22 },
      { name: '大兴区', lng: 116.33, lat: 39.73 },
      { name: '顺义区', lng: 116.65, lat: 40.13 },
      { name: '房山区', lng: 116.14, lat: 39.75 },
      { name: '门头沟区', lng: 116.10, lat: 39.94 },
      { name: '怀柔区', lng: 116.64, lat: 40.32 },
      { name: '平谷区', lng: 117.12, lat: 40.14 },
      { name: '密云区', lng: 116.84, lat: 40.37 },
      { name: '延庆区', lng: 115.97, lat: 40.46 },
    ] },
  ] },
  { name: '上海', cities: [
    { name: '上海市', lng: 121.47, lat: 31.23, districts: [
      { name: '黄浦区', lng: 121.49, lat: 31.22 },
      { name: '徐汇区', lng: 121.44, lat: 31.19 },
      { name: '长宁区', lng: 121.42, lat: 31.22 },
      { name: '静安区', lng: 121.45, lat: 31.23 },
      { name: '普陀区', lng: 121.40, lat: 31.25 },
      { name: '虹口区', lng: 121.48, lat: 31.27 },
      { name: '杨浦区', lng: 121.53, lat: 31.26 },
      { name: '闵行区', lng: 121.38, lat: 31.11 },
      { name: '宝山区', lng: 121.49, lat: 31.40 },
      { name: '嘉定区', lng: 121.27, lat: 31.38 },
      { name: '浦东新区', lng: 121.54, lat: 31.22 },
      { name: '金山区', lng: 121.34, lat: 30.75 },
      { name: '松江区', lng: 121.23, lat: 31.03 },
      { name: '青浦区', lng: 121.12, lat: 31.15 },
      { name: '奉贤区', lng: 121.47, lat: 30.92 },
      { name: '崇明区', lng: 121.40, lat: 31.63 },
    ] },
  ] },
  { name: '天津', cities: [
    { name: '天津市', lng: 117.20, lat: 39.13, districts: [
      { name: '和平区', lng: 117.21, lat: 39.12 },
      { name: '河东区', lng: 117.23, lat: 39.12 },
      { name: '河西区', lng: 117.22, lat: 39.11 },
      { name: '南开区', lng: 117.15, lat: 39.13 },
      { name: '河北区', lng: 117.20, lat: 39.15 },
      { name: '红桥区', lng: 117.15, lat: 39.17 },
      { name: '滨海新区', lng: 117.70, lat: 39.02 },
      { name: '东丽区', lng: 117.31, lat: 39.09 },
      { name: '西青区', lng: 117.01, lat: 39.14 },
      { name: '津南区', lng: 117.38, lat: 38.99 },
      { name: '北辰区', lng: 117.13, lat: 39.22 },
      { name: '武清区', lng: 117.04, lat: 39.38 },
      { name: '宝坻区', lng: 117.31, lat: 39.72 },
      { name: '静海区', lng: 116.97, lat: 38.94 },
      { name: '蓟州区', lng: 117.41, lat: 40.05 },
    ] },
  ] },
  { name: '重庆', cities: [
    { name: '重庆市', lng: 106.55, lat: 29.56, districts: [
      { name: '渝中区', lng: 106.56, lat: 29.55 },
      { name: '江北区', lng: 106.53, lat: 29.61 },
      { name: '南岸区', lng: 106.56, lat: 29.53 },
      { name: '九龙坡区', lng: 106.48, lat: 29.50 },
      { name: '沙坪坝区', lng: 106.46, lat: 29.54 },
      { name: '大渡口区', lng: 106.48, lat: 29.48 },
      { name: '渝北区', lng: 106.63, lat: 29.72 },
      { name: '巴南区', lng: 106.52, lat: 29.38 },
      { name: '北碚区', lng: 106.44, lat: 29.80 },
      { name: '万州区', lng: 108.38, lat: 30.82 },
      { name: '涪陵区', lng: 107.39, lat: 29.70 },
      { name: '长寿区', lng: 107.08, lat: 29.83 },
      { name: '永川区', lng: 105.93, lat: 29.36 },
      { name: '合川区', lng: 106.28, lat: 29.97 },
      { name: '江津区', lng: 106.25, lat: 29.29 },
    ] },
  ] },
  { name: '广东', cities: [
    { name: '广州市', lng: 113.26, lat: 23.13, districts: [
      { name: '越秀区', lng: 113.27, lat: 23.13 }, { name: '海珠区', lng: 113.31, lat: 23.08 },
      { name: '荔湾区', lng: 113.24, lat: 23.12 }, { name: '天河区', lng: 113.36, lat: 23.12 },
      { name: '白云区', lng: 113.27, lat: 23.16 }, { name: '黄埔区', lng: 113.48, lat: 23.10 },
      { name: '番禺区', lng: 113.38, lat: 22.94 }, { name: '花都区', lng: 113.22, lat: 23.40 },
      { name: '南沙区', lng: 113.53, lat: 22.80 }, { name: '增城区', lng: 113.83, lat: 23.29 },
      { name: '从化区', lng: 113.59, lat: 23.55 },
    ] },
    { name: '深圳市', lng: 114.06, lat: 22.54, districts: [
      { name: '福田区', lng: 114.06, lat: 22.52 }, { name: '罗湖区', lng: 114.13, lat: 22.55 },
      { name: '南山区', lng: 113.93, lat: 22.53 }, { name: '宝安区', lng: 113.88, lat: 22.56 },
      { name: '龙岗区', lng: 114.25, lat: 22.72 }, { name: '盐田区', lng: 114.24, lat: 22.56 },
      { name: '龙华区', lng: 114.04, lat: 22.65 }, { name: '坪山区', lng: 114.35, lat: 22.69 },
      { name: '光明区', lng: 113.90, lat: 22.74 }, { name: '大鹏新区', lng: 114.48, lat: 22.59 },
    ] },
    { name: '珠海市', lng: 113.58, lat: 22.27, districts: [
      { name: '香洲区', lng: 113.56, lat: 22.27 }, { name: '斗门区', lng: 113.30, lat: 22.21 },
      { name: '金湾区', lng: 113.36, lat: 22.15 },
    ] },
    { name: '佛山市', lng: 113.12, lat: 23.02, districts: [
      { name: '禅城区', lng: 113.12, lat: 23.02 }, { name: '南海区', lng: 113.14, lat: 23.03 },
      { name: '顺德区', lng: 113.29, lat: 22.81 }, { name: '三水区', lng: 112.89, lat: 23.16 },
      { name: '高明区', lng: 112.89, lat: 22.90 },
    ] },
    { name: '东莞市', lng: 113.75, lat: 23.02, districts: [
      { name: '莞城街道', lng: 113.75, lat: 23.03 }, { name: '南城街道', lng: 113.74, lat: 23.00 },
      { name: '东城街道', lng: 113.79, lat: 23.03 }, { name: '虎门镇', lng: 113.68, lat: 22.82 },
      { name: '长安镇', lng: 113.80, lat: 22.82 }, { name: '松山湖', lng: 113.90, lat: 22.95 },
    ] },
    { name: '中山市', lng: 113.39, lat: 22.52, districts: [
      { name: '石岐区', lng: 113.39, lat: 22.52 }, { name: '东区', lng: 113.40, lat: 22.53 },
      { name: '西区', lng: 113.36, lat: 22.53 }, { name: '南区', lng: 113.38, lat: 22.49 },
    ] },
    { name: '惠州市', lng: 114.41, lat: 23.11, districts: [
      { name: '惠城区', lng: 114.41, lat: 23.08 }, { name: '惠阳区', lng: 114.46, lat: 22.79 },
      { name: '博罗县', lng: 114.29, lat: 23.17 }, { name: '惠东县', lng: 114.72, lat: 22.99 },
    ] },
    { name: '汕头市', lng: 116.68, lat: 23.35, districts: [
      { name: '金平区', lng: 116.70, lat: 23.37 }, { name: '龙湖区', lng: 116.72, lat: 23.37 },
      { name: '濠江区', lng: 116.73, lat: 23.28 }, { name: '潮阳区', lng: 116.60, lat: 23.27 },
      { name: '潮南区', lng: 116.43, lat: 23.25 }, { name: '澄海区', lng: 116.76, lat: 23.47 },
    ] },
    { name: '湛江市', lng: 110.35, lat: 21.27, districts: [
      { name: '赤坎区', lng: 110.37, lat: 21.27 }, { name: '霞山区', lng: 110.40, lat: 21.19 },
      { name: '坡头区', lng: 110.45, lat: 21.25 }, { name: '麻章区', lng: 110.33, lat: 21.26 },
    ] },
    { name: '江门市', lng: 113.08, lat: 22.58, districts: [
      { name: '蓬江区', lng: 113.08, lat: 22.60 }, { name: '江海区', lng: 113.11, lat: 22.56 },
      { name: '新会区', lng: 113.03, lat: 22.46 },
    ] },
    { name: '肇庆市', lng: 112.47, lat: 23.05, districts: [
      { name: '端州区', lng: 112.48, lat: 23.05 }, { name: '鼎湖区', lng: 112.57, lat: 23.16 },
      { name: '高要区', lng: 112.46, lat: 23.03 },
    ] },
  ] },
  { name: '江苏', cities: [
    { name: '南京市', lng: 118.78, lat: 32.04, districts: [
      { name: '玄武区', lng: 118.80, lat: 32.05 }, { name: '秦淮区', lng: 118.80, lat: 32.01 },
      { name: '建邺区', lng: 118.73, lat: 32.03 }, { name: '鼓楼区', lng: 118.77, lat: 32.07 },
      { name: '栖霞区', lng: 118.88, lat: 32.10 }, { name: '雨花台区', lng: 118.78, lat: 31.99 },
      { name: '江宁区', lng: 118.84, lat: 31.95 }, { name: '浦口区', lng: 118.63, lat: 32.06 },
      { name: '六合区', lng: 118.84, lat: 32.35 }, { name: '溧水区', lng: 119.03, lat: 31.65 },
      { name: '高淳区', lng: 118.89, lat: 31.33 },
    ] },
    { name: '苏州市', lng: 120.59, lat: 31.30, districts: [
      { name: '姑苏区', lng: 120.61, lat: 31.32 }, { name: '虎丘区', lng: 120.57, lat: 31.30 },
      { name: '吴中区', lng: 120.63, lat: 31.26 }, { name: '相城区', lng: 120.64, lat: 31.37 },
      { name: '吴江区', lng: 120.65, lat: 31.16 }, { name: '工业园区', lng: 120.69, lat: 31.32 },
      { name: '常熟市', lng: 120.75, lat: 31.65 }, { name: '张家港市', lng: 120.55, lat: 31.87 },
      { name: '昆山市', lng: 120.98, lat: 31.39 }, { name: '太仓市', lng: 121.13, lat: 31.45 },
    ] },
    { name: '无锡市', lng: 120.30, lat: 31.57, districts: [
      { name: '梁溪区', lng: 120.30, lat: 31.58 }, { name: '锡山区', lng: 120.36, lat: 31.59 },
      { name: '惠山区', lng: 120.30, lat: 31.68 }, { name: '滨湖区', lng: 120.27, lat: 31.52 },
      { name: '新吴区', lng: 120.36, lat: 31.55 }, { name: '江阴市', lng: 120.29, lat: 31.92 },
      { name: '宜兴市', lng: 119.82, lat: 31.36 },
    ] },
    { name: '常州市', lng: 119.95, lat: 31.78, districts: [
      { name: '天宁区', lng: 119.95, lat: 31.76 }, { name: '钟楼区', lng: 119.90, lat: 31.80 },
      { name: '新北区', lng: 119.97, lat: 31.83 }, { name: '武进区', lng: 119.94, lat: 31.70 },
    ] },
    { name: '徐州市', lng: 117.18, lat: 34.26, districts: [
      { name: '云龙区', lng: 117.23, lat: 34.25 }, { name: '鼓楼区', lng: 117.19, lat: 34.29 },
      { name: '泉山区', lng: 117.19, lat: 34.24 }, { name: '铜山区', lng: 117.18, lat: 34.19 },
    ] },
    { name: '南通市', lng: 120.87, lat: 32.01, districts: [
      { name: '崇川区', lng: 120.86, lat: 32.01 }, { name: '港闸区', lng: 120.82, lat: 32.03 },
      { name: '通州区', lng: 121.07, lat: 32.07 }, { name: '海门区', lng: 121.17, lat: 31.87 },
    ] },
    { name: '扬州市', lng: 119.42, lat: 32.39, districts: [
      { name: '广陵区', lng: 119.44, lat: 32.40 }, { name: '邗江区', lng: 119.40, lat: 32.38 },
      { name: '江都区', lng: 119.57, lat: 32.44 },
    ] },
    { name: '镇江市', lng: 119.45, lat: 32.21, districts: [
      { name: '京口区', lng: 119.47, lat: 32.20 }, { name: '润州区', lng: 119.41, lat: 32.20 },
      { name: '丹徒区', lng: 119.43, lat: 32.13 },
    ] },
    { name: '盐城市', lng: 120.15, lat: 33.35, districts: [
      { name: '亭湖区', lng: 120.17, lat: 33.38 }, { name: '盐都区', lng: 120.15, lat: 33.34 },
      { name: '大丰区', lng: 120.47, lat: 33.20 },
    ] },
    { name: '泰州市', lng: 119.91, lat: 32.49, districts: [
      { name: '海陵区', lng: 119.92, lat: 32.49 }, { name: '高港区', lng: 119.88, lat: 32.32 },
    ] },
    { name: '淮安市', lng: 119.02, lat: 33.61, districts: [
      { name: '清江浦区', lng: 119.03, lat: 33.55 }, { name: '淮阴区', lng: 119.04, lat: 33.63 },
    ] },
    { name: '连云港市', lng: 119.18, lat: 34.60, districts: [
      { name: '海州区', lng: 119.17, lat: 34.57 }, { name: '连云区', lng: 119.37, lat: 34.76 },
    ] },
    { name: '宿迁市', lng: 118.28, lat: 33.96, districts: [
      { name: '宿城区', lng: 118.29, lat: 33.94 }, { name: '宿豫区', lng: 118.33, lat: 33.95 },
    ] },
  ] },
  { name: '浙江', cities: [
    { name: '杭州市', lng: 120.15, lat: 30.27, districts: [
      { name: '上城区', lng: 120.17, lat: 30.24 }, { name: '拱墅区', lng: 120.14, lat: 30.32 },
      { name: '西湖区', lng: 120.13, lat: 30.26 }, { name: '滨江区', lng: 120.21, lat: 30.21 },
      { name: '萧山区', lng: 120.26, lat: 30.18 }, { name: '余杭区', lng: 120.30, lat: 30.42 },
      { name: '临平区', lng: 120.30, lat: 30.42 }, { name: '富阳区', lng: 119.96, lat: 30.05 },
      { name: '临安区', lng: 119.72, lat: 30.23 },
    ] },
    { name: '宁波市', lng: 121.55, lat: 29.87, districts: [
      { name: '海曙区', lng: 121.55, lat: 29.87 }, { name: '江北区', lng: 121.57, lat: 29.89 },
      { name: '北仑区', lng: 121.84, lat: 29.90 }, { name: '镇海区', lng: 121.72, lat: 29.95 },
      { name: '鄞州区', lng: 121.55, lat: 29.82 }, { name: '奉化区', lng: 121.41, lat: 29.66 },
    ] },
    { name: '温州市', lng: 120.67, lat: 28.00, districts: [
      { name: '鹿城区', lng: 120.65, lat: 28.02 }, { name: '龙湾区', lng: 120.83, lat: 27.91 },
      { name: '瓯海区', lng: 120.64, lat: 27.97 }, { name: '洞头区', lng: 121.16, lat: 27.84 },
    ] },
    { name: '绍兴市', lng: 120.58, lat: 30.00, districts: [
      { name: '越城区', lng: 120.58, lat: 30.00 }, { name: '柯桥区', lng: 120.49, lat: 30.08 },
      { name: '上虞区', lng: 120.87, lat: 30.02 },
    ] },
    { name: '嘉兴市', lng: 120.76, lat: 30.74, districts: [
      { name: '南湖区', lng: 120.78, lat: 30.75 }, { name: '秀洲区', lng: 120.71, lat: 30.77 },
    ] },
    { name: '湖州市', lng: 120.09, lat: 30.89, districts: [
      { name: '吴兴区', lng: 120.13, lat: 30.86 }, { name: '南浔区', lng: 120.42, lat: 30.87 },
    ] },
    { name: '金华市', lng: 119.65, lat: 29.08, districts: [
      { name: '婺城区', lng: 119.57, lat: 29.08 }, { name: '金东区', lng: 119.69, lat: 29.09 },
      { name: '义乌市', lng: 120.07, lat: 29.31 },
    ] },
    { name: '台州市', lng: 121.43, lat: 28.66, districts: [
      { name: '椒江区', lng: 121.44, lat: 28.67 }, { name: '黄岩区', lng: 121.26, lat: 28.65 },
      { name: '路桥区', lng: 121.37, lat: 28.58 },
    ] },
    { name: '衢州市', lng: 118.87, lat: 28.94, districts: [
      { name: '柯城区', lng: 118.87, lat: 28.97 }, { name: '衢江区', lng: 118.96, lat: 28.98 },
    ] },
    { name: '丽水市', lng: 119.92, lat: 28.45, districts: [
      { name: '莲都区', lng: 119.92, lat: 28.45 },
    ] },
    { name: '舟山市', lng: 122.10, lat: 30.02, districts: [
      { name: '定海区', lng: 122.11, lat: 30.02 }, { name: '普陀区', lng: 122.30, lat: 29.95 },
    ] },
  ] },
  { name: '四川', cities: [
    { name: '成都市', lng: 104.07, lat: 30.67, districts: [
      { name: '锦江区', lng: 104.08, lat: 30.66 }, { name: '青羊区', lng: 104.06, lat: 30.67 },
      { name: '金牛区', lng: 104.05, lat: 30.69 }, { name: '武侯区', lng: 104.04, lat: 30.64 },
      { name: '成华区', lng: 104.11, lat: 30.66 }, { name: '龙泉驿区', lng: 104.27, lat: 30.56 },
      { name: '青白江区', lng: 104.25, lat: 30.88 }, { name: '新都区', lng: 104.16, lat: 30.82 },
      { name: '温江区', lng: 103.84, lat: 30.69 }, { name: '双流区', lng: 103.92, lat: 30.57 },
      { name: '郫都区', lng: 103.89, lat: 30.81 }, { name: '天府新区', lng: 104.08, lat: 30.42 },
    ] },
    { name: '绵阳市', lng: 104.74, lat: 31.46, districts: [
      { name: '涪城区', lng: 104.76, lat: 31.46 }, { name: '游仙区', lng: 104.78, lat: 31.47 },
    ] },
    { name: '自贡市', lng: 104.78, lat: 29.34, districts: [
      { name: '自流井区', lng: 104.77, lat: 29.34 }, { name: '贡井区', lng: 104.72, lat: 29.35 },
    ] },
    { name: '德阳市', lng: 104.40, lat: 31.13, districts: [
      { name: '旌阳区', lng: 104.39, lat: 31.14 }, { name: '罗江区', lng: 104.51, lat: 31.32 },
    ] },
    { name: '南充市', lng: 106.08, lat: 30.80, districts: [
      { name: '顺庆区', lng: 106.09, lat: 30.79 }, { name: '高坪区', lng: 106.12, lat: 30.78 },
    ] },
    { name: '宜宾市', lng: 104.62, lat: 28.77, districts: [
      { name: '翠屏区', lng: 104.62, lat: 28.77 }, { name: '叙州区', lng: 104.53, lat: 28.75 },
    ] },
    { name: '泸州市', lng: 105.44, lat: 28.87, districts: [
      { name: '江阳区', lng: 105.44, lat: 28.88 }, { name: '纳溪区', lng: 105.38, lat: 28.77 },
    ] },
    { name: '达州市', lng: 107.50, lat: 31.21, districts: [
      { name: '通川区', lng: 107.50, lat: 31.21 }, { name: '达川区', lng: 107.51, lat: 31.19 },
    ] },
    { name: '内江市', lng: 105.07, lat: 29.58, districts: [
      { name: '市中区', lng: 105.07, lat: 29.59 }, { name: '东兴区', lng: 105.08, lat: 29.59 },
    ] },
    { name: '乐山市', lng: 103.77, lat: 29.55, districts: [
      { name: '市中区', lng: 103.76, lat: 29.56 }, { name: '沙湾区', lng: 103.55, lat: 29.41 },
    ] },
  ] },
  { name: '湖北', cities: [
    { name: '武汉市', lng: 114.31, lat: 30.60, districts: [
      { name: '江岸区', lng: 114.31, lat: 30.60 }, { name: '江汉区', lng: 114.27, lat: 30.60 },
      { name: '硚口区', lng: 114.26, lat: 30.58 }, { name: '汉阳区', lng: 114.28, lat: 30.55 },
      { name: '武昌区', lng: 114.31, lat: 30.55 }, { name: '青山区', lng: 114.39, lat: 30.63 },
      { name: '洪山区', lng: 114.34, lat: 30.50 }, { name: '东西湖区', lng: 114.14, lat: 30.62 },
      { name: '汉南区', lng: 114.08, lat: 30.31 }, { name: '蔡甸区', lng: 114.03, lat: 30.58 },
      { name: '江夏区', lng: 114.32, lat: 30.35 }, { name: '黄陂区', lng: 114.37, lat: 30.88 },
      { name: '新洲区', lng: 114.80, lat: 30.84 },
    ] },
    { name: '宜昌市', lng: 111.29, lat: 30.69, districts: [
      { name: '西陵区', lng: 111.29, lat: 30.71 }, { name: '伍家岗区', lng: 111.36, lat: 30.64 },
      { name: '点军区', lng: 111.27, lat: 30.69 }, { name: '猇亭区', lng: 111.43, lat: 30.53 },
    ] },
    { name: '襄阳市', lng: 112.13, lat: 32.04, districts: [
      { name: '襄城区', lng: 112.13, lat: 32.01 }, { name: '樊城区', lng: 112.14, lat: 32.05 },
      { name: '襄州区', lng: 112.15, lat: 32.02 },
    ] },
    { name: '荆州市', lng: 112.24, lat: 30.33, districts: [
      { name: '沙市区', lng: 112.26, lat: 30.32 }, { name: '荆州区', lng: 112.19, lat: 30.35 },
    ] },
    { name: '黄石市', lng: 115.04, lat: 30.20, districts: [
      { name: '黄石港区', lng: 115.07, lat: 30.22 }, { name: '西塞山区', lng: 115.11, lat: 30.20 },
    ] },
    { name: '荆门市', lng: 112.20, lat: 31.04, districts: [
      { name: '东宝区', lng: 112.20, lat: 31.05 }, { name: '掇刀区', lng: 112.21, lat: 31.00 },
    ] },
    { name: '鄂州市', lng: 114.89, lat: 30.40, districts: [
      { name: '鄂城区', lng: 114.89, lat: 30.40 }, { name: '华容区', lng: 114.74, lat: 30.53 },
    ] },
    { name: '孝感市', lng: 113.93, lat: 30.93, districts: [
      { name: '孝南区', lng: 113.92, lat: 30.92 },
    ] },
    { name: '黄冈市', lng: 114.87, lat: 30.45, districts: [
      { name: '黄州区', lng: 114.88, lat: 30.43 },
    ] },
    { name: '咸宁市', lng: 114.32, lat: 29.84, districts: [
      { name: '咸安区', lng: 114.30, lat: 29.85 },
    ] },
    { name: '十堰市', lng: 110.79, lat: 32.63, districts: [
      { name: '茅箭区', lng: 110.81, lat: 32.59 }, { name: '张湾区', lng: 110.77, lat: 32.65 },
    ] },
  ] },
  { name: '陕西', cities: [
    { name: '西安市', lng: 108.94, lat: 34.27, districts: [
      { name: '新城区', lng: 108.96, lat: 34.27 }, { name: '碑林区', lng: 108.94, lat: 34.23 },
      { name: '莲湖区', lng: 108.94, lat: 34.27 }, { name: '雁塔区', lng: 108.95, lat: 34.22 },
      { name: '未央区', lng: 108.94, lat: 34.29 }, { name: '灞桥区', lng: 109.07, lat: 34.27 },
      { name: '长安区', lng: 108.91, lat: 34.16 }, { name: '高陵区', lng: 109.09, lat: 34.53 },
      { name: '临潼区', lng: 109.22, lat: 34.37 }, { name: '阎良区', lng: 109.23, lat: 34.66 },
      { name: '鄠邑区', lng: 108.61, lat: 34.11 },
    ] },
    { name: '咸阳市', lng: 108.71, lat: 34.33, districts: [
      { name: '秦都区', lng: 108.72, lat: 34.34 }, { name: '渭城区', lng: 108.72, lat: 34.33 },
    ] },
    { name: '宝鸡市', lng: 107.14, lat: 34.37, districts: [
      { name: '渭滨区', lng: 107.15, lat: 34.37 }, { name: '金台区', lng: 107.15, lat: 34.38 },
    ] },
    { name: '铜川市', lng: 108.97, lat: 34.91, districts: [
      { name: '王益区', lng: 109.07, lat: 35.07 }, { name: '印台区', lng: 109.10, lat: 35.11 },
    ] },
    { name: '渭南市', lng: 109.51, lat: 34.50, districts: [
      { name: '临渭区', lng: 109.51, lat: 34.50 },
    ] },
    { name: '延安市', lng: 109.49, lat: 36.60, districts: [
      { name: '宝塔区', lng: 109.49, lat: 36.59 }, { name: '安塞区', lng: 109.33, lat: 36.87 },
    ] },
    { name: '榆林市', lng: 109.73, lat: 38.29, districts: [
      { name: '榆阳区', lng: 109.73, lat: 38.28 },
    ] },
    { name: '汉中市', lng: 107.03, lat: 33.07, districts: [
      { name: '汉台区', lng: 107.03, lat: 33.08 }, { name: '南郑区', lng: 106.94, lat: 33.00 },
    ] },
    { name: '安康市', lng: 109.03, lat: 32.68, districts: [
      { name: '汉滨区', lng: 109.03, lat: 32.69 },
    ] },
    { name: '商洛市', lng: 109.94, lat: 33.87, districts: [
      { name: '商州区', lng: 109.94, lat: 33.86 },
    ] },
  ] },
  { name: '山东', cities: [
    { name: '济南市', lng: 117.00, lat: 36.65, districts: [
      { name: '历下区', lng: 117.08, lat: 36.67 }, { name: '市中区', lng: 116.99, lat: 36.65 },
      { name: '槐荫区', lng: 116.90, lat: 36.65 }, { name: '天桥区', lng: 116.99, lat: 36.68 },
      { name: '历城区', lng: 117.06, lat: 36.68 }, { name: '长清区', lng: 116.75, lat: 36.55 },
      { name: '章丘区', lng: 117.54, lat: 36.71 }, { name: '济阳区', lng: 117.17, lat: 36.98 },
    ] },
    { name: '青岛市', lng: 120.38, lat: 36.07, districts: [
      { name: '市南区', lng: 120.40, lat: 36.07 }, { name: '市北区', lng: 120.37, lat: 36.09 },
      { name: '李沧区', lng: 120.43, lat: 36.14 }, { name: '崂山区', lng: 120.47, lat: 36.11 },
      { name: '黄岛区', lng: 120.20, lat: 35.96 }, { name: '城阳区', lng: 120.40, lat: 36.31 },
      { name: '即墨区', lng: 120.45, lat: 36.39 }, { name: '胶州市', lng: 120.04, lat: 36.27 },
    ] },
    { name: '烟台市', lng: 121.40, lat: 37.54, districts: [
      { name: '芝罘区', lng: 121.40, lat: 37.54 }, { name: '福山区', lng: 121.27, lat: 37.50 },
      { name: '牟平区', lng: 121.60, lat: 37.39 }, { name: '莱山区', lng: 121.45, lat: 37.51 },
    ] },
    { name: '潍坊市', lng: 119.11, lat: 36.71, districts: [
      { name: '潍城区', lng: 119.11, lat: 36.71 }, { name: '寒亭区', lng: 119.22, lat: 36.77 },
      { name: '坊子区', lng: 119.17, lat: 36.66 }, { name: '奎文区', lng: 119.13, lat: 36.71 },
    ] },
    { name: '济宁市', lng: 116.59, lat: 35.42, districts: [
      { name: '任城区', lng: 116.60, lat: 35.41 }, { name: '兖州区', lng: 116.83, lat: 35.55 },
    ] },
    { name: '淄博市', lng: 118.05, lat: 36.81, districts: [
      { name: '张店区', lng: 118.02, lat: 36.81 }, { name: '淄川区', lng: 117.97, lat: 36.64 },
      { name: '博山区', lng: 117.87, lat: 36.49 }, { name: '临淄区', lng: 118.31, lat: 36.83 },
    ] },
    { name: '威海市', lng: 122.12, lat: 37.51, districts: [
      { name: '环翠区', lng: 122.12, lat: 37.50 }, { name: '文登区', lng: 122.06, lat: 37.19 },
    ] },
    { name: '临沂市', lng: 118.33, lat: 35.07, districts: [
      { name: '兰山区', lng: 118.35, lat: 35.07 }, { name: '罗庄区', lng: 118.28, lat: 34.99 },
      { name: '河东区', lng: 118.40, lat: 35.09 },
    ] },
    { name: '德州市', lng: 116.30, lat: 37.45, districts: [
      { name: '德城区', lng: 116.30, lat: 37.45 },
    ] },
    { name: '聊城市', lng: 115.98, lat: 36.46, districts: [
      { name: '东昌府区', lng: 115.99, lat: 36.44 },
    ] },
    { name: '泰安市', lng: 117.13, lat: 36.19, districts: [
      { name: '泰山区', lng: 117.14, lat: 36.19 }, { name: '岱岳区', lng: 117.04, lat: 36.19 },
    ] },
    { name: '东营市', lng: 118.50, lat: 37.46, districts: [
      { name: '东营区', lng: 118.58, lat: 37.45 }, { name: '河口区', lng: 118.53, lat: 37.89 },
    ] },
    { name: '日照市', lng: 119.53, lat: 35.42, districts: [
      { name: '东港区', lng: 119.53, lat: 35.42 }, { name: '岚山区', lng: 119.32, lat: 35.12 },
    ] },
    { name: '菏泽市', lng: 115.47, lat: 35.25, districts: [
      { name: '牡丹区', lng: 115.42, lat: 35.25 }, { name: '定陶区', lng: 115.57, lat: 35.07 },
    ] },
    { name: '枣庄市', lng: 117.32, lat: 34.81, districts: [
      { name: '薛城区', lng: 117.26, lat: 34.80 }, { name: '市中区', lng: 117.56, lat: 34.86 },
    ] },
    { name: '滨州市', lng: 118.02, lat: 37.38, districts: [
      { name: '滨城区', lng: 118.02, lat: 37.38 },
    ] },
  ] },
  { name: '河南', cities: [
    { name: '郑州市', lng: 113.63, lat: 34.75, districts: [
      { name: '中原区', lng: 113.61, lat: 34.75 }, { name: '二七区', lng: 113.64, lat: 34.72 },
      { name: '管城回族区', lng: 113.68, lat: 34.75 }, { name: '金水区', lng: 113.66, lat: 34.80 },
      { name: '上街区', lng: 113.31, lat: 34.80 }, { name: '惠济区', lng: 113.62, lat: 34.87 },
    ] },
    { name: '洛阳市', lng: 112.45, lat: 34.62, districts: [
      { name: '老城区', lng: 112.47, lat: 34.68 }, { name: '西工区', lng: 112.43, lat: 34.66 },
      { name: '瀍河回族区', lng: 112.50, lat: 34.68 }, { name: '涧西区', lng: 112.40, lat: 34.66 },
    ] },
    { name: '开封市', lng: 114.30, lat: 34.80, districts: [
      { name: '鼓楼区', lng: 114.35, lat: 34.79 }, { name: '龙亭区', lng: 114.35, lat: 34.80 },
    ] },
    { name: '新乡市', lng: 113.92, lat: 35.30, districts: [
      { name: '红旗区', lng: 113.87, lat: 35.30 }, { name: '卫滨区', lng: 113.86, lat: 35.30 },
    ] },
    { name: '南阳市', lng: 112.54, lat: 32.99, districts: [
      { name: '宛城区', lng: 112.54, lat: 32.99 }, { name: '卧龙区', lng: 112.54, lat: 32.99 },
    ] },
    { name: '信阳市', lng: 114.08, lat: 32.12, districts: [
      { name: '浉河区', lng: 114.06, lat: 32.12 }, { name: '平桥区', lng: 114.12, lat: 32.10 },
    ] },
    { name: '平顶山市', lng: 113.32, lat: 33.75, districts: [
      { name: '新华区', lng: 113.29, lat: 33.74 }, { name: '卫东区', lng: 113.34, lat: 33.73 },
    ] },
    { name: '焦作市', lng: 113.25, lat: 35.22, districts: [
      { name: '解放区', lng: 113.23, lat: 35.24 }, { name: '山阳区', lng: 113.25, lat: 35.21 },
    ] },
    { name: '安阳市', lng: 114.39, lat: 36.10, districts: [
      { name: '文峰区', lng: 114.36, lat: 36.09 }, { name: '北关区', lng: 114.35, lat: 36.11 },
    ] },
    { name: '许昌市', lng: 113.85, lat: 34.04, districts: [
      { name: '魏都区', lng: 113.82, lat: 34.03 }, { name: '建安区', lng: 113.84, lat: 34.10 },
    ] },
    { name: '驻马店市', lng: 114.03, lat: 32.98, districts: [
      { name: '驿城区', lng: 114.02, lat: 32.97 },
    ] },
  ] },
  { name: '河北', cities: [
    { name: '石家庄市', lng: 114.50, lat: 38.05, districts: [
      { name: '长安区', lng: 114.53, lat: 38.04 }, { name: '桥西区', lng: 114.47, lat: 38.03 },
      { name: '新华区', lng: 114.46, lat: 38.05 }, { name: '裕华区', lng: 114.53, lat: 38.01 },
    ] },
    { name: '唐山市', lng: 118.18, lat: 39.63, districts: [
      { name: '路南区', lng: 118.18, lat: 39.62 }, { name: '路北区', lng: 118.20, lat: 39.62 },
    ] },
    { name: '保定市', lng: 115.47, lat: 38.87, districts: [
      { name: '竞秀区', lng: 115.45, lat: 38.88 }, { name: '莲池区', lng: 115.52, lat: 38.88 },
    ] },
    { name: '秦皇岛市', lng: 119.60, lat: 39.93, districts: [
      { name: '海港区', lng: 119.61, lat: 39.94 }, { name: '山海关区', lng: 119.78, lat: 40.00 },
      { name: '北戴河区', lng: 119.48, lat: 39.83 },
    ] },
    { name: '邯郸市', lng: 114.54, lat: 36.63, districts: [
      { name: '丛台区', lng: 114.49, lat: 36.62 }, { name: '邯山区', lng: 114.48, lat: 36.60 },
    ] },
    { name: '邢台市', lng: 114.51, lat: 37.07, districts: [
      { name: '襄都区', lng: 114.51, lat: 37.07 }, { name: '信都区', lng: 114.48, lat: 37.06 },
    ] },
    { name: '张家口市', lng: 114.88, lat: 40.82, districts: [
      { name: '桥东区', lng: 114.89, lat: 40.79 }, { name: '桥西区', lng: 114.87, lat: 40.82 },
    ] },
    { name: '承德市', lng: 117.94, lat: 40.95, districts: [
      { name: '双桥区', lng: 117.94, lat: 40.98 },
    ] },
    { name: '沧州市', lng: 116.86, lat: 38.30, districts: [
      { name: '运河区', lng: 116.85, lat: 38.32 }, { name: '新华区', lng: 116.87, lat: 38.32 },
    ] },
    { name: '廊坊市', lng: 116.70, lat: 39.52, districts: [
      { name: '广阳区', lng: 116.71, lat: 39.52 }, { name: '安次区', lng: 116.70, lat: 39.50 },
    ] },
    { name: '衡水市', lng: 115.67, lat: 37.74, districts: [
      { name: '桃城区', lng: 115.67, lat: 37.73 },
    ] },
  ] },
  { name: '福建', cities: [
    { name: '福州市', lng: 119.30, lat: 26.08, districts: [
      { name: '鼓楼区', lng: 119.30, lat: 26.08 }, { name: '台江区', lng: 119.31, lat: 26.06 },
      { name: '仓山区', lng: 119.32, lat: 26.05 }, { name: '马尾区', lng: 119.46, lat: 25.99 },
      { name: '晋安区', lng: 119.33, lat: 26.08 }, { name: '长乐区', lng: 119.52, lat: 25.96 },
    ] },
    { name: '厦门市', lng: 118.10, lat: 24.46, districts: [
      { name: '思明区', lng: 118.08, lat: 24.45 }, { name: '海沧区', lng: 118.03, lat: 24.48 },
      { name: '湖里区', lng: 118.15, lat: 24.51 }, { name: '集美区', lng: 118.10, lat: 24.58 },
      { name: '同安区', lng: 118.15, lat: 24.72 }, { name: '翔安区', lng: 118.25, lat: 24.62 },
    ] },
    { name: '泉州市', lng: 118.68, lat: 24.88, districts: [
      { name: '鲤城区', lng: 118.60, lat: 24.90 }, { name: '丰泽区', lng: 118.61, lat: 24.89 },
      { name: '洛江区', lng: 118.67, lat: 24.94 }, { name: '泉港区', lng: 118.92, lat: 25.12 },
    ] },
    { name: '漳州市', lng: 117.65, lat: 24.51, districts: [
      { name: '芗城区', lng: 117.65, lat: 24.52 }, { name: '龙文区', lng: 117.71, lat: 24.50 },
    ] },
    { name: '莆田市', lng: 119.01, lat: 25.43, districts: [
      { name: '城厢区', lng: 118.99, lat: 25.42 }, { name: '涵江区', lng: 119.12, lat: 25.46 },
    ] },
    { name: '龙岩市', lng: 117.03, lat: 25.08, districts: [
      { name: '新罗区', lng: 117.04, lat: 25.10 }, { name: '永定区', lng: 116.73, lat: 24.72 },
    ] },
    { name: '三明市', lng: 117.64, lat: 26.27, districts: [
      { name: '梅列区', lng: 117.65, lat: 26.27 }, { name: '三元区', lng: 117.61, lat: 26.24 },
    ] },
    { name: '南平市', lng: 118.18, lat: 27.34, districts: [
      { name: '延平区', lng: 118.18, lat: 26.64 }, { name: '建阳区', lng: 118.12, lat: 27.33 },
    ] },
    { name: '宁德市', lng: 119.52, lat: 26.66, districts: [
      { name: '蕉城区', lng: 119.53, lat: 26.66 },
    ] },
  ] },
  { name: '湖南', cities: [
    { name: '长沙市', lng: 112.94, lat: 28.23, districts: [
      { name: '芙蓉区', lng: 113.03, lat: 28.18 }, { name: '天心区', lng: 112.99, lat: 28.11 },
      { name: '岳麓区', lng: 112.93, lat: 28.23 }, { name: '开福区', lng: 112.99, lat: 28.26 },
      { name: '雨花区', lng: 113.04, lat: 28.14 }, { name: '望城区', lng: 112.82, lat: 28.35 },
    ] },
    { name: '株洲市', lng: 113.13, lat: 27.83, districts: [
      { name: '天元区', lng: 113.13, lat: 27.86 }, { name: '荷塘区', lng: 113.17, lat: 27.86 },
    ] },
    { name: '湘潭市', lng: 112.94, lat: 27.83, districts: [
      { name: '雨湖区', lng: 112.91, lat: 27.87 }, { name: '岳塘区', lng: 112.97, lat: 27.87 },
    ] },
    { name: '衡阳市', lng: 112.57, lat: 26.90, districts: [
      { name: '雁峰区', lng: 112.62, lat: 26.89 }, { name: '珠晖区', lng: 112.62, lat: 26.90 },
    ] },
    { name: '岳阳市', lng: 113.13, lat: 29.37, districts: [
      { name: '岳阳楼区', lng: 113.13, lat: 29.37 }, { name: '君山区', lng: 113.00, lat: 29.46 },
    ] },
    { name: '邵阳市', lng: 111.47, lat: 27.24, districts: [
      { name: '双清区', lng: 111.50, lat: 27.23 }, { name: '大祥区', lng: 111.45, lat: 27.24 },
    ] },
    { name: '常德市', lng: 111.69, lat: 29.04, districts: [
      { name: '武陵区', lng: 111.69, lat: 29.03 }, { name: '鼎城区', lng: 111.68, lat: 29.02 },
    ] },
    { name: '益阳市', lng: 112.36, lat: 28.57, districts: [
      { name: '赫山区', lng: 112.37, lat: 28.57 }, { name: '资阳区', lng: 112.32, lat: 28.59 },
    ] },
    { name: '娄底市', lng: 112.01, lat: 27.73, districts: [
      { name: '娄星区', lng: 112.00, lat: 27.73 },
    ] },
    { name: '怀化市', lng: 110.00, lat: 27.55, districts: [
      { name: '鹤城区', lng: 110.01, lat: 27.55 },
    ] },
    { name: '永州市', lng: 111.62, lat: 26.42, districts: [
      { name: '零陵区', lng: 111.62, lat: 26.22 }, { name: '冷水滩区', lng: 111.59, lat: 26.46 },
    ] },
    { name: '郴州市', lng: 113.03, lat: 25.79, districts: [
      { name: '北湖区', lng: 113.01, lat: 25.78 },
    ] },
    { name: '张家界市', lng: 110.48, lat: 29.13, districts: [
      { name: '永定区', lng: 110.48, lat: 29.13 }, { name: '武陵源区', lng: 110.55, lat: 29.35 },
    ] },
  ] },
  { name: '辽宁', cities: [
    { name: '沈阳市', lng: 123.43, lat: 41.80, districts: [
      { name: '和平区', lng: 123.42, lat: 41.79 }, { name: '沈河区', lng: 123.46, lat: 41.80 },
      { name: '大东区', lng: 123.47, lat: 41.81 }, { name: '皇姑区', lng: 123.43, lat: 41.82 },
      { name: '铁西区', lng: 123.38, lat: 41.80 }, { name: '浑南区', lng: 123.46, lat: 41.72 },
      { name: '于洪区', lng: 123.30, lat: 41.82 },
    ] },
    { name: '大连市', lng: 121.62, lat: 38.92, districts: [
      { name: '中山区', lng: 121.65, lat: 38.92 }, { name: '西岗区', lng: 121.62, lat: 38.92 },
      { name: '沙河口区', lng: 121.59, lat: 38.91 }, { name: '甘井子区', lng: 121.57, lat: 38.95 },
      { name: '旅顺口区', lng: 121.27, lat: 38.85 }, { name: '金州区', lng: 121.79, lat: 39.05 },
    ] },
    { name: '鞍山市', lng: 122.99, lat: 41.11, districts: [
      { name: '铁东区', lng: 123.00, lat: 41.09 }, { name: '铁西区', lng: 122.97, lat: 41.12 },
    ] },
    { name: '抚顺市', lng: 123.92, lat: 41.88, districts: [
      { name: '顺城区', lng: 123.93, lat: 41.88 }, { name: '新抚区', lng: 123.91, lat: 41.86 },
    ] },
    { name: '本溪市', lng: 123.77, lat: 41.30, districts: [
      { name: '平山区', lng: 123.77, lat: 41.30 }, { name: '溪湖区', lng: 123.76, lat: 41.33 },
    ] },
    { name: '丹东市', lng: 124.39, lat: 40.12, districts: [
      { name: '振兴区', lng: 124.36, lat: 40.10 }, { name: '元宝区', lng: 124.40, lat: 40.14 },
    ] },
    { name: '锦州市', lng: 121.13, lat: 41.10, districts: [
      { name: '古塔区', lng: 121.13, lat: 41.12 }, { name: '凌河区', lng: 121.15, lat: 41.11 },
    ] },
    { name: '营口市', lng: 122.23, lat: 40.67, districts: [
      { name: '站前区', lng: 122.26, lat: 40.68 }, { name: '西市区', lng: 122.21, lat: 40.67 },
    ] },
  ] },
  { name: '吉林', cities: [
    { name: '长春市', lng: 125.32, lat: 43.82, districts: [
      { name: '南关区', lng: 125.35, lat: 43.86 }, { name: '宽城区', lng: 125.33, lat: 43.90 },
      { name: '朝阳区', lng: 125.29, lat: 43.83 }, { name: '二道区', lng: 125.37, lat: 43.87 },
      { name: '绿园区', lng: 125.26, lat: 43.88 }, { name: '双阳区', lng: 125.66, lat: 43.53 },
    ] },
    { name: '吉林市', lng: 126.55, lat: 43.84, districts: [
      { name: '昌邑区', lng: 126.57, lat: 43.88 }, { name: '龙潭区', lng: 126.56, lat: 43.91 },
      { name: '船营区', lng: 126.54, lat: 43.83 }, { name: '丰满区', lng: 126.56, lat: 43.82 },
    ] },
    { name: '四平市', lng: 124.35, lat: 43.17, districts: [
      { name: '铁西区', lng: 124.35, lat: 43.15 }, { name: '铁东区', lng: 124.41, lat: 43.16 },
    ] },
    { name: '延边朝鲜族自治州', lng: 129.51, lat: 42.89, districts: [
      { name: '延吉市', lng: 129.51, lat: 42.89 }, { name: '图们市', lng: 129.84, lat: 42.97 },
      { name: '敦化市', lng: 128.23, lat: 43.37 }, { name: '珲春市', lng: 130.36, lat: 42.87 },
    ] },
  ] },
  { name: '黑龙江', cities: [
    { name: '哈尔滨市', lng: 126.64, lat: 45.75, districts: [
      { name: '道里区', lng: 126.62, lat: 45.76 }, { name: '南岗区', lng: 126.67, lat: 45.76 },
      { name: '道外区', lng: 126.65, lat: 45.79 }, { name: '香坊区', lng: 126.68, lat: 45.72 },
      { name: '松北区', lng: 126.56, lat: 45.81 }, { name: '平房区', lng: 126.64, lat: 45.60 },
      { name: '呼兰区', lng: 126.59, lat: 45.89 }, { name: '阿城区', lng: 126.97, lat: 45.55 },
    ] },
    { name: '齐齐哈尔市', lng: 123.95, lat: 47.35, districts: [
      { name: '龙沙区', lng: 123.96, lat: 47.32 }, { name: '铁锋区', lng: 123.98, lat: 47.34 },
    ] },
    { name: '大庆市', lng: 125.11, lat: 46.59, districts: [
      { name: '萨尔图区', lng: 125.09, lat: 46.59 }, { name: '龙凤区', lng: 125.12, lat: 46.53 },
      { name: '让胡路区', lng: 124.87, lat: 46.65 }, { name: '红岗区', lng: 124.88, lat: 46.40 },
    ] },
    { name: '牡丹江市', lng: 129.63, lat: 44.58, districts: [
      { name: '爱民区', lng: 129.59, lat: 44.60 }, { name: '东安区', lng: 129.63, lat: 44.58 },
    ] },
    { name: '佳木斯市', lng: 130.36, lat: 46.80, districts: [
      { name: '向阳区', lng: 130.37, lat: 46.80 }, { name: '前进区', lng: 130.38, lat: 46.81 },
    ] },
  ] },
  { name: '安徽', cities: [
    { name: '合肥市', lng: 117.27, lat: 31.86, districts: [
      { name: '瑶海区', lng: 117.31, lat: 31.86 }, { name: '庐阳区', lng: 117.26, lat: 31.88 },
      { name: '蜀山区', lng: 117.26, lat: 31.85 }, { name: '包河区', lng: 117.31, lat: 31.80 },
    ] },
    { name: '芜湖市', lng: 118.38, lat: 31.33, districts: [
      { name: '镜湖区', lng: 118.39, lat: 31.34 }, { name: '鸠江区', lng: 118.39, lat: 31.37 },
    ] },
    { name: '蚌埠市', lng: 117.39, lat: 32.94, districts: [
      { name: '龙子湖区', lng: 117.41, lat: 32.94 }, { name: '蚌山区', lng: 117.36, lat: 32.94 },
    ] },
    { name: '淮南市', lng: 117.02, lat: 32.63, districts: [
      { name: '田家庵区', lng: 117.02, lat: 32.65 }, { name: '大通区', lng: 117.05, lat: 32.63 },
    ] },
    { name: '马鞍山市', lng: 118.51, lat: 31.69, districts: [
      { name: '花山区', lng: 118.51, lat: 31.72 }, { name: '雨山区', lng: 118.50, lat: 31.68 },
    ] },
    { name: '安庆市', lng: 117.05, lat: 30.54, districts: [
      { name: '迎江区', lng: 117.05, lat: 30.51 }, { name: '大观区', lng: 117.03, lat: 30.55 },
    ] },
    { name: '阜阳市', lng: 115.82, lat: 32.90, districts: [
      { name: '颍州区', lng: 115.81, lat: 32.88 }, { name: '颍东区', lng: 115.86, lat: 32.90 },
    ] },
    { name: '宿州市', lng: 116.98, lat: 33.65, districts: [
      { name: '埇桥区', lng: 116.98, lat: 33.64 },
    ] },
    { name: '滁州市', lng: 118.32, lat: 32.30, districts: [
      { name: '琅琊区', lng: 118.31, lat: 32.30 }, { name: '南谯区', lng: 118.31, lat: 32.31 },
    ] },
    { name: '黄山市', lng: 118.34, lat: 29.72, districts: [
      { name: '屯溪区', lng: 118.34, lat: 29.71 }, { name: '黄山区', lng: 118.14, lat: 30.27 },
    ] },
  ] },
  { name: '江西', cities: [
    { name: '南昌市', lng: 115.89, lat: 28.68, districts: [
      { name: '东湖区', lng: 115.89, lat: 28.69 }, { name: '西湖区', lng: 115.88, lat: 28.66 },
      { name: '青云谱区', lng: 115.91, lat: 28.63 }, { name: '青山湖区', lng: 115.96, lat: 28.68 },
    ] },
    { name: '九江市', lng: 115.99, lat: 29.72, districts: [
      { name: '浔阳区', lng: 115.99, lat: 29.74 }, { name: '濂溪区', lng: 115.98, lat: 29.67 },
    ] },
    { name: '赣州市', lng: 114.93, lat: 25.83, districts: [
      { name: '章贡区', lng: 114.93, lat: 25.83 }, { name: '南康区', lng: 114.76, lat: 25.66 },
    ] },
    { name: '吉安市', lng: 114.99, lat: 27.11, districts: [
      { name: '吉州区', lng: 114.99, lat: 27.11 }, { name: '青原区', lng: 115.02, lat: 27.11 },
    ] },
    { name: '上饶市', lng: 117.97, lat: 28.45, districts: [
      { name: '信州区', lng: 117.97, lat: 28.43 }, { name: '广丰区', lng: 118.19, lat: 28.44 },
    ] },
    { name: '宜春市', lng: 114.39, lat: 27.82, districts: [
      { name: '袁州区', lng: 114.38, lat: 27.80 },
    ] },
    { name: '抚州市', lng: 116.36, lat: 27.95, districts: [
      { name: '临川区', lng: 116.36, lat: 27.98 },
    ] },
    { name: '景德镇市', lng: 117.18, lat: 29.27, districts: [
      { name: '珠山区', lng: 117.20, lat: 29.30 }, { name: '昌江区', lng: 117.18, lat: 29.27 },
    ] },
  ] },
  { name: '云南', cities: [
    { name: '昆明市', lng: 102.72, lat: 25.04, districts: [
      { name: '五华区', lng: 102.71, lat: 25.04 }, { name: '盘龙区', lng: 102.72, lat: 25.04 },
      { name: '官渡区', lng: 102.74, lat: 25.02 }, { name: '西山区', lng: 102.66, lat: 25.04 },
      { name: '呈贡区', lng: 102.82, lat: 24.89 },
    ] },
    { name: '大理白族自治州', lng: 100.23, lat: 25.60, districts: [
      { name: '大理市', lng: 100.23, lat: 25.59 },
    ] },
    { name: '丽江市', lng: 100.23, lat: 26.86, districts: [
      { name: '古城区', lng: 100.24, lat: 26.88 }, { name: '玉龙县', lng: 100.24, lat: 26.82 },
    ] },
    { name: '曲靖市', lng: 103.80, lat: 25.49, districts: [
      { name: '麒麟区', lng: 103.80, lat: 25.50 },
    ] },
    { name: '玉溪市', lng: 102.54, lat: 24.35, districts: [
      { name: '红塔区', lng: 102.54, lat: 24.35 },
    ] },
    { name: '西双版纳傣族自治州', lng: 100.80, lat: 22.02, districts: [
      { name: '景洪市', lng: 100.80, lat: 22.02 },
    ] },
  ] },
  { name: '贵州', cities: [
    { name: '贵阳市', lng: 106.63, lat: 26.65, districts: [
      { name: '南明区', lng: 106.71, lat: 26.57 }, { name: '云岩区', lng: 106.72, lat: 26.61 },
      { name: '花溪区', lng: 106.67, lat: 26.42 }, { name: '乌当区', lng: 106.75, lat: 26.63 },
      { name: '白云区', lng: 106.62, lat: 26.68 }, { name: '观山湖区', lng: 106.63, lat: 26.61 },
    ] },
    { name: '遵义市', lng: 106.92, lat: 27.73, districts: [
      { name: '红花岗区', lng: 106.89, lat: 27.65 }, { name: '汇川区', lng: 106.93, lat: 27.75 },
    ] },
    { name: '六盘水市', lng: 104.83, lat: 26.59, districts: [
      { name: '钟山区', lng: 104.86, lat: 26.58 },
    ] },
    { name: '毕节市', lng: 105.29, lat: 27.30, districts: [
      { name: '七星关区', lng: 105.28, lat: 27.30 },
    ] },
  ] },
  { name: '广西', cities: [
    { name: '南宁市', lng: 108.37, lat: 22.82, districts: [
      { name: '兴宁区', lng: 108.37, lat: 22.85 }, { name: '青秀区', lng: 108.49, lat: 22.78 },
      { name: '江南区', lng: 108.27, lat: 22.78 }, { name: '西乡塘区', lng: 108.31, lat: 22.83 },
      { name: '良庆区', lng: 108.41, lat: 22.75 }, { name: '邕宁区', lng: 108.49, lat: 22.76 },
    ] },
    { name: '桂林市', lng: 110.29, lat: 25.27, districts: [
      { name: '秀峰区', lng: 110.26, lat: 25.27 }, { name: '叠彩区', lng: 110.30, lat: 25.31 },
      { name: '象山区', lng: 110.28, lat: 25.26 }, { name: '七星区', lng: 110.32, lat: 25.25 },
    ] },
    { name: '柳州市', lng: 109.42, lat: 24.33, districts: [
      { name: '城中区', lng: 109.42, lat: 24.33 }, { name: '鱼峰区', lng: 109.45, lat: 24.32 },
      { name: '柳南区', lng: 109.40, lat: 24.34 }, { name: '柳北区', lng: 109.40, lat: 24.36 },
    ] },
    { name: '北海市', lng: 109.12, lat: 21.48, districts: [
      { name: '海城区', lng: 109.12, lat: 21.47 }, { name: '银海区', lng: 109.14, lat: 21.48 },
    ] },
  ] },
  { name: '海南', cities: [
    { name: '海口市', lng: 110.32, lat: 20.03, districts: [
      { name: '龙华区', lng: 110.30, lat: 20.03 }, { name: '秀英区', lng: 110.29, lat: 20.01 },
      { name: '美兰区', lng: 110.37, lat: 20.03 }, { name: '琼山区', lng: 110.35, lat: 20.00 },
    ] },
    { name: '三亚市', lng: 109.51, lat: 18.25, districts: [
      { name: '吉阳区', lng: 109.53, lat: 18.26 }, { name: '天涯区', lng: 109.49, lat: 18.25 },
      { name: '海棠区', lng: 109.75, lat: 18.31 }, { name: '崖州区', lng: 109.17, lat: 18.35 },
    ] },
  ] },
  { name: '山西', cities: [
    { name: '太原市', lng: 112.55, lat: 37.87, districts: [
      { name: '小店区', lng: 112.57, lat: 37.74 }, { name: '迎泽区', lng: 112.56, lat: 37.86 },
      { name: '杏花岭区', lng: 112.56, lat: 37.89 }, { name: '尖草坪区', lng: 112.49, lat: 37.94 },
      { name: '万柏林区', lng: 112.52, lat: 37.86 }, { name: '晋源区', lng: 112.48, lat: 37.72 },
    ] },
    { name: '大同市', lng: 113.30, lat: 40.08, districts: [
      { name: '平城区', lng: 113.30, lat: 40.08 }, { name: '云冈区', lng: 113.14, lat: 40.05 },
    ] },
    { name: '临汾市', lng: 111.52, lat: 36.08, districts: [
      { name: '尧都区', lng: 111.58, lat: 36.08 },
    ] },
    { name: '运城市', lng: 111.00, lat: 35.03, districts: [
      { name: '盐湖区', lng: 110.99, lat: 35.02 },
    ] },
    { name: '晋中市', lng: 112.74, lat: 37.69, districts: [
      { name: '榆次区', lng: 112.71, lat: 37.70 },
    ] },
  ] },
  { name: '甘肃', cities: [
    { name: '兰州市', lng: 103.83, lat: 36.06, districts: [
      { name: '城关区', lng: 103.83, lat: 36.06 }, { name: '七里河区', lng: 103.79, lat: 36.07 },
      { name: '西固区', lng: 103.63, lat: 36.09 }, { name: '安宁区', lng: 103.72, lat: 36.10 },
    ] },
    { name: '天水市', lng: 105.73, lat: 34.58, districts: [
      { name: '秦州区', lng: 105.72, lat: 34.58 }, { name: '麦积区', lng: 105.89, lat: 34.57 },
    ] },
    { name: '酒泉市', lng: 98.51, lat: 39.74, districts: [
      { name: '肃州区', lng: 98.51, lat: 39.74 },
    ] },
    { name: '嘉峪关市', lng: 98.28, lat: 39.80, districts: [
      { name: '嘉峪关市', lng: 98.28, lat: 39.80 },
    ] },
  ] },
  { name: '新疆', cities: [
    { name: '乌鲁木齐市', lng: 87.62, lat: 43.82, districts: [
      { name: '天山区', lng: 87.63, lat: 43.79 }, { name: '沙依巴克区', lng: 87.60, lat: 43.80 },
      { name: '新市区', lng: 87.57, lat: 43.84 }, { name: '水磨沟区', lng: 87.64, lat: 43.83 },
      { name: '头屯河区', lng: 87.29, lat: 43.86 }, { name: '达坂城区', lng: 88.31, lat: 43.36 },
    ] },
    { name: '克拉玛依市', lng: 84.89, lat: 45.58, districts: [
      { name: '克拉玛依区', lng: 84.87, lat: 45.59 },
    ] },
    { name: '吐鲁番市', lng: 89.19, lat: 42.95, districts: [
      { name: '高昌区', lng: 89.20, lat: 42.95 },
    ] },
    { name: '哈密市', lng: 93.52, lat: 42.83, districts: [
      { name: '伊州区', lng: 93.51, lat: 42.83 },
    ] },
    { name: '喀什地区', lng: 75.99, lat: 39.47, districts: [
      { name: '喀什市', lng: 75.99, lat: 39.47 },
    ] },
    { name: '伊犁哈萨克自治州', lng: 81.33, lat: 43.92, districts: [
      { name: '伊宁市', lng: 81.33, lat: 43.92 },
    ] },
  ] },
  { name: '西藏', cities: [
    { name: '拉萨市', lng: 91.11, lat: 29.65, districts: [
      { name: '城关区', lng: 91.14, lat: 29.66 }, { name: '堆龙德庆区', lng: 91.00, lat: 29.65 },
    ] },
    { name: '日喀则市', lng: 88.88, lat: 29.27, districts: [
      { name: '桑珠孜区', lng: 88.88, lat: 29.27 },
    ] },
    { name: '林芝市', lng: 94.36, lat: 29.65, districts: [
      { name: '巴宜区', lng: 94.36, lat: 29.65 },
    ] },
  ] },
  { name: '内蒙古', cities: [
    { name: '呼和浩特市', lng: 111.73, lat: 40.84, districts: [
      { name: '新城区', lng: 111.66, lat: 40.86 }, { name: '回民区', lng: 111.62, lat: 40.81 },
      { name: '玉泉区', lng: 111.67, lat: 40.75 }, { name: '赛罕区', lng: 111.70, lat: 40.79 },
    ] },
    { name: '包头市', lng: 109.84, lat: 40.66, districts: [
      { name: '昆都仑区', lng: 109.82, lat: 40.64 }, { name: '青山区', lng: 109.88, lat: 40.64 },
      { name: '东河区', lng: 110.00, lat: 40.58 }, { name: '九原区', lng: 109.97, lat: 40.61 },
    ] },
    { name: '鄂尔多斯市', lng: 109.78, lat: 39.61, districts: [
      { name: '东胜区', lng: 109.96, lat: 39.82 }, { name: '康巴什区', lng: 109.78, lat: 39.61 },
    ] },
    { name: '赤峰市', lng: 118.89, lat: 42.26, districts: [
      { name: '红山区', lng: 118.95, lat: 42.24 }, { name: '松山区', lng: 118.94, lat: 42.27 },
    ] },
  ] },
  { name: '宁夏', cities: [
    { name: '银川市', lng: 106.23, lat: 38.49, districts: [
      { name: '兴庆区', lng: 106.29, lat: 38.47 }, { name: '西夏区', lng: 106.15, lat: 38.50 },
      { name: '金凤区', lng: 106.24, lat: 38.47 },
    ] },
    { name: '石嘴山市', lng: 106.38, lat: 39.02, districts: [
      { name: '大武口区', lng: 106.37, lat: 39.02 }, { name: '惠农区', lng: 106.78, lat: 39.25 },
    ] },
    { name: '吴忠市', lng: 106.19, lat: 37.99, districts: [
      { name: '利通区', lng: 106.20, lat: 37.99 }, { name: '红寺堡区', lng: 106.06, lat: 37.42 },
    ] },
  ] },
  { name: '青海', cities: [
    { name: '西宁市', lng: 101.78, lat: 36.62, districts: [
      { name: '城东区', lng: 101.81, lat: 36.60 }, { name: '城中区', lng: 101.78, lat: 36.62 },
      { name: '城西区', lng: 101.76, lat: 36.63 }, { name: '城北区', lng: 101.77, lat: 36.65 },
    ] },
    { name: '海东市', lng: 102.10, lat: 36.51, districts: [
      { name: '乐都区', lng: 102.40, lat: 36.48 }, { name: '平安区', lng: 102.11, lat: 36.50 },
    ] },
    { name: '海西蒙古族藏族自治州', lng: 97.37, lat: 37.37, districts: [
      { name: '德令哈市', lng: 97.37, lat: 37.37 }, { name: '格尔木市', lng: 94.90, lat: 36.42 },
    ] },
  ] },
  { name: '香港', cities: [
    { name: '香港特别行政区', lng: 114.17, lat: 22.28, districts: [
      { name: '中西区', lng: 114.15, lat: 22.28 }, { name: '湾仔区', lng: 114.18, lat: 22.28 },
      { name: '东区', lng: 114.22, lat: 22.28 }, { name: '南区', lng: 114.17, lat: 22.25 },
      { name: '油尖旺区', lng: 114.17, lat: 22.31 }, { name: '深水埗区', lng: 114.16, lat: 22.33 },
      { name: '九龙城区', lng: 114.19, lat: 22.32 }, { name: '观塘区', lng: 114.22, lat: 22.31 },
      { name: '黄大仙区', lng: 114.20, lat: 22.34 }, { name: '沙田区', lng: 114.19, lat: 22.38 },
      { name: '荃湾区', lng: 114.12, lat: 22.37 }, { name: '屯门区', lng: 113.97, lat: 22.39 },
    ] },
  ] },
  { name: '澳门', cities: [
    { name: '澳门特别行政区', lng: 113.55, lat: 22.19, districts: [
      { name: '花地玛堂区', lng: 113.56, lat: 22.21 }, { name: '圣安多尼堂区', lng: 113.55, lat: 22.19 },
      { name: '大堂区', lng: 113.55, lat: 22.19 }, { name: '望德堂区', lng: 113.55, lat: 22.20 },
      { name: '风顺堂区', lng: 113.54, lat: 22.19 }, { name: '氹仔', lng: 113.56, lat: 22.16 },
      { name: '路环', lng: 113.56, lat: 22.12 },
    ] },
  ] },
  { name: '台湾', cities: [
    { name: '台北市', lng: 121.52, lat: 25.03, districts: [
      { name: '中正区', lng: 121.52, lat: 25.03 }, { name: '大同区', lng: 121.52, lat: 25.06 },
      { name: '中山区', lng: 121.54, lat: 25.07 }, { name: '松山区', lng: 121.56, lat: 25.05 },
      { name: '大安区', lng: 121.54, lat: 25.03 }, { name: '信义区', lng: 121.57, lat: 25.03 },
    ] },
    { name: '高雄市', lng: 120.31, lat: 22.62, districts: [
      { name: '新兴区', lng: 120.31, lat: 22.62 }, { name: '前金区', lng: 120.29, lat: 22.63 },
      { name: '苓雅区', lng: 120.31, lat: 22.62 }, { name: '盐埕区', lng: 120.28, lat: 22.63 },
    ] },
    { name: '台中市', lng: 120.68, lat: 24.13, districts: [
      { name: '中区', lng: 120.68, lat: 24.14 }, { name: '北区', lng: 120.68, lat: 24.16 },
    ] },
    { name: '台南市', lng: 120.21, lat: 23.00, districts: [
      { name: '中西区', lng: 120.20, lat: 22.99 }, { name: '东区', lng: 120.22, lat: 22.98 },
    ] },
  ] },
];

function getProvinces() {
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
    fullName: district ? `${province.name}·${city.name}·${district.name}` : `${province.name}·${city.name}`,
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
