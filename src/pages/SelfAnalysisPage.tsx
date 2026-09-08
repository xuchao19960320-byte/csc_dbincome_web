import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import reactStyles from '../styles/self-analysis-react.css?inline';
import selfStyles from '../styles/self-analysis.css?inline';
import { useQuery } from '../hooks/self/useQuery';
import { useTemplates, templateConfig } from '../hooks/self/useTemplates';
import { CALIBER, SHIP_TYPE } from '../data/self/catalog';
import { PERIOD } from '../data/self/queryEngine';
import { QuerySidebar, QueryIcon, MetricsOptions } from '../components/self/QuerySidebar';
import { QueryKpis, QueryTable } from '../components/self/QueryResults';
import { QueryCharts } from '../components/self/QueryCharts';
import { TemplateList } from '../components/self/TemplateList';

/** Shadow DOM preserves the original query workspace's independent CSS without an iframe. */
export function SelfAnalysisPage() {
  const host = useRef<HTMLDivElement>(null),
    [shadow, setShadow] = useState<ShadowRoot | null>(null);
  useLayoutEffect(() => {
    if (host.current)
      setShadow(
        host.current.shadowRoot ||
          host.current.attachShadow({
            mode: 'open',
          }),
      );
  }, []);
  const css = selfStyles
    .replaceAll(':root', '.self-analysis-root')
    .replace(/\bbody\b/g, '.self-analysis-root')
    .replaceAll('100vh', 'var(--query-height)');
  return (
    <div className="self-workspace" ref={host}>
      {shadow &&
        createPortal(
          <>
            <style>{css + reactStyles}</style>
            <SelfWorkspace />
          </>,
          shadow,
        )}
    </div>
  );
}
function QueryModal({
  title,
  children,
  onClose,
  footer,
  variant = '',
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  variant?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const old = document.activeElement as HTMLElement;
    ref.current?.focus();
    return () => old?.focus();
  }, []);
  return (
    <div
      className={`dlg-mask open ${variant ? variant + '-mask' : ''}`}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`dlg ${variant ? variant + '-dlg' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
        }}
      >
        <div className="dlg-head">
          <h3>{title}</h3>
          <button className="dlg-x" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        {children}
        <div className="dlg-actions">
          {footer || (
            <button className="dlg-cancel" onClick={onClose}>
              关闭
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
export function SelfWorkspace() {
  const query = useQuery(),
    templates = useTemplates();
  const [panel, setPanel] = useState('config'),
    [collapsed, setCollapsed] = useState(false),
    [view, setView] = useState('table'),
    [modal, setModal] = useState(''),
    [name, setName] = useState(''),
    [error, setError] = useState(''),
    [tmpMetrics, setTmpMetrics] = useState<Record<string, boolean>>({}),
    [toast, setToast] = useState('');
  const [logType, setLogType] = useState('全部'),
    [logTemplate, setLogTemplate] = useState('全部');
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(timer);
  }, [toast]);
  const scope = [
    query.engine.orgScopeText(),
    CALIBER[query.config.caliber].label,
    PERIOD(query.config.period).label,
    SHIP_TYPE[query.config.ship].label,
  ].join(' ｜ ');
  function manage() {
    setTmpMetrics({
      ...query.config.metrics,
    });
    setError('');
    setModal('metrics');
  }
  return (
    <div className={`self-analysis-root ${collapsed ? 'collapsed' : ''}`}>
      <div className="page">
        <aside className="side-panel">
          <button id="sideExpand" title="展开左侧栏" onClick={() => setCollapsed(false)}>
            ›
          </button>
          <div className="side-tabs">
            <button
              className={`stab ${panel === 'mine' ? 'active' : ''}`}
              onClick={() => setPanel('mine')}
            >
              我的模板
            </button>
            <button
              className={`stab ${panel === 'config' ? 'active' : ''}`}
              onClick={() => setPanel('config')}
            >
              配置查询
            </button>
            <button className="collapse-btn" title="收起左侧栏" onClick={() => setCollapsed(true)}>
              ‹
            </button>
          </div>
          {panel === 'config' ? (
            <QuerySidebar query={query} />
          ) : (
            <div className="panel-view">
              <TemplateList
                controller={templates}
                onUse={(t) => {
                  const config = templateConfig(t);
                  query.setConfig(config);
                  query.run(config);
                  templates.log('使用模板', t.name, '套用配置并查询');
                  setToast('已应用模板：' + t.name);
                }}
                onLogs={() => setModal('logs')}
              />
            </div>
          )}
          {query.dirty && (
            <div className="chg-banner">查询配置已变更，请点击查询数据刷新结果。</div>
          )}
          <div className="side-actions">
            <button
              className="btn-ghost"
              onClick={() => {
                setName('');
                setError('');
                setModal('save');
              }}
            >
              保存为新模板
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                query.run();
                setToast('查询完成');
              }}
            >
              <QueryIcon kind="search" />
              查询数据
            </button>
          </div>
        </aside>
        <main className="main-area">
          <div className="title-block">
            <span className="title-bar" />
            <div>
              <h1>自助分析</h1>
              <p>支持按组织、时间、货类、船型等维度灵活组合查询，并自动生成重点指标与明细数据。</p>
            </div>
          </div>
          <section className="sum-strip">
            <span className="sum-ic">
              <QueryIcon kind="layers" />
            </span>
            <b>干散货收入分析总览</b>
            <i>—</i>
            <span className="sum-scope">
              当前筛选: <b>{scope}</b>
            </span>
          </section>
          <QueryKpis query={query} onManage={manage} />
          <section className="panel-card">
            <div className="seg-row">
              <div className="seg">
                {[
                  ['table', '明细表格'],
                  ['trend', '趋势图表'],
                  ['comp', '构成图表'],
                ].map(([k, label]) => (
                  <button
                    className={`seg-btn ${view === k ? 'active' : ''}`}
                    key={k}
                    onClick={() => setView(k)}
                  >
                    <QueryIcon kind={k === 'table' ? 'grid' : 'chart'} />
                    {label}
                  </button>
                ))}
              </div>
              <span className="seg-note">用于展示当前查询条件下的明细数据</span>
            </div>
            {view === 'table' ? (
              <QueryTable query={query} />
            ) : (
              <QueryCharts query={query} composition={view === 'comp'} />
            )}
          </section>
        </main>
      </div>
      {toast && (
        <div className="toast show" role="status">
          {toast}
        </div>
      )}
      {modal === 'save' && (
        <QueryModal
          title="保存为新模板"
          onClose={() => setModal('')}
          footer={
            <>
              <button className="dlg-cancel" onClick={() => setModal('')}>
                取消
              </button>
              <button
                className="dlg-save"
                onClick={() => {
                  const message = templates.save(name, query.config);
                  if (message) setError(message);
                  else {
                    setModal('');
                    setPanel('mine');
                    setToast('模板已保存');
                  }
                }}
              >
                保存
              </button>
            </>
          }
        >
          <p className="dlg-sub">
            将当前筛选条件、展示指标与排序一并保存，下次在「我的模板」一键套用即可：
            <br />
            <b>{scope}</b>
          </p>
          <div className="dlg-field">
            <input
              aria-label="模板名称"
              placeholder="如：沿江煤炭 8 月明细"
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="dlg-warn">{error}</div>
        </QueryModal>
      )}
      {modal === 'metrics' && (
        <QueryModal
          variant="met"
          title="管理展示指标"
          onClose={() => setModal('')}
          footer={
            <>
              <button className="dlg-cancel" onClick={() => setModal('')}>
                取消
              </button>
              <button
                className="dlg-save"
                onClick={() => {
                  if (!Object.values(tmpMetrics).some(Boolean)) {
                    setError('至少选择 1 个指标');
                    return;
                  }
                  query.patch({
                    metrics: tmpMetrics,
                  });
                  setModal('');
                }}
              >
                保存展示配置
              </button>
            </>
          }
        >
          <div className="met-count-row">
            至少 1 个，最多 6 个 <b>已选 {Object.values(tmpMetrics).filter(Boolean).length} / 6</b>
          </div>
          <div className="met-scroll">
            <MetricsOptions selected={tmpMetrics} onChange={setTmpMetrics} max={6} />
          </div>
          <div className="dlg-warn">{error}</div>
        </QueryModal>
      )}
      {modal === 'logs' && (
        <QueryModal variant="log" title="我的模板操作日志" onClose={() => setModal('')}>
          <div className="log-filters">
            <label>
              模板{' '}
              <select value={logTemplate} onChange={(e) => setLogTemplate(e.target.value)}>
                {['全部', ...new Set(templates.logs.map((l) => l.tpl))].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label>
              操作{' '}
              <select value={logType} onChange={(e) => setLogType(e.target.value)}>
                {['全部', ...new Set(templates.logs.map((l) => l.type))].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="log-list">
            {templates.logs
              .filter(
                (l) =>
                  (logTemplate === '全部' || l.tpl === logTemplate) &&
                  (logType === '全部' || l.type === logType),
              )
              .map((l, i) => (
                <div className="log-item" key={i}>
                  <b>
                    {l.type} · {l.tpl}
                  </b>
                  <p>{l.desc}</p>
                  <small>{l.time}</small>
                </div>
              ))}
            {!templates.logs.length && <div className="log-empty">暂无符合条件的操作记录</div>}
          </div>
        </QueryModal>
      )}
    </div>
  );
}
