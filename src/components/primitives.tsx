import { CopyShipButton } from './CopyShipButton';
import { Fragment } from 'react';
import { state } from '../hooks/dashboardStore';
export const icon = (kind) => {
  const paths = {
    规模: 'M3 11l9-7 9 7-9 7z M3 15l9 6 9-6 M3 7l9-5 9 5',
    航线: 'M4 6a2 2 0 1 0 4 0 2 2 0 0 0-4 0 M16 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0 M8 6h8a4 4 0 0 1 0 8H8a4 4 0 0 0 0 4h8',
    业务收入: 'M4 7h16v13H4z M4 7V4h12v3 M14 12h6v5h-6z M16 14.5h1',
    业务成本: 'M6 3h12v18l-3-2-3 2-3-2-3 2z M9 7h6 M9 11h6 M9 15h4',
    毛利: 'M4 19V5 M4 19h16 M7 15l4-5 4 2 5-7 M16 5h4v4',
    货运量: 'M4 7l8-4 8 4v10l-8 4-8-4z M4 7l8 4 8-4 M12 11v10 M8 5l8 4',
    周转量: 'M4 8a8 8 0 0 1 14-2l2 2 M20 3v5h-5 M20 16a8 8 0 0 1-14 2l-2-2 M4 21v-5h5',
    TCE: 'M9 3h6 M12 3v3 M18 6l2 2 M12 10v5l3 2 M20 14a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  };
  return (
    <span className="icon">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={paths[kind] || 'M4 4v16h16M8 16v-5m4 5V6m4 10V9'} />
      </svg>
    </span>
  );
};
export const trendButton = (i, period) => (
  <button
    className="trend-button"
    data-trend={i}
    data-period={period}
    aria-label={
      '查看' +
      ['业务收入', '业务成本', '毛利', '货运量', '周转量', 'TCE'][i] +
      (period === 'year' ? '年度' : '月度') +
      '近12个月趋势'
    }
    title="查看近12个月趋势"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 4v16h18M6 15l4-6 5 3 5-7" />
    </svg>
  </button>
);
export const opts = (a, v) =>
  a.map((x, _index) => (
    <Fragment key={_index}>
      <option {...(x === v ? {} : {})}>{x}</option>
    </Fragment>
  ));
export const seg = (a, v, key) => (
  <div className="seg">
    {a.map((x, _index2) => (
      <Fragment key={_index2}>
        <button className={x === v ? 'active' : ''} data-key={key} data-value={x}>
          {x}
        </button>
      </Fragment>
    ))}
  </div>
);
export const select = (a, v, key, label) => (
  <select aria-label={label} data-select={key} value={v} onChange={() => {}}>
    {opts(a, v)}
  </select>
);
export function card(title, tools, body, cls = '') {
  return (
    <section className={'card ' + cls}>
      <div className="card-head">
        <h2>
          {icon(
            {
              货类分析: '货运量',
              TCE分析: 'TCE',
              '自有/外租分析': '规模',
              江海分析: '航线',
              收入分析: '业务收入',
              船效分析: '航线',
            }[title],
          )}
          {title}
        </h2>
        <div className="tools">{tools}</div>
      </div>
      <div className="body">{body}</div>
    </section>
  );
}
export function pagination(page, count, key) {
  return (
    <div className="paging">
      <span>
        {'共 '}
        {count}
        {' 条'}
      </span>
      <button
        aria-label="上一页"
        data-key={key}
        data-value={page - 1}
        {...(page === 1
          ? {
              disabled: true,
            }
          : {})}
      >
        {'‹'}
      </button>
      {Array.from(
        {
          length: Math.ceil(count / 5),
        },
        (_, i) => (
          <Fragment key={i}>
            <button className={page === i + 1 ? 'active' : ''} data-key={key} data-value={i + 1}>
              {i + 1}
            </button>
          </Fragment>
        ),
      )}
      <button
        aria-label="下一页"
        data-key={key}
        data-value={page + 1}
        {...(page >= Math.ceil(count / 5)
          ? {
              disabled: true,
            }
          : {})}
      >
        {'›'}
      </button>
      <span>{'5 条/页'}</span>
    </div>
  );
}
export function sortHeader(label, key) {
  const on = state.rankSort === key;
  return (
    <th aria-sort={on ? (state.rankDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        className={'sort-button ' + (on ? 'sorted' : '')}
        data-sort={key}
        aria-label={
          '按' + label + (on && state.rankDirection === 'desc' ? '升序' : '降序') + '排名'
        }
      >
        {label}
        <small>{' (万元)'}</small>
        <span className="sort-arrows">
          <i className={on && state.rankDirection === 'asc' ? 'chosen' : ''}>{'▲'}</i>
          <i className={on && state.rankDirection === 'desc' ? 'chosen' : ''}>{'▼'}</i>
        </span>
      </button>
    </th>
  );
}
export function context() {
  return (
    <span className="context">
      {'长航总部 / '}
      {state.org}
      {'\u3000·\u3000'}
      {state.month}
    </span>
  );
}
export const copyShip = (s) => <CopyShipButton ship={s} />;
export function detailFields(items) {
  return (
    <div className="ship-field-grid">
      {items.map(([k, v], _index3) => (
        <Fragment key={_index3}>
          <div>
            <small>{k}</small>
            <b>{v}</b>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
