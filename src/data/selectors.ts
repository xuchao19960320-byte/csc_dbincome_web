import { state } from '../hooks/dashboardStore';
import { companies, allTypes, vesselNames, customers, shipRecords } from './fleet';
import { fmt } from '../utils/format';
export const factor = () => (state.org === '全部二级组织' ? 1 : (companies.indexOf(state.org) + 4) / 17) * (1 - (8 - Number(state.month.slice(5))) * .035);
export const unit = m => m === '货运量' ? '万吨' : m === '周转量' ? '万吨/千米' : '万元';
export const total = m => Math.round(({
  业务收入: 2222,
  业务成本: 1780,
  业务毛利: 442,
  货运量: 2222,
  周转量: 6880
}[m] || 2222) * factor());
export function donutTip(name, share, i, key) {
  if (key === 'company') {
    const voyages = Math.round(126 * share / 100 * factor());
    return `公司名称：${name}\n超期船舶数量：${Math.max(1, Math.round(voyages * .7))} 艘\n超期航次：${voyages} 航次\n平均在岗天数：${(4.2 + (i + 1) * .43).toFixed(1)} 天`;
  }
  const m = key === 'river' ? state.riverMetric : state.cargoMetric;
  return `货类名称：${name}\n当月${m}：${fmt(total(m) * share / 100, 2)} ${unit(m)}\n占比：${share.toFixed(2)}%\n同比：+${(8.6 - i * 1.8).toFixed(2)}%`;
}
export function tceData(type) {
  let i = allTypes.indexOf(type),
    b = [4, 2.7, 3.2, 32, 27, 23, 14, 10][i] * factor();
  return [[b * .92, b * 1.16, b * 1.03], [b * .63, b * .59, b * .68], [b * .77, b * .77, b * .77]].map(a => a.map(x => Math.round(x * 100) / 100));
}
export function rankRows(dim) {
  return Array.from({
    length: 8
  }, (_, i) => ({
    name: dim === '船舶排名' ? vesselNames.flat()[i] : customers[i],
    income: Math.round((2860 - i * 239) * factor()),
    cost: Math.round((2130 - i * 175) * factor()),
    tce: (32.86 - i * 2.37) * factor(),
    cargo: (132 - i * 9) * factor(),
    turn: (1389 - i * 97) * factor()
  }));
}
export function monthlyDates() {
  const [year, month] = state.month.split('-').map(Number);
  return Array.from({
    length: 12
  }, (_, i) => {
    const d = new Date(year, month - 12 + i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
}
export function multiRows() {
  const ranked = [...shipRecords].sort((a, b) => shipMetric(b, 'rate') - shipMetric(a, 'rate') || a.id - b.id);
  return shipRecords.filter(s => (state.org === '全部二级组织' || s.company === state.org) && s.fleet === state.multiFleet).map(s => {
    const rank = ranked.findIndex(v => v.id === s.id) + 1,
      percent = (rank - .5) / ranked.length,
      op = percent < .3 ? 0 : percent >= .7 ? 2 : 1,
      ratio = [1.18, 1, .83][s.id % 3],
      market = shipMetric(s, 'tce') / ratio;
    return {
      ...s,
      rank,
      percent,
      op,
      ratio,
      market,
      tier: ratio > 1.01 ? 0 : ratio < .99 ? 2 : 1
    };
  });
}
export function multiRadius(s) {
  const value = state.multiSize === '船龄' ? s.age : shipMetric(s, state.multiSize === '货运量' ? 'cargo' : 'income'),
    max = Math.max(...multiRows().map(v => state.multiSize === '船龄' ? v.age : shipMetric(v, state.multiSize === '货运量' ? 'cargo' : 'income')));
  return 8 + Math.sqrt(value / max) * 16;
}
export function matrixTip(s) {
  return `${s.name}\n${s.fleet} · ${s.type}\n当月营运率：${fmt(shipMetric(s, 'rate'), 1)}%\n全船排名：${s.rank}/${shipRecords.length}\n营运竞争力：${['高', '中', '低'][s.op]}\n日均TCE：${fmt(shipMetric(s, 'tce'), 2)} 万元\n市场TCE：${fmt(s.market, 2)} 万元\nTCE竞争力：${['跑赢市场', '与市场持平', '跑输市场'][s.tier]}\n业务收入：${fmt(shipMetric(s, 'income'), 2)} 万元\n货运量：${fmt(shipMetric(s, 'cargo'), 2)} 万吨\n船龄：${s.age} 年`;
}
export function historyPoint(s, step) {
  const op = (s.op + Math.floor((11 - step) / 4)) % 3,
    tier = (s.tier + Math.floor((11 - step) / 3)) % 3;
  return {
    x: 125 + (2 - tier) * 310 + s.id % 4 * 55 + step % 3 * 7,
    y: 100 + op * 135 + s.id % 2 * 38,
    op,
    tier
  };
}
export function shipMetric(s, k) {
  const mf = 1 - (8 - Number(state.month.slice(5))) * .025;
  return k === 'rate' ? Math.min(99.8, s.rate * mf) : s[k] * mf;
}
export function shipRows() {
  return shipRecords.filter(s => (state.org === '全部二级组织' || s.company === state.org) && (state.shipFleet === '全部' || s.fleet === state.shipFleet) && (state.shipFilter === '全部' || s.type === state.shipFilter) && s.name.includes(state.shipQuery)).sort((a, b) => (shipMetric(a, state.shipSort) - shipMetric(b, state.shipSort)) * (state.shipDir === 'desc' ? -1 : 1));
}
export function shipStats(s) {
  return [['当月业务收入', fmt(shipMetric(s, 'income'), 2), '万元'], ['当月营运率', fmt(shipMetric(s, 'rate'), 1), '%'], ['日均TCE', fmt(shipMetric(s, 'tce'), 2), '万元'], ['当月货运量', fmt(shipMetric(s, 'cargo'), 2), '万吨']];
}