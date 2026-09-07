import { useEffect, useState } from 'react';
import { DEF_TPL, ORG_ALLK } from '../../data/self/catalog';
import { initialQuery } from './useQuery';
import type { QueryConfig, QueryTemplate, TemplateLog } from '../../data/self/types';
const KEY = 'ch_rev_query_templates_v2';
export function templateConfig(t: QueryTemplate): QueryConfig {
  return { ...structuredClone(initialQuery), ...t.p, orgSel: Object.fromEntries(ORG_ALLK().map(k => [k,t.p.org.includes(k)])), metrics: {...t.p.metrics}, dims: [...t.p.dims], sortKey: t.p.sortKey as QueryConfig['sortKey'], sortDir: t.p.sortDir === 'asc' ? 'asc' : 'desc' };
}
export function useTemplates() {
  const [templates, setTemplates] = useState<QueryTemplate[]>(() => {
    try { const data = JSON.parse(localStorage.getItem(KEY) || 'null'); if(Array.isArray(data) && data.length && data.every(t=>t.p?.period?.y && Array.isArray(t.p.org))) return data; } catch { /* Local storage is optional. */ }
    return structuredClone(DEF_TPL) as QueryTemplate[];
  });
  const [logs,setLogs] = useState<TemplateLog[]>([]);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(templates)); } catch { /* Private mode. */ } }, [templates]);
  function log(type: string, tpl: string, desc: string) { setLogs(ls => [{time:new Date().toLocaleString('zh-CN'),type,tpl,desc},...ls].slice(0,100)); }
  function save(name: string, config: QueryConfig) {
    if (!name.trim()) return '请输入模板名称';
    if (templates.some(t=>t.name===name.trim())) return '模板名称已存在';
    const item: QueryTemplate = { id: crypto.randomUUID(), name:name.trim(), desc:`保存的组合查询 · 含 ${Object.values(config.metrics).filter(Boolean).length} 项展示指标 · ${config.dims.length} 个分析维度。`,def:!templates.length,time:new Date().toLocaleString('zh-CN'), p:{org:ORG_ALLK().filter(k=>config.orgSel[k]),period:{...config.period},caliber:config.caliber,ship:config.ship,cargo:config.cargo,dims:[...config.dims],metrics:{...config.metrics},sortKey:config.sortKey,sortDir:config.sortDir} };
    setTemplates(ts=>[...ts,item]); log('保存模板',item.name,'保存当前查询配置'); return '';
  }
  function remove(id: string) { const t=templates.find(t=>t.id===id); if(!t)return; setTemplates(ts=>{const remaining=ts.filter(t=>t.id!==id);if(t.def&&remaining[0])remaining[0]={...remaining[0],def:true};return remaining;});log('删除模板',t.name,'删除已保存模板'); }
  function makeDefault(id:string) { setTemplates(ts=>ts.map(t=>({...t,def:t.id===id})));log('设为默认',templates.find(t=>t.id===id)?.name||'','更新默认模板'); }
  return { templates,logs,save,remove,makeDefault,log };
}
