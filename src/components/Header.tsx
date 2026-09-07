import { state, update } from '../hooks/dashboardStore';
export function Header() {
  const tabs = [['home', '收入总览'], ['ships', '船舶分析'], ['multi', '多维分析'], ['self', '自助分析']];
  const active = state.page === 'shipDetail' ? 'ships' : ['tce', 'ranking'].includes(state.page) ? 'home' : state.page;
  return <div className="top"><div className="product-brand"><span className="product-logo" aria-label="D轮廓包围轮船"><svg viewBox="0 0 44 44" aria-hidden="true"><path d="M7 5h12c13 0 19 7 19 17s-6 17-19 17H7Z" fill="none" stroke="white" strokeWidth="3"/><path d="M12 24h19l-4 7H16z M17 24v-7h9v7 M20 17v-4h3v4 M12 33q3-3 6 0 3-3 6 0 3-3 7 0" fill="none" stroke="white" strokeWidth="1.7" strokeLinejoin="round"/></svg></span><strong>长航干散货收入分析</strong></div>{tabs.map(([key, label]) => <button key={key} className={`tab ${active === key ? 'nav-active' : ''}`} id={`${key}-tab`} onClick={() => update('page', key)}>{label}</button>)}</div>;
}
