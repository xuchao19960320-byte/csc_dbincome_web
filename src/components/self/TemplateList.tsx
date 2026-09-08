import { useState } from 'react';
import { CALIBER, METRIC_META, SHIP_TYPE } from '../../data/self/catalog';
import { PERIOD } from '../../data/self/queryEngine';
import { QueryIcon } from './QuerySidebar';
import type { QueryTemplate } from '../../data/self/types';
import type { useTemplates } from '../../hooks/self/useTemplates';
export function TemplateList({
  controller,
  onUse,
  onLogs,
}: {
  controller: ReturnType<typeof useTemplates>;
  onUse: (t: QueryTemplate) => void;
  onLogs: () => void;
}) {
  const [menu, setMenu] = useState<string | null>(null);
  const def = controller.templates.find((t) => t.def) || controller.templates[0];
  if (!def)
    return (
      <div className="tpl-empty">
        还没有保存的模板
        <br />
        在「配置查询」设置好条件后
        <br />
        点击「保存为新模板」即可
      </div>
    );
  function more(t: QueryTemplate) {
    return (
      <span
        style={{
          position: 'relative',
        }}
      >
        <button
          className="tpl-more"
          title="更多操作"
          onClick={(e) => {
            e.stopPropagation();
            setMenu(menu === t.id ? null : t.id);
          }}
        >
          ⋯
        </button>
        {menu === t.id && (
          <div className="template-menu" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                onUse(t);
                setMenu(null);
              }}
            >
              使用并查询
            </button>
            <button
              onClick={() => {
                controller.makeDefault(t.id);
                setMenu(null);
              }}
            >
              {t.def ? '取消默认模板' : '设为默认模板'}
            </button>
            <button
              onClick={() => {
                if (window.confirm(`删除模板「${t.name}」？`)) controller.remove(t.id);
                setMenu(null);
              }}
            >
              删除模板
            </button>
          </div>
        )}
      </span>
    );
  }
  const keys = Object.keys(def.p.metrics).filter((k) => def.p.metrics[k]);
  return (
    <div className="tpl-list">
      <div
        className="tpl-hero"
        role="button"
        tabIndex={0}
        onClick={() => onUse(def)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onUse(def);
        }}
      >
        <div className="tpl-hero-top">
          <span className="tpl-badge">默认</span>
          {more(def)}
        </div>
        <b className="tpl-hero-name">{def.name}</b>
        <div className="tpl-row">
          <span className="tpl-rowlab">核心指标</span>
          <span className="tpl-chips">
            {keys.slice(0, 4).map((k) => (
              <span className="chip-tag met" key={k}>
                {METRIC_META[k]}
              </span>
            ))}
            {keys.length > 4 && <span className="chip-tag plus">+{keys.length - 4}</span>}
          </span>
        </div>
        <div className="tpl-row">
          <span className="tpl-rowlab">默认筛选</span>
          <span className="tpl-scope">
            {PERIOD(def.p.period).label} ｜ {SHIP_TYPE[def.p.ship]?.label} ｜{' '}
            {CALIBER[def.p.caliber]?.label}
          </span>
        </div>
      </div>
      <div className="tpl-sec">
        <QueryIcon kind="layers" />
        我的其他模板
        <button className="tpl-log" onClick={onLogs}>
          操作日志
        </button>
      </div>
      {controller.templates
        .filter((t) => t !== def)
        .map((t) => (
          <div
            className="tpl-item"
            key={t.id}
            role="button"
            tabIndex={0}
            onClick={() => onUse(t)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onUse(t);
            }}
          >
            <div className="tpl-item-top">
              <span className="tpl-item-ic">
                <QueryIcon kind="layers" />
              </span>
              <b>{t.name}</b>
              {more(t)}
            </div>
            <p>{t.desc}</p>
            <div className="tpl-meta">
              核心指标 {Object.values(t.p.metrics).filter(Boolean).length} 项
            </div>
          </div>
        ))}
    </div>
  );
}
