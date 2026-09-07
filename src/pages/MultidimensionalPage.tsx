import { monthlyDates, multiRows } from '../data/selectors';
import { state } from '../hooks/dashboardStore';
import { card, seg } from '../components/primitives';
import { fmt } from '../utils/format';
import { tce } from './OverviewPage';
import { shipRecords, types, colors, allTypes } from '../data/fleet';
import { css } from '../utils/css';
import { matrixChart, comparisonChart, revenueMap } from '../charts/MatrixCharts';
export function multiDetails(rows) {
  const dates = monthlyDates().reverse(),
    all = dates.flatMap(d => rows.map(s => ({
      s,
      d
    }))),
    page = Math.min(state.multiTablePage, Math.max(1, Math.ceil(all.length / 12))),
    heads = ['年月', '船名', '组织', '业务类型', '船型', '权属', '船龄（年）', '业务收入（万元）', '业务成本（万元）', '业务毛利（万元）', '毛利率（%）', '货运量（万吨）', '周转量（万吨/千米）', '营运率（%）', '日均TCE（万元）', '保本点（万元）', '航交所TCE（万元）', 'TCE市场差异（%）', '营运排名', '营运档位', 'TCE档位', '总艘次', '超期艘次', '卸空艘', '平均在港天', '负载率（%）', '空排率（%）', '非营运天', 'OPEX（万元）', 'CAPEX（万元）', '收入同比（%）', '成本同比（%）', '毛利同比（%）', '货运量同比（%）', '周转量同比（%）'];
  return card('船舶月度核心指标明细', <span className={"unit"}>{"近12个月 · "}{all.length}{"条 · 示例数据"}</span>, <><div className={"multi-detail-table"}><table><thead><tr>{heads.map(h => <th>{h}</th>)}</tr></thead><tbody>{all.slice((page - 1) * 12, page * 12).map(({
            s,
            d
          }) => {
            const f = .8 + monthlyDates().indexOf(d) * .018,
              income = s.income * f,
              cost = s.cost * f,
              profit = income - cost,
              tce = s.tce * f,
              vals = [d, s.name, s.company, s.fleet, s.type, s.owned ? '自有' : '外租', s.age, fmt(income, 2), fmt(cost, 2), fmt(profit, 2), fmt(profit / income * 100, 2), fmt(s.cargo * f, 2), fmt(s.cargo * f * 120, 2), fmt(s.rate * f, 1), fmt(tce, 2), fmt(tce * .65, 2), fmt(tce / s.ratio, 2), fmt((s.ratio - 1) * 100, 1), s.rank, ['高', '中', '低'][s.op], ['跑赢', '持平', '跑输'][s.tier], 12 + s.id % 8, 2 + s.id % 3, 3 + s.id % 4, fmt(4 + s.id % 5 * .3, 1), 81, 17, fmt(30 * (1 - s.rate * f / 100), 1), fmt(cost * .8, 2), fmt(cost * .2, 2), 10, 8, 12, 6, 9];
            return <tr>{vals.map((v, i) => <td>{i === 1 ? <button data-open-ship={s.id}>{v}</button> : v}</td>)}</tr>;
          })}</tbody></table></div><div className={"paging"}><button data-key={"multiTablePage"} data-value={page - 1} {...page === 1 ? {
        "disabled": true
      } : {}}>{"‹"}</button><span>{page}{" / "}{Math.max(1, Math.ceil(all.length / 12))}</span><button data-key={"multiTablePage"} data-value={page + 1} {...page * 12 >= all.length ? {
        "disabled": true
      } : {}}>{"›"}</button></div></>, 'multi-details');
}
export function multiPage() {
  const rows = multiRows();
  return <>{card('营运效率和TCE九宫格分析', <><span className={"unit"}>{"气泡大小"}</span>{seg(['业务收入', '货运量', '船龄'], state.multiSize, 'multiSize')}{seg(['海船', '江船'], state.multiFleet, 'multiFleet')}</>, <><div className={"helper"}>{"气泡大小："}{state.multiSize}{"\u3000｜\u3000颜色：船型\u3000｜\u3000营运率按所有"}{shipRecords.length}{"艘示例船舶排名\u3000｜\u3000市场持平：TCE偏差±1%"}</div><div className={"multi-type-legend"}>{types[state.multiFleet].map(t => <span><i className={"dot"} style={css("background:" + colors[allTypes.indexOf(t)])} />{t}</span>)}</div><div className={"matrix-layout-new"}>{matrixChart(rows)}<aside className={"matrix-list"}><input id={"matrix-search"} aria-label={"搜索船名"} placeholder={"搜索船名"} defaultValue={state.matrixQuery} /><strong>{"共 "}{rows.length}{" 艘船舶"}</strong>{rows.filter(s => s.name.includes(state.matrixQuery)).map(s => <button data-matrix-ship={s.id}><b>{s.name}</b><small>{"营运"}{['高', '中', '低'][s.op]}{" · "}{['跑赢', '持平', '跑输'][s.tier]}</small></button>)}{rows.length ? '' : <p>{"当前筛选下暂无船舶"}</p>}</aside></div></>, 'multi-matrix')}<div className={"grid"} style={css("margin-top:18px")}>{card('单船 vs 市场 · 二维对比', seg(['与市场比', '与集团比'], state.multiBenchmark, 'multiBenchmark'), comparisonChart(rows))}{card('船舶结构分析', seg(['业务收入', '业务成本', '业务毛利', '货运量'], state.structureMetric, 'structureMetric'), revenueMap(rows))}</div>{multiDetails(rows)}</>;
}