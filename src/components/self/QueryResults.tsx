import { MET_DEFS, SORT_LABEL } from '../../data/self/catalog';
import type { QueryController } from '../../hooks/self/useQuery';
import { detailsCsv, downloadText } from '../../utils/exportCsv';
import { QueryIcon } from './QuerySidebar';
export function QueryKpis({ query, onManage }: { query: QueryController; onManage: () => void }) {
  const metrics = MET_DEFS.filter((m) => query.config.metrics[m.k]);
  const r = query.result;
  const aliases = {
    price: 'avgPrice',
    margin: 'margin',
  };
  return (
    <section className="panel-card">
      <div className="res-head">
        <div className="res-title">
          <span className="bar" />
          <h2>查询结果</h2>
          <span className="sub">
            基于当前查询条件实时计算，已应用 {metrics.length} 个指标 · {query.config.dims.length}{' '}
            个分析维度
          </span>
        </div>
        <div className="res-tools">
          <span>已展示 {metrics.length} 项</span>
          <button className="mini-btn" onClick={onManage}>
            <QueryIcon kind="settings" />
            管理展示指标
          </button>
        </div>
      </div>
      <div
        className="kpi-grid"
        style={{
          gridTemplateColumns: `repeat(${Math.min(metrics.length, 6) || 1},1fr)`,
        }}
      >
        {metrics.map((m) => {
          const value = r[aliases[m.k] || m.k] ?? 0;
          const delta = {
            rev: r.yoyRev,
            vol: r.yoyVol,
            price: r.yoyPrice,
            margin: r.yoyMargin,
            tce: r.yoyPrice,
            sMargin: r.yoyMargin,
            rent: 3.2,
          }[m.k];
          return (
            <div className="kpi" key={m.k}>
              <div className="kpi-label" title={m.d}>
                {m.n}
                <QueryIcon kind="settings" />
              </div>
              <div className="kpi-num">
                <b>
                  {Number(value).toLocaleString('zh-CN', {
                    maximumFractionDigits: 2,
                  })}
                </b>
                <span>{m.u}</span>
              </div>
              {delta !== undefined && (
                <div className={`kpi-trend ${delta >= 0 ? 'up' : 'down'}`}>
                  <QueryIcon kind="chart" />
                  环比{' '}
                  <b>
                    {delta >= 0 ? '+' : ''}
                    {delta}
                    {m.k === 'margin' || m.k === 'sMargin' ? 'pp' : '%'}
                  </b>
                </div>
              )}
            </div>
          );
        })}
        {!metrics.length && (
          <div className="kpi kpi-empty">
            未选择展示指标
            <br />
            请在左侧「更多配置 → 指标选择」中勾选
          </div>
        )}
      </div>
    </section>
  );
}
export function QueryTable({ query }: { query: QueryController }) {
  const { rows, page, setPage, pageSize, setPageSize, applied } = query;
  const total = Math.max(1, Math.ceil(rows.length / pageSize));
  return (
    <div>
      <div className="meta-row">
        <span>
          根据当前分析维度和指标自动生成明细结果 · 共 <b>{rows.length}</b> 条 · 已按{' '}
          {SORT_LABEL[(applied || query.config).sortKey]}{' '}
          {(applied || query.config).sortDir === 'asc' ? '升序' : '降序'}排序{' '}
          <em className={`detail-status ${applied ? '' : 'pending'}`}>
            {applied ? '查询完成' : '待查询 · 点击「查询数据」'}
          </em>
        </span>
        <span className="meta-right">
          <span>单位：万吨 / 元每吨 / 万元</span>
          <button
            className="mini-btn"
            disabled={!rows.length}
            onClick={() => downloadText(detailsCsv(rows), '长航干散货自助分析明细.csv')}
          >
            <QueryIcon />
            导出
          </button>
        </span>
      </div>
      <div className="detail-wrap">
        <table className="detail-table">
          <thead>
            <tr>
              {[
                '序号',
                '提单 / 航次号',
                '完成日期',
                '单位',
                '货类',
                '航线',
                '船名',
                '货量(万吨)',
                '均价(元/吨)',
                '收入(万元)',
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice((page - 1) * pageSize, page * pageSize).map((r, i) => (
              <tr key={`${r.bill}-${r.unit}-${i}`}>
                <td className="idx">{(page - 1) * pageSize + i + 1}</td>
                <td className="bill">{r.bill}</td>
                <td>{r.date}</td>
                <td>{r.unit}</td>
                <td>{r.cat}</td>
                <td>{r.route}</td>
                <td>{r.ship}</td>
                <td className="num">{r.t.toFixed(2)}</td>
                <td className="num">{r.price.toFixed(2)}</td>
                <td className="num">{r.income.toLocaleString()}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr className="detail-empty">
                <td colSpan={10}>
                  {applied
                    ? '当前筛选范围内没有明细数据'
                    : '暂无明细数据，点击左侧「查询数据」后加载该条件下逐票运输明细'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="pager">
        <span className="pg-total">
          共 <b>{rows.length}</b> 条
        </span>
        <button className="pg-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
          ‹
        </button>
        {Array.from(
          {
            length: total,
          },
          (_, i) => i + 1,
        )
          .filter((n) => n === 1 || n === total || Math.abs(page - n) < 2)
          .map((n, i, a) => (
            <span key={n}>
              {i > 0 && n - a[i - 1] > 1 && <span> … </span>}
              <button className={`pg-num ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>
                {n}
              </button>
            </span>
          ))}
        <button className="pg-btn" disabled={page >= total} onClick={() => setPage(page + 1)}>
          ›
        </button>
        <select
          className="pg-size-btn"
          aria-label="每页条数"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
        >
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}条/页
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
