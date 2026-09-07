import { ORG_LEAVES, ORG_TREE, UNITS, CALIBER, RENT, FLEET_META, CATS, SHIPS } from './catalog';
import type { QueryConfig, DetailRow } from './types';
export function PERIOD(p) {
  p = p || {
    y: 2026,
    m0: 1,
    m1: 12
  };
  var m = p.m1 - p.m0 + 1,
    label;
  if (p.m0 === 1 && p.m1 === 12) label = p.y + '年全年';else if (p.m0 === 1 && p.m1 === 6) label = p.y + '年上半年';else if (m === 3 && p.m1 % 3 === 0) label = p.y + '年Q' + p.m1 / 3;else if (m === 1) label = p.y + '年' + p.m0 + '月';else if (p.m0 === 1) label = p.y + '年1-' + p.m1 + '月';else label = p.y + '年' + p.m0 + '-' + p.m1 + '月';
  return {
    label: label,
    m: m,
    year: p.y,
    m0: p.m0,
    m1: p.m1
  };
}
export function sameP(a, b) {
  return !!a && !!b && a.y === b.y && a.m0 === b.m0 && a.m1 === b.m1;
}
export function r1(x) {
  return Math.round(x * 10) / 10;
}
export function r0(x) {
  return Math.round(x);
}
export function fmtAmt(v, amt, dec) {
  dec = dec === undefined ? 1 : dec;
  return (v * amt).toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: dec
  });
}
export function pad2(n) {
  return n < 10 ? '0' + n : '' + n;
}
const leafName = (k: string) => ORG_LEAVES.find(l => l.k===k)?.name || '';
const catOf = (k: string) => CATS.find(c => c.k===k);
export function createQueryEngine(state: QueryConfig) {
function orgSelArr() {
  return ORG_LEAVES.filter(function (l) {
    return state.orgSel[l.k];
  }).map(function (l) {
    return l.k;
  });
}
function orgUnits() {
  var s = {};
  ORG_LEAVES.forEach(function (l) {
    if (state.orgSel[l.k]) s[l.parent.unit] = 1;
  });
  return Object.keys(s);
}
function sumW(gk) {
  var s = 0;
  ORG_TREE.children.forEach(function (g) {
    if (g.k !== gk) return;
    g.children.forEach(function (c) {
      if (state.orgSel[c.k]) s += c.w;
    });
  });
  return s;
}
function orgHeadText() {
  var n = orgSelArr().length;
  if (n === 0 || n === ORG_LEAVES.length) return '全部单位';
  if (n === 1) return leafName(orgSelArr()[0]);
  return '已选 ' + n + ' 家单位';
}
function orgScopeText() {
  var n = orgSelArr().length;
  if (n === 0 || n === ORG_LEAVES.length) return '全部单位（沿江 + 沿海）';
  var names = [];
  ORG_TREE.children.forEach(function (g) {
    var cs = g.children.filter(function (c) {
      return state.orgSel[c.k];
    });
    if (cs.length === g.children.length) names.push(g.short);else cs.forEach(function (c) {
      names.push(c.name);
    });
  });
  return names.length > 2 ? names[0] + ' 等 ' + n + ' 家单位' : names.join('、');
}
function compute() {
  var p = PERIOD(state.period),
    all = orgUnits().length === 2,
    cargoAll = state.cargo === 'all';
  var cal = CALIBER[state.caliber].factor;
  function unitRev(u) {
    var r = u.revMo * p.m * cal;
    return cargoAll ? r : r * u.mix[state.cargo];
  }
  var parts = [],
    rentAmt = 0;
  var yw = sumW('g-yanj'),
    hw = sumW('g-hai');
  if (yw > 0) parts.push({
    key: 'yanj',
    u: UNITS.yanj,
    rev: unitRev(UNITS.yanj) * yw,
    w: yw
  });
  if (hw > 0) parts.push({
    key: 'hai',
    u: UNITS.hai,
    rev: unitRev(UNITS.hai) * hw,
    w: hw
  });
  if (!parts.length) {
    return {
      rev: 0,
      vol: 0,
      avgPrice: 0,
      margin: 0,
      yoyRev: 0,
      yoyVol: 0,
      yoyPrice: 0,
      yoyMargin: -1.4,
      rows: [],
      cargoAll: cargoAll,
      rent: 0,
      yanjShare: 0,
      haiShare: 0,
      haiRatio: 0,
      fleet: 0,
      dwt: 0,
      tce: 0,
      sMargin: 0,
      bRate: 0,
      opex: 0,
      oil: 0,
      portFee: 0,
      repairFee: 0,
      util: 0,
      cycle: 0,
      delay: 0
    };
  }
  if (all && cargoAll) rentAmt = RENT.revMo * p.m * cal;
  var rev = 0,
    vol = 0,
    revW = 0,
    revWP = 0;
  parts.forEach(function (pr) {
    rev += pr.rev;
    if (pr.rev <= 0) {
      pr.vol = 0;
      pr.price = 0;
      return;
    }
    var price = pr.u.price[state.cargo] || 0;
    if (cargoAll) {
      price = pr.rev * 10000 / (pr.u.volMo * p.m * cal * pr.w);
    }
    var v = cargoAll ? pr.u.volMo * p.m * cal * pr.w : pr.rev * 10000 / price;
    vol += v;
    pr.vol = v;
    pr.price = price;
    revW += pr.rev;
    revWP += pr.rev * price;
  });
  rev += rentAmt;
  var avgPrice = r1(revWP / revW),
    volOnly = vol;
  var yoyW = 0,
    volYo = 0,
    base = 0;
  parts.forEach(function (pr) {
    if (pr.rev <= 0) return;
    var y = cargoAll ? pr.u.baseYoy : pr.u.yoy[state.cargo];
    yoyW += pr.rev * y;
    base += pr.rev;
    volYo += pr.vol * (cargoAll ? pr.u.volYoy : pr.u.volYoy * 0.85);
  });
  var yoyRev = r1(yoyW / base),
    yoyVol = r1(volYo / (volOnly || 1));
  if (rentAmt > 0) yoyRev = r1((yoyRev * base + RENT.yoy * rentAmt) / (base + rentAmt));
  var yoyPrice = r1(yoyRev - yoyVol);
  var margin = volOnly > 0 ? r1(parts.reduce(function (s, pr) {
    return s + pr.u.margin * pr.vol;
  }, 0) / volOnly) : 0;
  var rows = [];
  if (all) {
    parts.forEach(function (pr) {
      if (pr.rev <= 0) return;
      rows.push({
        name: pr.u.name,
        rev: pr.rev,
        vol: r1(pr.vol),
        price: r1(pr.price),
        yoy: cargoAll ? pr.u.baseYoy : pr.u.yoy[state.cargo]
      });
    });
    if (rentAmt > 0) rows.push({
      name: RENT.name,
      rev: rentAmt,
      vol: 0,
      price: null,
      yoy: RENT.yoy
    });
  } else {
    var u = parts[0].u,
      totRev = parts[0].rev;
    u.seg.forEach(function (sg) {
      rows.push({
        name: sg[0],
        rev: r1(totRev * sg[1]),
        vol: parts[0].vol > 0 ? r1(parts[0].vol * sg[1]) : 0,
        price: parts[0].price,
        yoy: cargoAll ? u.baseYoy : u.yoy[state.cargo]
      });
    });
  }
  var revYanj = 0,
    revHai = 0;
  parts.forEach(function (pr) {
    if (pr.key === 'yanj') revYanj += pr.rev;else revHai += pr.rev;
  });
  var fy = FLEET_META.yanj,
    fh = FLEET_META.hai;
  var fleet = fy.ships * yw + fh.ships * hw,
    dwt = fy.ships * fy.dwt * yw + fh.ships * fh.dwt * hw;
  var days = p.m * 30,
    shipDays = fleet * days;
  var revShip = rev - rentAmt;
  var tce = shipDays > 0 ? Math.round(revShip * 1e8 / shipDays) : 0;
  var sMargin = fleet > 0 && volOnly > 0 ? r0(margin * volOnly * 1e4 / fleet) : 0;
  var opexFleet = fy.opexDay * fy.ships * yw + fh.opexDay * fh.ships * hw;
  var opex = fleet > 0 ? Math.round(opexFleet / fleet * 100) / 100 : 0;
  var bRate = tce > 0 ? r1(Math.min(100, opex * 1e4 * 2.1 / tce * 100)) : 0;
  var oil = r1(fy.oilDay * fy.ships * yw + fh.oilDay * fh.ships * hw);
  var portFee = r0(rev * 230),
    repairFee = r0(rev * 120);
  var util = r1(60 + 8 * (yw + hw));
  var cycle = yw + hw > 0 ? r1((fy.cycle * yw + fh.cycle * hw) / (yw + hw)) : 0;
  var delay = yw + hw > 0 ? r1((fy.delay * yw + fh.delay * hw) / (yw + hw)) : 0;
  return {
    rev: r1(rev),
    vol: r1(volOnly),
    avgPrice: avgPrice,
    margin: margin,
    yoyRev: yoyRev,
    yoyVol: yoyVol,
    yoyPrice: yoyPrice,
    yoyMargin: -1.4,
    rows: rows,
    cargoAll: cargoAll,
    rent: r1(rentAmt),
    yanjShare: rev > 0 ? r1(revYanj / rev * 100) : 0,
    haiShare: rev > 0 ? r1(revHai / rev * 100) : 0,
    haiRatio: revYanj > 0 ? r1(revHai / revYanj) : 0,
    fleet: r0(fleet),
    dwt: r1(dwt),
    tce: tce,
    sMargin: sMargin,
    bRate: bRate,
    opex: opex,
    oil: oil,
    portFee: portFee,
    repairFee: repairFee,
    util: util,
    cycle: cycle,
    delay: delay
  };
}
function genDetails() {
  var p = PERIOD(state.period),
    year = p.year,
    cal = CALIBER[state.caliber].factor;
  var picked = ORG_LEAVES.filter(function (l) {
    return state.orgSel[l.k];
  });
  var rows = [];
  picked.forEach(function (l) {
    var uk = l.parent.unit,
      u = UNITS[uk];
    var cnt = Math.max(1, Math.round((uk === 'yanj' ? 7 : 5) * l.w * 2));
    var tfac = uk === 'yanj' ? 0.95 : 2.6;
    for (var m = p.m0; m <= p.m1; m++) {
      for (var i = 0; i < cnt; i++) {
        var s = m * 101 + i * 37 + l.k.length * 5 + uk.length;
        var r = s % 97 / 97;
        var cat = state.cargo,
          chosen = 'coal',
          acc = 0;
        if (state.cargo === 'all') {
          for (var ci = 0; ci < CATS.length; ci++) {
            acc += u.mix[CATS[ci].k];
            if (r <= acc) {
              chosen = CATS[ci].k;
              break;
            }
          }
          cat = chosen;
        }
        var price = Math.round(u.price[cat] * (0.9 + s * 7 % 25 / 100) * 100) / 100;
        var t = Math.round((0.35 + s * 13 % 70 / 100) * tfac * 100) / 100;
        var seg = u.seg[i % u.seg.length];
        var d = 1 + s * 11 % 28;
        var date = year + '-' + pad2(m) + '-' + pad2(d);
        var bill = 'CHA' + year + pad2(m) + pad2(d) + '-' + (100 + s * 17 % 900);
        rows.push({
          bill: bill,
          date: date,
          unit: l.name,
          cat: catOf(cat).name,
          route: seg[0],
          ship: SHIPS[uk][s % SHIPS[uk].length],
          t: t,
          price: price,
          income: Math.round(t * price * cal * 10) / 10
        });
      }
    }
  });
  rows.sort(function (a, b) {
    return a.date < b.date ? 1 : -1;
  });
  return rows;
}
return { compute, genDetails: genDetails as () => DetailRow[], orgSelArr, orgUnits, orgHeadText, orgScopeText };
}
