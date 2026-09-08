export const CALIBER = {
  self: {
    label: '自营运输收入',
    factor: 1,
  },
  agent: {
    label: '含代理及期租收入',
    factor: 1.12,
  },
  gross: {
    label: '含增值税全口径',
    factor: 1.09,
  },
};
export const SHIP_TYPE = {
  all: {
    label: '全部',
  },
  river: {
    label: '江船',
  },
  sea: {
    label: '海轮',
  },
};
export const CATS = [
  {
    k: 'coal',
    name: '煤炭',
  },
  {
    k: 'ore',
    name: '铁矿石',
  },
  {
    k: 'grain',
    name: '粮食',
  },
  {
    k: 'sand',
    name: '矿建材料',
  },
  {
    k: 'chem',
    name: '化肥/化工品',
  },
  {
    k: 'oth',
    name: '其他',
  },
];
export const UNITS = {
  yanj: {
    name: '长江航运 · 沿江干散货',
    price: {
      coal: 52,
      ore: 58,
      grain: 72,
      sand: 44,
      chem: 92,
      oth: 90,
    },
    mix: {
      coal: 0.5,
      ore: 0.1,
      grain: 0.12,
      sand: 0.1,
      chem: 0.06,
      oth: 0.12,
    },
    yoy: {
      coal: 14,
      ore: 2,
      grain: 3,
      sand: 18,
      chem: -1,
      oth: -6,
    },
    revMo: 2.93,
    volMo: 477,
    baseYoy: 9.4,
    volYoy: 6.8,
    margin: 8.4,
    ships: 21,
    seg: [
      ['长江下游（沪苏通—武汉）', 0.34],
      ['长江中游（武汉—宜昌）', 0.22],
      ['长江上游（重庆段）', 0.16],
      ['干支直达 / 进出江', 0.18],
      ['短驳 / 港内倒驳', 0.1],
    ],
  },
  hai: {
    name: '长航海运 · 沿海近洋',
    price: {
      coal: 118,
      ore: 128,
      grain: 142,
      sand: 165,
      chem: 152,
      oth: 150,
    },
    mix: {
      coal: 0.2,
      ore: 0.46,
      grain: 0.06,
      sand: 0.02,
      chem: 0.05,
      oth: 0.21,
    },
    yoy: {
      coal: 10,
      ore: -4,
      grain: 9,
      sand: 22,
      chem: 5,
      oth: 7,
    },
    revMo: 1.84,
    volMo: 138,
    baseYoy: 18.2,
    volYoy: 12.6,
    margin: 16.9,
    ships: 7,
    seg: [
      ['沿海 · 环渤海—华南', 0.34],
      ['沿海 · 华东内贸', 0.22],
      ['外贸近洋（东北亚/东南亚）', 0.28],
      ['内河转水 / 联运', 0.16],
    ],
  },
};
export const RENT = {
  revMo: 0.12,
  yoy: 3.2,
  name: '租入运力 · 期租收入',
};
export const FLEET_META = {
  yanj: {
    ships: 21,
    dwt: 0.85,
    opexDay: 0.9,
    oilDay: 0.55,
    cycle: 6.2,
    delay: 3.2,
  },
  hai: {
    ships: 7,
    dwt: 5.7,
    opexDay: 3.2,
    oilDay: 3.2,
    cycle: 12.5,
    delay: 6.4,
  },
};
export const UNIT_META = {
  all: {
    name: '全部单位（沿江 + 沿海）',
    ships: 28,
  },
  yanj: {
    name: '长江航运 · 沿江干散货',
    short: '沿江干散货',
    ships: 21,
  },
  hai: {
    name: '长航海运 · 沿海近洋',
    short: '沿海近洋',
    ships: 7,
  },
};
export const ORG_TREE = {
  k: 'root',
  name: '中国长航 · 干散货运输业务',
  children: [
    {
      k: 'g-yanj',
      name: '长江航运 · 沿江板块',
      short: '沿江板块',
      unit: 'yanj',
      children: [
        {
          k: 'yj-xia',
          name: '长江下游航运公司',
          w: 0.34,
        },
        {
          k: 'yj-zhong',
          name: '长江中游航运公司',
          w: 0.22,
        },
        {
          k: 'yj-shang',
          name: '长江上游航运公司',
          w: 0.16,
        },
        {
          k: 'yj-gz',
          name: '干支直达航运公司',
          w: 0.18,
        },
        {
          k: 'yj-db',
          name: '短驳 / 港内倒驳公司',
          w: 0.1,
        },
      ],
    },
    {
      k: 'g-hai',
      name: '长航海运 · 沿海板块',
      short: '沿海板块',
      unit: 'hai',
      children: [
        {
          k: 'h-hb',
          name: '沿海环渤海航运公司',
          w: 0.34,
        },
        {
          k: 'h-hd',
          name: '沿海华东航运公司',
          w: 0.22,
        },
        {
          k: 'h-wm',
          name: '外贸近洋航运公司',
          w: 0.28,
        },
        {
          k: 'h-nh',
          name: '内河转水航运公司',
          w: 0.16,
        },
      ],
    },
  ],
};
export const SHIPS = {
  yanj: ['长航801', '长航802', '长航803', '长江3021', '长鲸6号', '长航运8', '武航601', '渝航168'],
  hai: ['长航海6', '长航海7', '海旺9', '海盛1', '航盛8', '长海5'],
};
export const SORT_LABEL = {
  date: '完成日期',
  income: '收入（万元）',
  t: '货量（万吨）',
  price: '均价（元/吨）',
};
export const MET_DEFS = [
  {
    k: 'rev',
    n: '运输收入（含税）',
    u: '亿元',
    g: '规模总览',
    d: '含税口径下的运输业务收入合计，含租船期租收入',
  },
  {
    k: 'vol',
    n: '完成运量',
    u: '万吨',
    g: '规模总览',
    d: '统计周期内完成的货运总量',
  },
  {
    k: 'rent',
    n: '租船期租收入',
    u: '亿元',
    g: '规模总览',
    d: '租入运力对外期租收入，仅在全部单位范围内统计',
  },
  {
    k: 'fleet',
    n: '在营船舶数量',
    u: '艘',
    g: '规模总览',
    d: '当前统计范围内在营运运的船舶数量',
  },
  {
    k: 'dwt',
    n: '合计载重吨',
    u: '万吨',
    g: '规模总览',
    d: '在营运力合计载重吨，按船舶吨位汇总',
  },
  {
    k: 'price',
    n: '平均单吨运价',
    u: '元/吨',
    g: '单船效益',
    d: '运输收入 ÷ 完成运量，反映单位运量价格水平',
  },
  {
    k: 'margin',
    n: '单吨毛利（估算）',
    u: '元/吨',
    g: '单船效益',
    d: '单吨收入扣除估算变动成本后的毛利',
  },
  {
    k: 'tce',
    n: '日均TCE',
    u: '元/天',
    g: '单船效益',
    d: '单船日均等价期租租金 TCE，反映单船盈利水平',
  },
  {
    k: 'sMargin',
    n: '单船毛利',
    u: '万元/月',
    g: '单船效益',
    d: '单船月均毛利，收入扣除估算变动成本后按船数分摊',
  },
  {
    k: 'bRate',
    n: 'TCE保本率',
    u: '%',
    g: '单船效益',
    d: '保本TCE 占实际 TCE 比例，越低盈利安全垫越厚',
  },
  {
    k: 'opex',
    n: '日均OPEX',
    u: '万元/天',
    g: '成本费用',
    d: '单船日均经营成本 OPEX，含船员、维护、保险等',
  },
  {
    k: 'oil',
    n: '日均油耗',
    u: '吨/天',
    g: '成本费用',
    d: '船队日均燃油消耗合计',
  },
  {
    k: 'portFee',
    n: '港口费',
    u: '万元',
    g: '成本费用',
    d: '统计周期内港口使费与停泊费用合计',
  },
  {
    k: 'repairFee',
    n: '修保费',
    u: '万元',
    g: '成本费用',
    d: '统计周期内船舶修理与保险费用合计',
  },
  {
    k: 'util',
    n: '载重吨利用率',
    u: '%',
    g: '运营效率',
    d: '实际货载与运力供给之比，反映运力利用效率',
  },
  {
    k: 'cycle',
    n: '平均航次周期',
    u: '天',
    g: '运营效率',
    d: '单船完成一个航次的平均天数',
  },
  {
    k: 'delay',
    n: '在漂待时',
    u: '天',
    g: '运营效率',
    d: '船舶在港等泊与在漂待命的平均时长',
  },
];
export const MET_DEFAULT = {
  rev: 1,
  vol: 1,
  price: 1,
  margin: 1,
};
export const METRIC_META = {
  rev: '运输收入',
  vol: '完成运量',
  rent: '租船收入',
  fleet: '在营船舶',
  dwt: '载重吨',
  price: '单吨运价',
  margin: '单吨毛利',
  tce: '日均TCE',
  sMargin: '单船毛利',
  bRate: 'TCE保本率',
  opex: '日均OPEX',
  oil: '日均油耗',
  portFee: '港口费',
  repairFee: '修保费',
  util: '载重吨利用率',
  cycle: '航次周期',
  delay: '在漂待时',
};
export const ORG_LEAVES = ORG_TREE.children.flatMap((parent) =>
  parent.children.map((leaf) => ({ ...leaf, parent })),
);
export const ORG_ALLK = () => ORG_LEAVES.map((l) => l.k);
export const DEF_TPL = [
  {
    id: 'tpl-a',
    def: true,
    name: '1-8月累计 · 全部货类（全口径）',
    time: '2026-08-30 09:12',
    desc: '全口径收入总览：覆盖沿江与沿海全部货类、船型，跟踪收入、运量与均价。',
    p: {
      org: ORG_ALLK(),
      period: {
        y: 2026,
        m0: 8,
        m1: 8,
      },
      caliber: 'gross',
      ship: 'all',
      dims: ['unit', 'cargo'],
      metrics: {
        rev: true,
        vol: true,
        price: true,
        margin: true,
      },
      sortKey: 'date',
      sortDir: 'desc',
    },
  },
  {
    id: 'tpl-b',
    def: false,
    name: '沿江 · 上半年 · 煤炭',
    time: '2026-08-27 14:35',
    desc: '聚焦沿江干散货煤炭运输，跟踪运量、运价与收入表现。',
    p: {
      org: ['yj-xia', 'yj-zhong', 'yj-shang', 'yj-gz', 'yj-db'],
      period: {
        y: 2026,
        m0: 1,
        m1: 6,
      },
      caliber: 'self',
      ship: 'river',
      dims: ['unit', 'route'],
      metrics: {
        rev: true,
        vol: true,
        price: true,
        margin: false,
      },
      sortKey: 'income',
      sortDir: 'desc',
    },
  },
  {
    id: 'tpl-c',
    def: false,
    name: '沿海 · 2025全年 · 铁矿石',
    time: '2026-08-21 10:03',
    desc: '沿海近洋铁矿石年度运输表现，重点关注单吨运价与货量。',
    p: {
      org: ['h-hb', 'h-hd', 'h-wm', 'h-nh'],
      period: {
        y: 2025,
        m0: 1,
        m1: 12,
      },
      caliber: 'self',
      ship: 'sea',
      dims: ['month', 'cargo'],
      metrics: {
        rev: true,
        vol: true,
        price: true,
        margin: false,
      },
      sortKey: 't',
      sortDir: 'desc',
    },
  },
];
