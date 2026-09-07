import { css } from '../utils/css';
import { icon, trendButton, card, seg, select, pagination, sortHeader, context } from '../components/primitives';
import { factor, total, unit, tceData, rankRows, monthlyDates } from '../data/selectors';
import { state } from '../hooks/dashboardStore';
import { metrics, colors, types, vesselNames, allTypes, companies } from '../data/fleet';
import { donut, bars, tceLegend, structureTable } from '../charts/DistributionCharts';
import { fmt } from '../utils/format';
import { comboChart } from '../charts/TrendChart';
export function kpis() {
  const a = [['业务收入', '收入', '万元'], ['业务成本', '成本', '万元'], ['毛利', '毛利', '万元'], ['货运量', '货运量', '万吨'], ['周转量', '货运量', '万吨/千米'], ['TCE', 'TCE', '万元']];
  return <div className={"kpis"}>{a.map((x, i) => <article className={"kpi"} style={css("--accent:" + (i === 5 ? '#8744ed' : '#267cff') + ";--tint:" + (i === 5 ? '#f8f4ff' : '#f2f7ff'))}><h2>{icon(x[0])}{x[0]}</h2><div className={"kvalues"}><div><small>{i === 5 ? '日均TCE' : '当月' + x[1]}{trendButton(i, 'month')}</small><div className={"value"}>{Math.round(2222 * factor())}<em>{x[2]}</em></div><div className={"delta"}>{"当月同比"}<b>{"+"}{Math.round(10 * factor())}{"%"}</b></div></div><div><small>{i === 5 ? '保本点' : '当年' + x[1]}{trendButton(i, 'year')}</small><div className={"value"}>{Math.round((i === 5 ? 1111 : 9999) * factor())}<em>{x[2]}</em></div><div className={"delta"}>{"当年同比"}<b>{"+"}{Math.round(99 * factor())}{"%"}</b></div></div></div></article>)}</div>;
}
export function cargo() {
  const names = ['煤炭', '矿石', '综合'],
    shares = [52, 31, 17],
    m = state.cargoMetric;
  return card('货类分析', <div className={"seg cargo-tabs"} role={"tablist"} aria-label={"货类分析指标"}>{metrics.map(x => <button role={"tab"} aria-selected={x === m} className={x === m ? 'active' : ''} data-key={"cargoMetric"} data-value={x}>{x}</button>)}</div>, <div className={"distribution cargo-distribution"}>{donut(names, shares, '当月' + m, fmt(total(m)))}<div className={"table-wrap"}><table><thead><tr><th>{"货类"}</th><th>{"当月"}{m}<small>{" ("}{unit(m)}{")"}</small></th><th>{"占比"}</th><th>{"同比"}</th></tr></thead><tbody>{names.map((n, i) => <tr><td><i className={"dot"} style={css("background:" + colors[i])} />{n}</td><td>{fmt(total(m) * shares[i] / 100, 2)}</td><td>{shares[i].toFixed(2)}{"%"}</td><td className={"up"}>{"+"}{(8.6 - i * 1.8).toFixed(2)}{"%"}</td></tr>)}</tbody></table></div></div>, 'cargo-card');
}
export function tce() {
  const aggregate = state.shipType === '全部船型',
    names = aggregate ? types[state.fleet] : vesselNames[allTypes.indexOf(state.shipType)],
    data = aggregate ? [0, 1, 2].map(j => types[state.fleet].map(type => {
      const values = tceData(type)[j];
      return Math.round(values.reduce((a, b) => a + b) / values.length * 100) / 100;
    })) : tceData(state.shipType);
  return card('TCE分析', <button className={"more"} data-key={"page"} data-value={"tce"}>{"更多 ›"}</button>, <><div className={"chart-toolbar"}>{seg(['海船', '江船'], state.fleet, 'fleet')}{select(['全部船型', ...types[state.fleet]], state.shipType, 'shipType', 'TCE船型')}</div><div className={"unit"}>{"单位：万元"}</div>{bars(names, data)}{tceLegend()}</>);
}
export function ownership() {
  const m = state.ownershipMetric,
    share = {
      业务收入: 68,
      业务成本: 63,
      业务毛利: 74,
      货运量: 70,
      周转量: 66
    }[m],
    parts = [share, 100 - share],
    labels = ['自有', '外租'];
  let start = -Math.PI / 2;
  const slices = parts.map((v, i) => {
    const end = start + v / 100 * Math.PI * 2,
      x1 = 130 + 95 * Math.cos(start),
      y1 = 115 + 95 * Math.sin(start),
      x2 = 130 + 95 * Math.cos(end),
      y2 = 115 + 95 * Math.sin(end),
      mid = (start + end) / 2;
    const html = <><path d={"M130 115 L" + x1 + " " + y1 + " A95 95 0 " + (v > 50 ? 1 : 0) + " 1 " + x2 + " " + y2 + " Z"} fill={colors[i]} stroke={"white"} strokeWidth={"3"} data-tip={labels[i] + "\n当月" + m + "：" + fmt(total(m) * v / 100, 2) + " 万吨\n占比：" + v.toFixed(2) + "%"}><title>{labels[i]}{"："}{fmt(total(m) * v / 100, 2)}{" 万吨，"}{v}{"%"}</title></path><text x={130 + 59 * Math.cos(mid)} y={115 + 59 * Math.sin(mid)} textAnchor={"middle"} fill={"white"} fontSize={"14"}>{labels[i]}{" "}{v}{"%"}</text></>;
    start = end;
    return html;
  });
  return card('自有/外租分析', <div className={"seg cargo-tabs"} role={"tablist"} aria-label={"自有外租分析指标"}>{metrics.map(x => <button role={"tab"} aria-selected={x === m} className={x === m ? 'active' : ''} data-key={"ownershipMetric"} data-value={x}>{x}</button>)}</div>, <><div className={"unit"}>{"单位：万吨"}</div><div className={"ownership-chart"}><svg viewBox={"0 0 260 230"} role={"img"} aria-label={"自有、外租当月" + m + "占比"}>{slices}</svg><div className={"legend"}>{labels.map((n, i) => <span><i style={css("background:" + colors[i])} />{n}{" "}{fmt(total(m) * parts[i] / 100, 2)}{" 万吨"}</span>)}</div></div></>, 'ownership-card');
}
export function river() {
  let names = types[state.river],
    weights = state.river === '江船' ? [.44, .33, .23] : [.3, .25, .2, .15, .1],
    values = names.map((n, i) => Math.round(total(state.riverMetric) * (state.river === '江船' ? .62 : .38) * weights[i]));
  return card('江海分析', <div className={"seg cargo-tabs"} role={"tablist"} aria-label={"江海分析指标"}>{metrics.map(m => <button role={"tab"} aria-selected={m === state.riverMetric} className={m === state.riverMetric ? 'active' : ''} data-key={"riverMetric"} data-value={m}>{m}</button>)}</div>, <><div className={"helper"}>{"点击江船或海船，联动查看各船型数据"}</div><div className={"river-layout"}><div className={"distribution"}>{donut(['江船', '海船'], [62, 38], state.riverMetric, fmt(total(state.riverMetric)), 'river', state.river)}{structureTable(['江船', '海船'], [62, 38], state.riverMetric, 'river', state.river)}</div><div className={"breakdown"}><div className={"subhead"}>{state.river}{" · 各船型"}{state.riverMetric}</div><div className={"unit"}>{"单位："}{unit(state.riverMetric)}</div>{bars(names, [values], false)}</div></div></>, 'wide');
}
export function overdue() {
  let shares = [23, 19, 15, 12, 9, 8, 6, 5, 3],
    c = companies.indexOf(state.company),
    n = Math.round((c < 0 ? 126 : 126 * shares[c] / 100) * factor());
  return card('超期艘次分析', <button className={"more"} data-key={"company"} data-value={"全部公司"}>{"全部公司"}</button>, <><div className={"helper"}>{"悬浮查看公司数据，点击环形图查看超期明细"}</div><div className={"overdue-layout"}>{donut(companies, shares, state.company === '全部公司' ? '超期艘次' : '公司超期艘次', n, 'company', state.company)}<div className={"table-wrap"}><div className={"unit"}>{state.company}{" · 所有船型"}</div><table><thead><tr><th>{"船型"}</th><th>{"总艘次"}</th><th>{"超期艘次"}</th><th>{"平均在港天数"}</th><th>{"同比"}</th></tr></thead><tbody>{allTypes.slice((state.overPage - 1) * 5, state.overPage * 5).map((t, j) => {
              let i = (state.overPage - 1) * 5 + j;
              return <tr><td>{t}</td><td>{Math.max(1, Math.round(n * [.2, .17, .14, .13, .11, .1, .08, .07][i])) * 4 + i + 3}</td><td>{Math.max(1, Math.round(n * [.2, .17, .14, .13, .11, .1, .08, .07][i]))}</td><td>{(4.2 + (i + c + 1) * .43).toFixed(1)}</td><td className={i % 2 ? 'up' : 'down'}>{i % 2 ? '+3.20%' : '-5.10%'}</td></tr>;
            })}</tbody></table>{pagination(state.overPage, 8, 'overPage')}</div></div></>);
}
export function ranking() {
  let rows = rankRows(state.rank).sort((a, b) => (a[state.rankSort] - b[state.rankSort]) * (state.rankDirection === 'asc' ? 1 : -1));
  return card('排名分析', <button className={"more"} data-key={"page"} data-value={"ranking"}>{"更多 ›"}</button>, <>{seg(['客户排名', '船舶排名'], state.rank, 'rank')}<div className={"table-wrap"}><table className={"rank-table"}><thead><tr><th>{"序号"}</th><th>{state.rank === '船舶排名' ? '船名' : '客户名'}</th>{sortHeader('业务收入', 'income')}{sortHeader('业务成本', 'cost')}{sortHeader('日均TCE', 'tce')}</tr></thead><tbody>{rows.slice((state.rankPage - 1) * 5, state.rankPage * 5).map((r, j) => {
            let i = (state.rankPage - 1) * 5 + j;
            return <tr><td><span className={"rank-num " + (i < 3 ? 'top-rank' : '')}>{i + 1}</span></td><td>{r.name}</td><td><b>{fmt(r.income)}</b></td><td>{fmt(r.cost)}</td><td>{fmt(r.tce, 2)}</td></tr>;
          })}</tbody></table></div>{pagination(state.rankPage, 8, 'rankPage')}</>);
}
export function tceDetail() {
  let ts = state.detailFleet === '全部' ? allTypes : types[state.detailFleet];
  return <><div className={"page-heading"}><h1><button className={"back"} data-key={"page"} data-value={"home"}>{"‹ 返回总览"}</button>{"船舶效益分析"}</h1>{context()}</div><div style={css("margin-bottom:18px")}>{seg(['全部', '江船', '海船'], state.detailFleet, 'detailFleet')}</div><div className={"details-grid"}>{ts.map(type => {
        let ds = tceData(type),
          names = vesselNames[allTypes.indexOf(type)];
        return card(type, '', <><div className={"detail-summary"}><span>{"日均TCE"}<b>{fmt(ds[0].reduce((a, b) => a + b) / 3, 2)}</b>{" 万元"}</span></div>{tceLegend()}{bars(names, ds)}<div className={"table-wrap"}><table><thead><tr><th>{"指标（万元）"}</th>{names.map(n => <th>{n}</th>)}</tr></thead><tbody>{['日均TCE', '保本点', '航交所TCE'].map((m, i) => <tr><td><i className={"dot"} style={css("background:" + ['#2786ff', '#28c797', '#ffc443'][i])} />{m}</td>{ds[i].map(v => <td>{fmt(v, 2)}</td>)}</tr>)}</tbody></table></div></>);
      })}</div></>;
}
export function rankingDetail() {
  let isShip = state.detailRank === '船舶排名',
    ms = ['业务成本', '业务收入', '毛利', '毛利率', '货运量', '周转量', ...(isShip ? ['日均TCE', '保本点', '航交所TCE'] : [])];
  return <><div className={"page-heading"}><h1><button className={"back"} data-key={"page"} data-value={"home"}>{"‹ 返回总览"}</button>{"排名分析"}</h1>{context()}</div>{card('排名明细', seg(['客户排名', '船舶排名'], state.detailRank, 'detailRank'), <><div className={"helper"}>{"金额：万元\u3000货运量：万吨\u3000周转量：万吨/千米\u3000TCE：万元"}</div><div className={"detail-table"}><table><thead><tr><th rowSpan={"2"}>{"序号"}</th><th rowSpan={"2"}>{isShip ? '船名' : '客户名'}</th><th className={"group"} colSpan={ms.length}>{"年度 · "}{state.month.slice(0, 4)}{"年累计"}</th><th className={"group"} colSpan={ms.length}>{"月度 · "}{state.month}</th></tr><tr>{[...ms, ...ms].map(m => <th>{m}</th>)}</tr></thead><tbody>{rankRows(state.detailRank).map((r, i) => {
              const vals = f => [fmt(r.cost * f), fmt(r.income * f), fmt((r.income - r.cost) * f), fmt((r.income - r.cost) / r.income * 100, 2) + '%', fmt(r.cargo * f, 2), fmt(r.turn * f, 2), ...(isShip ? [fmt(r.tce * (f === 1 ? 1 : .94), 2), fmt(r.tce * .65, 2), fmt(r.tce * .79, 2)] : [])];
              return <tr><td>{i + 1}</td><td>{r.name}</td>{[...vals(Number(state.month.slice(5)) * .91), ...vals(1)].map(v => <td>{v}</td>)}</tr>;
            })}</tbody></table></div></>)}</>;
}
export function trendPanels() {
  const blue = '#267cff',
    yellow = '#ffc541',
    green = '#16bd88',
    red = '#fa6b69',
    gray = '#b6bdc8',
    dates = monthlyDates(),
    scale = factor() * (allTypes.indexOf(state.incomeType) + 3) / 6,
    series = (name, color, kind, values, axis = 'left', unit = '万元', dash = false) => ({
      name,
      color,
      kind,
      values,
      axis,
      unit,
      dash
    }),
    revenue = dates.map((_, i) => Math.round((1800 + i * 52 + i % 3 * 74) * scale)),
    cost = revenue.map((v, i) => Math.round(v * (.71 + i % 3 * .025))),
    profit = revenue.map((v, i) => v - cost[i]);
  const cumulative = a => a.map((_, i) => {
    const m = Number(dates[i].slice(5));
    let result = 0;
    for (let j = 0; j < m; j++) result += Math.round(a[i] * (.78 + j * .025));
    return result;
  });
  const annualRevenue = cumulative(revenue),
    annualCost = cumulative(cost),
    annualProfit = annualRevenue.map((v, i) => v - annualCost[i]);
  const incomeSeries = [series('当月收入', blue, 'bar', revenue), series('当月成本', yellow, 'bar', cost), series('当月毛利', green, 'bar', profit), series('当年收入', blue, 'line', annualRevenue, 'right'), series('当年成本', yellow, 'line', annualCost, 'right'), series('当年毛利', green, 'line', annualProfit, 'right'), series('去年同期业务收入', gray, 'line', annualRevenue.map(v => Math.round(v * .89)), 'right', '万元', true)];
  const tceValues = dates.map((_, i) => (18 + i * .65 + i % 3 * 1.2) * factor()),
    tceSeries = [series('日均TCE', blue, 'bar', tceValues), series('保本点', yellow, 'bar', tceValues.map(v => v * .65)), series('航交所TCE', green, 'line', tceValues.map(v => v * .82))];
  const ef = factor() * (state.effFleet === '全部' ? 1 : state.effFleet === '江船' ? .62 : .38),
    counts = dates.map((_, i) => Math.round((168 + i * 6 + i % 3 * 9) * ef)),
    effSeries = [series('当月总艘次', blue, 'bar', counts, 'left', '艘次'), series('当月超期艘次', yellow, 'bar', counts.map(v => Math.round(v * .21)), 'left', '艘次'), series('卸空艘', red, 'bar', counts.map(v => Math.round(v * .37)), 'left', '艘'), series('平均在港天', yellow, 'line', dates.map((_, i) => (4.3 + i % 4 * .35) * (state.effFleet === '海船' ? 1.2 : 1)), 'right', '天')];
  const configs = {
    '收入趋势分析': {
      series: incomeSeries,
      left: '当月：万元',
      right: '年度累计：万元',
      tools: <>{seg(['江船', '海船'], state.incomeFleet, 'incomeFleet')}{select(types[state.incomeFleet], state.incomeType, 'incomeType', '收入趋势船型')}</>
    },
    'TCE趋势分析': {
      series: tceSeries,
      left: '单位：万元',
      right: '',
      tools: ''
    },
    '船效分析': {
      series: effSeries,
      left: '艘次 / 艘',
      right: '平均在港天：天',
      tools: seg(['全部', '江船', '海船'], state.effFleet, 'effFleet')
    }
  };
  const current = configs[state.trendTab];
  return <section className={"card trend-switcher"}><div className={"trend-tabs-head"}><div className={"trend-tabs"} role={"tablist"} aria-label={"趋势分析"}>{Object.keys(configs).map(t => <button role={"tab"} aria-selected={t === state.trendTab} className={t === state.trendTab ? 'active' : ''} data-key={"trendTab"} data-value={t}>{t}</button>)}</div><div className={"tools"}>{current.tools}</div></div><div className={"body"} role={"tabpanel"} aria-label={state.trendTab}><div className={"trend-metrics"}>{current.series.map(item => {
          const visible = !state.hiddenSeries[state.trendTab + '|' + item.name];
          return <button className={"trend-metric " + (visible ? '' : 'hidden-series')} data-series={item.name} aria-pressed={visible} title={(visible ? '隐藏' : '显示') + item.name}><span><i style={css("background:" + item.color)} />{item.name}</span><strong>{fmt(item.values[11], item.unit === '万元' ? 2 : 1)}<small>{item.unit}</small></strong></button>;
        })}</div>{comboChart(current.series, current.left, current.right)}</div></section>;
}