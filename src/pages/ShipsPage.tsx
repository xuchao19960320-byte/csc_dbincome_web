import type { ShipRecord } from '../data/types';
import { Fragment } from 'react';
import { shipRows, shipMetric, shipStats } from '../data/selectors';
import { state, recentShips } from '../hooks/dashboardStore';
import { seg, copyShip, detailFields, card } from '../components/primitives';
import { types, colors, shipRecords, customers } from '../data/fleet';
import { fmt } from '../utils/format';
import { css } from '../utils/css';
import { comboChart } from '../charts/TrendChart';
export function ShipsPage() {
  const rows = shipRows();
  return (
    <>
      <section className="ship-search-zone">
        <form id="ship-search-form">
          <span>{'⌕'}</span>
          <input
            key={state.shipQuery}
            id="ship-search"
            placeholder="搜索船舶名称"
            aria-label="搜索船舶"
            defaultValue={state.shipQuery}
          />
          <button>{'搜索'}</button>
        </form>
        <div className="recent-ships">
          {'最近搜索：'}
          {recentShips.length ? (
            recentShips.map((n, _index) => (
              <Fragment key={_index}>
                <button data-recent={n}>
                  {'◷ '}
                  {n}
                </button>
              </Fragment>
            ))
          ) : (
            <span>{'暂无搜索记录'}</span>
          )}
        </div>
      </section>
      <section className="card ship-filters">
        <div className="ship-filter-row">
          <label>{'业务类型'}</label>
          {seg(['全部', '海船', '江船'], state.shipFleet, 'shipFleet')}
        </div>
        <div className="ship-filter-row">
          <label>{'船型'}</label>
          {seg(
            [
              '全部',
              ...(state.shipFleet === '全部'
                ? [...types.海船, ...types.江船]
                : types[state.shipFleet]),
            ],
            state.shipFilter,
            'shipFilter',
          )}
        </div>
      </section>
      <div className="ship-sort">
        {[
          ['当月业务收入', 'income'],
          ['当月营运率', 'rate'],
          ['日均TCE', 'tce'],
          ['当月货运量', 'cargo'],
        ].map(([name, k], _index2) => (
          <Fragment key={_index2}>
            <button className={state.shipSort === k ? 'active' : ''} data-ship-sort={k}>
              {name} {state.shipSort === k ? (state.shipDir === 'desc' ? '↓' : '↑') : '↕'}
            </button>
          </Fragment>
        ))}
      </div>
      <p className="ship-count">
        {'为您找到 '}
        <b>{rows.length}</b>
        {' 艘船舶'}
      </p>
      <div className="ship-cards">
        {rows.map((s, _index4) => (
          <Fragment key={_index4}>
            <article
              className="ship-item"
              data-open-ship={s.id}
              tabIndex={0}
              role="link"
              aria-label={'查看' + s.name + '详情'}
            >
              <div className="ship-item-head">
                <div>
                  <h2>
                    {s.name}
                    {copyShip(s)}
                  </h2>
                  <div className="ship-tags">
                    <span>{s.fleet}</span>
                    <span>{s.type}</span>
                  </div>
                  <p>{s.company}</p>
                </div>
                <div className="ship-rate">
                  <span>{'当月营运率'}</span>
                  <strong>
                    {fmt(shipMetric(s, 'rate'), 1)}
                    <small>{'%'}</small>
                  </strong>
                  <div>
                    <i style={css('width:' + shipMetric(s, 'rate') + '%')} />
                  </div>
                </div>
              </div>
              <div className="ship-four">
                {shipStats(s).map((v, _index3) => (
                  <Fragment key={_index3}>
                    <div>
                      <small>{v[0]}</small>
                      <b>
                        {v[1]}
                        <em>{v[2]}</em>
                      </b>
                    </div>
                  </Fragment>
                ))}
              </div>
            </article>
          </Fragment>
        ))}
      </div>
      {rows.length ? (
        ''
      ) : (
        <div className="ship-empty">
          {'未找到符合条件的船舶，请调整搜索或筛选条件。'}
          <button data-reset-ships="">{'重置船舶筛选'}</button>
        </div>
      )}
    </>
  );
}
export function shipLine(s: ShipRecord, mode: string) {
  const base = shipMetric(s, mode === 'rate' ? 'rate' : mode === 'income' ? 'income' : 'tce'),
    ratios = [0.82, 0.87, 0.9, 0.88, 0.85, 0.89, 0.92, 0.94, 0.91, 0.96, 0.98, 1],
    mk = (name, color, values, dash = false) => ({
      name,
      color,
      values,
      kind: 'line' as const,
      unit: mode === 'rate' ? '%' : '万元',
      dash,
    });
  let series =
    mode === 'income'
      ? [
          mk(
            '业务收入',
            '#267cff',
            ratios.map((v) => v * base),
          ),
          mk(
            '业务成本',
            '#ffc541',
            ratios.map((v) => v * shipMetric(s, 'cost')),
          ),
          mk(
            '毛利',
            '#16bd88',
            ratios.map((v) => v * (base - shipMetric(s, 'cost'))),
          ),
        ]
      : [
          mk(
            mode === 'rate' ? '营运率' : '日均TCE',
            '#267cff',
            ratios.map((v) => v * base),
          ),
          mk(
            mode === 'market' ? '航交所TCE' : '去年同期',
            '#98a6ba',
            ratios.map((v, i) => base * (v * 0.89 + (i % 3) * 0.015)),
            mode !== 'market',
          ),
        ];
  return comboChart(series, mode === 'rate' ? '单位：%' : '单位：万元');
}
export function shipCost(s: ShipRecord) {
  const cost = shipMetric(s, 'cost'),
    labels = ['船员费', '物料费', '润料费', '保险费', '修理费', '其他'],
    shares = [30, 15, 8, 12, 20, 15];
  let offset = 0;
  return (
    <div className="distribution">
      <div className="donut-wrap">
        <svg viewBox="0 0 200 200">
          {shares.map((v, i) => {
            const h = (
              <circle
                cx="100"
                cy="100"
                r="74"
                pathLength="100"
                stroke={colors[i]}
                strokeDasharray={v - 0.7 + ' ' + (100 - v + 0.7)}
                strokeDashoffset={-offset}
                data-tip={labels[i] + '：' + fmt((cost * v) / 100, 2) + ' 万元\n占比：' + v + '%'}
              />
            );
            offset += v;
            return <Fragment key={i}>{h}</Fragment>;
          })}
        </svg>
        <div className="donut-center">
          {'业务成本'}
          <strong>{fmt(cost, 0)}</strong>
          {'万元'}
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <tbody>
            {labels.map((n, i) => (
              <Fragment key={i}>
                <tr>
                  <td>
                    <i className="dot" style={css('background:' + colors[i])} />
                    {n}
                  </td>
                  <td>
                    {fmt((cost * shares[i]) / 100, 2)}
                    {' 万元'}
                  </td>
                  <td>
                    {shares[i]}
                    {'%'}
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export function profitWaterfall(s: ShipRecord) {
  const profit = shipMetric(s, 'income') - shipMetric(s, 'cost'),
    values = [profit * 0.82, profit * 0.27, -profit * 0.06, -profit * 0.03, profit],
    names = ['上期毛利', 'TCE影响', 'OPEX影响', 'CAPEX影响', '本期毛利'];
  let acc = 0;
  return (
    <svg className="ship-waterfall" viewBox="0 0 620 250" role="img" aria-label="毛利归因">
      <path d="M20 210H605" stroke="#dfe7f2" />
      {values.map((v, i) => {
        const start = i === 4 ? 0 : acc,
          end = i === 4 ? v : acc + v;
        acc = end;
        const y = 210 - (Math.max(start, end) / profit) * 155,
          h = (Math.abs(end - start) / profit) * 155;
        return (
          <Fragment key={i}>
            <>
              <rect
                x={35 + i * 116}
                y={y}
                width="65"
                height={h}
                rx="3"
                fill={i === 4 ? '#253140' : v < 0 ? '#fa6b69' : '#267cff'}
              />
              <text x={67 + i * 116} y={y - 8} textAnchor="middle">
                {fmt(v, 1)}
              </text>
              <text x={67 + i * 116} y="233" textAnchor="middle">
                {names[i]}
              </text>
            </>
          </Fragment>
        );
      })}
    </svg>
  );
}
export function shipVoyages(s: ShipRecord) {
  if (state.voyageTab === '异常诊断')
    return (
      <div className="ship-diagnosis">
        <div className="ship-diagnosis-title">
          {s.name}
          {' · '}
          {state.month}
          {' · 示例诊断'}
        </div>
        {detailFields([
          ['日均TCE', fmt(shipMetric(s, 'tce'), 2) + ' 万元'],
          ['较保本点差额', '+' + fmt(shipMetric(s, 'tce') * 0.35, 2) + ' 万元'],
          ['较市场TCE偏差', '+5.1%'],
          ['当前营运率', fmt(shipMetric(s, 'rate'), 1) + '%'],
        ])}
        <table>
          <thead>
            <tr>
              <th>{'指标'}</th>
              <th>{'当前值'}</th>
              <th>{'船型均值'}</th>
              <th>{'偏差'}</th>
              <th>{'状态'}</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['空排率', '17%', '9%', '+8个百分点', '关注'],
              ['负载率', '81%', '86%', '-5个百分点', '关注'],
              ['平均在港天数', '4.8天', '4.2天', '+0.6天', '关注'],
              ['日均修理费', '0.82万元', '0.93万元', '-11.8%', '正常'],
            ].map((r, _index5) => (
              <Fragment key={_index5}>
                <tr>
                  {r.map((v, i) => (
                    <Fragment key={i}>
                      <td className={i === 4 ? (v === '关注' ? 'down' : 'up') : ''}>{v}</td>
                    </Fragment>
                  ))}
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
        <p className="helper">
          {'空排率与在港天数高于船型均值，可结合航次明细查看配载与在港停时。'}
        </p>
      </div>
    );
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{'航次号'}</th>
            <th>{'航段'}</th>
            <th>{'货种'}</th>
            <th>{'货运量（万吨）'}</th>
            <th>{'航次毛利（万元）'}</th>
            <th>{'航次TCE（万元）'}</th>
            <th>{'状态'}</th>
          </tr>
        </thead>
        <tbody>
          {['上海—宁波', '宁波—京唐', '青岛—广州', '上海—湛江', '京唐—上海'].map((route, i) => (
            <Fragment key={i}>
              <tr>
                <td>
                  {state.month.replace('-', '')}
                  {'-'}
                  {s.id + 1}
                  {'-'}
                  {i + 1}
                </td>
                <td>
                  {s.fleet === '海船'
                    ? route
                    : ['武汉—上海', '芜湖—南京', '重庆—武汉', '上海—芜湖', '南京—武汉'][i]}
                </td>
                <td>{['煤炭', '矿石', '综合'][i % 3]}</td>
                <td>{fmt((shipMetric(s, 'cargo') / 5) * (0.8 + i * 0.1), 2)}</td>
                <td className="up">
                  {fmt(
                    ((shipMetric(s, 'income') - shipMetric(s, 'cost')) / 5) * (0.8 + i * 0.1),
                    2,
                  )}
                </td>
                <td>{fmt(shipMetric(s, 'tce') * (0.9 + i * 0.05), 2)}</td>
                <td>{i === 4 ? '在航' : '完成'}</td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function ShipDetailPage() {
  const s = shipRecords[state.selectedShip],
    profit = shipMetric(s, 'income') - shipMetric(s, 'cost');
  return (
    <>
      <div className="page-heading">
        <h1>
          <button className="back" data-key="page" data-value="ships">
            {'‹ 返回船舶分析'}
          </button>
          {s.name}
          {copyShip(s)} <span className="ship-tag">{s.type}</span>
        </h1>
        <span className="context">
          {state.month}
          {' · 示例数据'}
        </span>
      </div>
      <div className="ship-profile">
        <section className="card">
          <div className="body">
            <h2 className="ship-blue">{s.name}</h2>
            <p>
              {s.fleet}
              {' · '}
              {s.type}
            </p>
            <span className="ship-tag">{'营运中'}</span>
            {detailFields([
              ['船龄', s.age + '年'],
              ['所属公司', s.company],
              ['权属', s.owned ? '自有' : '外租'],
              ['业务板块', '干散货'],
            ])}
          </div>
        </section>
        {card(
          '船舶属性',
          '',
          detailFields([
            ['所属公司', s.company],
            ['权属', s.owned ? '自有' : '外租'],
            ['业务类型', s.fleet],
            ['船型', s.type],
            ['船龄', s.age + '年'],
            ['内贸 / 外贸', '内贸'],
          ]),
        )}
        {card(
          '当前经营画像',
          '',
          detailFields([
            ['主营货种', ['煤炭', '矿石', '综合'][s.id % 3]],
            ['主要航线', s.fleet === '海船' ? '沿海运输' : '长江干线'],
            ['主要客户', customers[s.id % customers.length]],
            ['TCE同比', '+4.2%'],
            ['营运率', fmt(shipMetric(s, 'rate'), 1) + '%'],
            ['当月毛利', fmt(profit, 2) + '万元'],
          ]),
        )}
      </div>
      <div className="ship-detail-kpis">
        {[
          ...shipStats(s),
          ['当月毛利', fmt(profit, 2), '万元'],
          ['毛利率', fmt((profit / shipMetric(s, 'income')) * 100, 1), '%'],
          ['保本点', fmt(shipMetric(s, 'tce') * 0.65, 2), '万元'],
          ['非营运天数', fmt(30 * (1 - shipMetric(s, 'rate') / 100), 1), '天'],
        ].map((v, _index6) => (
          <Fragment key={_index6}>
            <div>
              <small>{v[0]}</small>
              <strong>
                {v[1]}
                <em>{v[2]}</em>
              </strong>
            </div>
          </Fragment>
        ))}
      </div>
      <section className="ship-section">
        <h2>{'01\u3000经营总览'}</h2>
        <div className="grid">
          {card('日均TCE趋势 · 同期对比', '', shipLine(s, 'tce'))}
          {card(
            '业务规模与效率',
            '',
            detailFields([
              ['在港停时', '4.8天'],
              ['单位船产量', '5,176.50 吨·千米/吨'],
              ['负载率', '81%'],
              ['空排率', '17%'],
              ['营运率', fmt(shipMetric(s, 'rate'), 1) + '%'],
              ['吨天效益', '0.71 元/吨天'],
            ]),
          )}
          {card('月度收益趋势', '', shipLine(s, 'income'))}
          {card('营运率月度趋势', '', shipLine(s, 'rate'))}
        </div>
      </section>
      <section className="ship-section">
        <h2>{'02\u3000TCE分析'}</h2>
        {detailFields([
          ['日均TCE', fmt(shipMetric(s, 'tce'), 2) + '万元'],
          ['航交所TCE', fmt(shipMetric(s, 'tce') * 0.95, 2) + '万元'],
          ['TCE同比', '+4.2%'],
          ['与市场差异率', '+5.3%'],
        ])}
        {card('日均TCE与航交所TCE月度趋势', '', shipLine(s, 'market'))}
      </section>
      <section className="ship-section">
        <h2>{'03\u3000盈利与成本'}</h2>
        <div className="grid">
          {card('成本结构', '', shipCost(s))}
          {card('毛利归因', '', profitWaterfall(s))}
        </div>
      </section>
      <section className="ship-section">
        <h2>{'04\u3000航次与异常'}</h2>
        {seg(['航次明细', '异常诊断'], state.voyageTab, 'voyageTab')}
        <div className="card" style={css('margin-top:14px;padding:16px')}>
          {shipVoyages(s)}
        </div>
      </section>
    </>
  );
}
