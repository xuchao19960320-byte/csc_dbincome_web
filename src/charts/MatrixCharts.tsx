import type { ShipRecord, MatrixShip } from '../data/types';
import { Fragment } from 'react';
import { state, trackTimer } from '../hooks/dashboardStore';
import { historyPoint, monthlyDates, multiRadius, matrixTip, shipMetric } from '../data/selectors';
import { colors, allTypes, shipRecords } from '../data/fleet';
import { css } from '../utils/css';
import { fmt } from '../utils/format';
export function boatMark(
  s: ShipRecord,
  x: number,
  y: number,
  size: number,
  color: string,
  attrs: import('react').SVGProps<SVGGElement> & Record<string, unknown> = {},
) {
  const sea = s.fleet === '海船';
  return (
    <g key={s.id} transform={'translate(' + x + ' ' + y + ')'} className="boat-mark" {...attrs}>
      <svg
        x={-size}
        y={-size}
        width={size * 2}
        height={size * 2}
        viewBox="0 0 200 200"
        aria-hidden="true"
      >
        <path d="M4 119H200L179 160Q174 172 154 172H22Q16 172 20 161Q-1 145 4 119Z" fill={color} />
        <path d="M8 70H44V118H8Z M0 65H50V73H0Z M26 30H30V65H26Z M16 49H37V56H16Z" fill={color} />
        <path d="M30 76H38V87H30Z M30 94H38V106H30Z" fill="white" fillOpacity=".9" />
        {sea ? (
          <>
            <rect x="52" y="82" width="35" height="34" rx="5" fill="#ff9b23" />
            <rect x="94" y="72" width="33" height="44" rx="5" fill="#00aabc" />
            <rect x="133" y="85" width="35" height="22" rx="5" fill="#00aabc" />
          </>
        ) : (
          <>
            <path d="M52 102Q67 82 83 102Q99 78 117 102Q135 86 152 102V116H52Z" fill="#eeb94e" />
            <path d="M53 116H170V106H53Z" fill="#00aabc" />
          </>
        )}
        <path d="M5 118H195" stroke="white" strokeOpacity=".65" strokeWidth="2" />
      </svg>
    </g>
  );
}
export function matrixChart(rows: MatrixShip[]) {
  const chosen = rows.find((s) => s.id === state.matrixSelected),
    step = state.matrixStep;
  return (
    <div>
      <div className="multi-scroll">
        <svg
          className="matrix-svg"
          viewBox="0 0 1080 510"
          role="img"
          aria-label="营运效率和TCE九宫格"
        >
          <text x="50" y="20">
            {'Y · 营运竞争力（全体船舶月度营运率排名）'}
          </text>
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c, _index) => (
              <Fragment key={_index}>
                <>
                  <rect
                    x={80 + c * 310}
                    y={42 + r * 135}
                    width="310"
                    height="135"
                    fill={r + 2 - c < 2 ? '#f0faf6' : r + 2 - c === 2 ? '#fffbf0' : '#fff3f5'}
                    stroke="#d5dfed"
                  />
                  <text x={92 + c * 310} y={63 + r * 135}>
                    {'营运'}
                    {['高', '中', '低'][r]}
                    {' · '}
                    {['跑输市场', '与市场持平', '跑赢市场'][c]}
                  </text>
                </>
              </Fragment>
            )),
          )}
          {['高 · 前30%', '中 · 中间40%', '低 · 后30%'].map((v, i) => (
            <Fragment key={i}>
              <text x="72" y={115 + i * 135} textAnchor="end">
                {v}
              </text>
            </Fragment>
          ))}
          {chosen ? (
            <>
              <polyline
                points={Array.from(
                  {
                    length: step + 1,
                  },
                  (_, i) => {
                    const p = historyPoint(chosen, i);
                    return p.x + ',' + p.y;
                  },
                ).join(' ')}
                fill="none"
                stroke="#267cff"
                strokeWidth="2"
                strokeDasharray="5 4"
              />
              {Array.from(
                {
                  length: step + 1,
                },
                (_, i) => {
                  const p = historyPoint(chosen, i);
                  return (
                    <Fragment key={i}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill="#267cff"
                        data-tip={
                          chosen.name +
                          '\n' +
                          monthlyDates()[i] +
                          '\n营运' +
                          ['高', '中', '低'][p.op] +
                          ' · ' +
                          ['跑赢', '持平', '跑输'][p.tier]
                        }
                      />
                    </Fragment>
                  );
                },
              )}
            </>
          ) : (
            ''
          )}
          {rows.map((s) => {
            const p = historyPoint(s, s.id === state.matrixSelected ? step : 11);
            return boatMark(s, p.x, p.y, multiRadius(s), colors[allTypes.indexOf(s.type)], {
              tabIndex: 0,
              role: 'button',
              'aria-label': '查看' + s.name + '轨迹',
              'data-matrix-ship': s.id,
              opacity: chosen && chosen.id !== s.id ? 0.25 : 1,
              'data-tip': matrixTip(s),
            });
          })}
          {['第三档 · 跑输市场', '第二档 · 与市场持平', '第一档 · 跑赢市场'].map((t, i) => (
            <Fragment key={i}>
              <text x={235 + i * 310} y="474" textAnchor="middle">
                {t}
              </text>
            </Fragment>
          ))}
          <text x="1010" y="503" textAnchor="end">
            {'X · TCE竞争力'}
          </text>
        </svg>
      </div>
      <div className="matrix-play">
        <button
          data-play-track=""
          {...(chosen
            ? {}
            : {
                disabled: true,
              })}
        >
          {trackTimer ? '暂停' : '▶ 播放'}
        </button>
        <input
          aria-label="轨迹月份"
          id="track-step"
          type="range"
          min="0"
          max="11"
          value={step}
          onChange={() => {}}
          {...(chosen
            ? {}
            : {
                disabled: true,
              })}
        />
        <span>{monthlyDates()[step]}</span>
        {chosen ? (
          <>
            <b>{chosen.name}</b>
            <button data-open-ship={chosen.id}>{'单船详情 ›'}</button>
            <button data-clear-track="">{'清除选择'}</button>
          </>
        ) : (
          <span>{'选择船舶查看近12个月示例轨迹'}</span>
        )}
      </div>
    </div>
  );
}
export function comparisonChart(rows: MatrixShip[]) {
  const ratio = (s) =>
      ((shipMetric(s, 'income') - shipMetric(s, 'cost')) / shipMetric(s, 'income')) * 100,
    group = shipRecords.reduce((a, s) => a + ratio(s), 0) / shipRecords.length,
    bench = (s) => (state.multiBenchmark === '与集团比' ? group : ratio(s) / s.ratio),
    max = Math.max(40, ...rows.map((s) => Math.max(ratio(s), bench(s)))) * 1.08,
    x = (v) => 50 + (v / max) * 510,
    y = (v) => 350 - (v / max) * 300;
  return (
    <>
      <div className="helper">
        {
          '横轴：基准毛利率\u3000纵轴：单船毛利率；斜线上方跑赢，船形标记经避让展示，连接线指向真实坐标。'
        }
      </div>
      <div className="legend">
        <span>
          <i style={css('background:#20b782')} />
          {'跑赢'}
        </span>
        <span>
          <i style={css('background:#ee6a72')} />
          {'跑输'}
        </span>
      </div>
      <svg
        className="compare-svg"
        viewBox="0 0 620 415"
        role="img"
        aria-label="单船与基准毛利率对比"
      >
        <path d="M50 350V50H560Z" fill="#f0faf6" />
        <path d="M50 350H560V50Z" fill="#fff4f5" />
        <path d="M50 50V350H560M50 350L560 50" fill="none" stroke="#94a5b9" strokeDasharray="5 4" />
        {[0, 1, 2, 3, 4].map((i, _index2) => (
          <Fragment key={_index2}>
            <>
              <text x={x((max * i) / 4)} y="373" textAnchor="middle">
                {fmt((max * i) / 4, 1)}
                {'%'}
              </text>
              <text x="42" y={y((max * i) / 4) + 4} textAnchor="end">
                {fmt((max * i) / 4, 1)}
                {'%'}
              </text>
            </>
          </Fragment>
        ))}
        {(() => {
          const placed = [];
          return rows.map((s, _index3) => {
            const ax = x(bench(s)),
              ay = y(ratio(s));
            let px = ax,
              py = ay;
            for (
              let k = 0;
              k < 100 && placed.some((p) => Math.hypot(p.x - px, p.y - py) < 32);
              k++
            ) {
              const a = k * 2.4,
                r = 12 + Math.sqrt(k) * 13;
              px = Math.max(68, Math.min(540, ax + Math.cos(a) * r));
              py = Math.max(65, Math.min(332, ay + Math.sin(a) * r));
            }
            placed.push({
              x: px,
              y: py,
            });
            return (
              <Fragment key={_index3}>
                <>
                  <path
                    d={'M' + ax + ' ' + ay + 'L' + px + ' ' + py}
                    stroke="#aebacc"
                    strokeWidth="1"
                  />
                  {boatMark(s, px, py, 15, ratio(s) >= bench(s) ? '#20b782' : '#ee6a72', {
                    'data-open-ship': s.id,
                    tabIndex: 0,
                    role: 'link',
                    'aria-label': '查看' + s.name,
                    'data-tip':
                      s.name +
                      '\n单船毛利率：' +
                      fmt(ratio(s), 2) +
                      '%\n基准毛利率：' +
                      fmt(bench(s), 2) +
                      '%',
                  })}
                </>
              </Fragment>
            );
          });
        })()}
        <text x="310" y="405" textAnchor="middle">
          {'X · '}
          {state.multiBenchmark === '与集团比' ? '集团' : '市场'}
          {'毛利率（%）'}
        </text>
        <text x="50" y="24">
          {'Y · 单船毛利率（%）'}
        </text>
      </svg>
    </>
  );
}
export function revenueMap(rows: MatrixShip[]) {
  const value = (s) =>
    state.structureMetric === '业务毛利'
      ? shipMetric(s, 'income') - shipMetric(s, 'cost')
      : shipMetric(
          s,
          {
            业务收入: 'income',
            业务成本: 'cost',
            货运量: 'cargo',
          }[state.structureMetric],
        );
  const ranked = [...rows].sort((a, b) => value(b) - value(a));
  const palette = [
    '#729ee8',
    '#6dc5b2',
    '#ac8be0',
    '#efb75a',
    '#ed8994',
    '#6dc5dd',
    '#9098e3',
    '#b8cf71',
    '#df9bc9',
    '#e39b6c',
  ];
  const sum = rows.reduce((a, s) => a + value(s), 0);
  function tiles(items, x, y, w, h) {
    if (!items.length) return '';
    if (items.length === 1) {
      const s = items[0];
      return (
        <g
          data-open-ship={s.id}
          tabIndex={0}
          role="link"
          aria-label={'查看' + s.name}
          data-tip={
            s.name +
            '\n' +
            s.fleet +
            ' · ' +
            s.type +
            '\n' +
            state.structureMetric +
            '：' +
            fmt(value(s), 2) +
            ' ' +
            (state.structureMetric === '货运量' ? '万吨' : '万元') +
            '\n占比：' +
            fmt((value(s) / sum) * 100, 2) +
            '%'
          }
        >
          <rect
            x={x}
            y={y}
            width={w}
            height={h}
            fill={
              ranked.findIndex((v) => v.id === s.id) < 10
                ? palette[ranked.findIndex((v) => v.id === s.id)]
                : '#e7ebf1'
            }
            stroke="white"
            strokeWidth="3"
          />
          <text x={x + w / 2} y={y + h / 2} textAnchor="middle">
            {s.name}
          </text>
          <text x={x + w / 2} y={y + h / 2 + 17} textAnchor="middle">
            {fmt((value(s) / sum) * 100, 1)}
            {'%'}
          </text>
        </g>
      );
    }
    const half = Math.ceil(items.length / 2),
      a = items.slice(0, half),
      b = items.slice(half),
      part = a.reduce((n, s) => n + value(s), 0) / items.reduce((n, s) => n + value(s), 0);
    return w > h ? (
      <>
        {tiles(a, x, y, w * part, h)}
        {tiles(b, x + w * part, y, w * (1 - part), h)}
      </>
    ) : (
      <>
        {tiles(a, x, y, w, h * part)}
        {tiles(b, x, y + h * part, w, h * (1 - part))}
      </>
    );
  }
  return (
    <>
      <div className="helper">
        {'矩形面积代表'}
        {state.structureMetric}
        {'占比，前10名使用不同彩色，其余灰色。'}
      </div>
      <svg className="revenue-map" viewBox="0 0 620 380" role="img" aria-label="船舶收入结构">
        {tiles(ranked, 0, 0, 620, 380)}
      </svg>
    </>
  );
}
