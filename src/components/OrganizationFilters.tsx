import { useEffect, useRef, useState } from 'react';
import { companies } from '../data/fleet';
import { state, update } from '../hooks/dashboardStore';
const months = Array.from({ length: 20 }, (_, i) => { const d = new Date(2026, 7-i, 1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; });
export function OrganizationFilters() {
  const [open, setOpen] = useState(false), [query, setQuery] = useState(''), [expanded, setExpanded] = useState(true);
  const picker = useRef<HTMLDivElement>(null), input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const outside = (e: MouseEvent) => { if (!picker.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('click', outside); return () => document.removeEventListener('click', outside);
  }, []);
  useEffect(() => { if (open) input.current?.focus(); }, [open]);
  const matches = companies.filter(n => n.includes(query.trim())), rootMatch = '长航总部'.includes(query.trim());
  const choose = (name: string) => { update('org', name); setOpen(false); };
  return <div className="filters"><div className="filter"><span>组织：</span><div className="org-picker" ref={picker} onKeyDown={e => { if(e.key === 'Escape')setOpen(false); }}><button id="org-trigger" aria-expanded={open} aria-controls="org-popup" onClick={() => setOpen(!open)}>{state.org === '全部二级组织' ? '长航总部' : state.org} <span>⌄</span></button><div id="org-popup" hidden={!open}><input ref={input} id="org-search" type="search" placeholder="搜索组织名称" aria-label="搜索组织名称" value={query} onChange={e => setQuery(e.target.value)}/><div id="org-tree" role="tree" aria-label="组织树">{matches.length || rootMatch ? <><div className="tree-parent"><button onClick={() => setExpanded(!expanded)} aria-label={expanded ? '收起长航总部' : '展开长航总部'}>{expanded ? '▾' : '▸'}</button><button className={`tree-choice ${state.org === '全部二级组织' ? 'selected' : ''}`} role="treeitem" aria-selected={state.org === '全部二级组织'} onClick={() => choose('全部二级组织')}>长航总部</button></div>{(expanded || query) && <div role="group">{(rootMatch ? companies : matches).map(n => <button key={n} className={`tree-choice tree-child ${state.org === n ? 'selected' : ''}`} role="treeitem" aria-selected={state.org === n} onClick={() => choose(n)}>{n}</button>)}</div>}</> : <div className="empty-tree">未找到匹配的组织</div>}</div></div></div></div><div className="filter"><span>统计月份：</span><select id="month" aria-label="统计月份" value={state.month} onChange={e => update('month', e.target.value)}>{months.map(m => <option key={m}>{m}</option>)}</select></div><span className="note">原型示例数据</span></div>;
}
