import { Fragment } from 'react';
import { colors } from '../data/fleet';
import { donutTip, unit, total } from '../data/selectors';
import { state } from '../hooks/dashboardStore';
import { css } from '../utils/css';
import { fmt } from '../utils/format';
export function donut(labels, shares, center, sub, key = undefined, selected = undefined) {
  let offset = 0;
  return (
    <div className="donut-wrap">
      <svg
        viewBox="0 0 200 200"
        aria-label={labels.map((l, i) => l + ' ' + shares[i] + '%').join('，')}
        role="img"
      >
        {shares.map((v, i) => {
          let s = (
            <circle
              className="segment"
              cx="100"
              cy="100"
              r="74"
              pathLength="100"
              stroke={colors[i]}
              strokeDasharray={v - 0.8 + ' ' + (100 - v + 0.8)}
              strokeDashoffset={-offset}
              opacity={selected && selected !== labels[i] && selected !== '全部公司' ? 0.4 : 1}
              {...(key
                ? {
                    'data-key': key,
                    'data-value': labels[i],
                    tabIndex: 0,
                    role: 'button',
                    'aria-label': labels[i] + ' ' + v + '%',
                  }
                : {})}
              data-tip={donutTip(labels[i], v, i, key)}
            />
          );
          offset += v;
          return <Fragment key={i}>{s}</Fragment>;
        })}
      </svg>
      <div className="donut-center">
        {center}
        <strong>{sub}</strong>
        <small>
          {key === 'company'
            ? '艘次'
            : unit(key === 'river' ? state.riverMetric : state.cargoMetric)}
        </small>
      </div>
    </div>
  );
}
export function structureTable(names, shares, m, key, selected) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{'货类'}</th>
            <th>
              {m}
              <small>
                {' ('}
                {unit(m)}
                {')'}
              </small>
            </th>
            <th>{'占比'}</th>
            <th>{'同比'}</th>
            <th>{'环比'}</th>
          </tr>
        </thead>
        <tbody>
          {names.map((n, i) => (
            <Fragment key={i}>
              <tr
                className={(key ? 'clickable' : '') + ' ' + (selected === n ? 'selected' : '')}
                {...(key
                  ? {
                      'data-key': key,
                      'data-value': n,
                      tabIndex: 0,
                      role: 'button',
                      'aria-label': '查看' + n + '船型',
                    }
                  : {})}
              >
                <td>
                  <i className="dot" style={css('background:' + colors[i])} />
                  {n}
                </td>
                <td>{fmt((total(m) * shares[i]) / 100, 2)}</td>
                <td>
                  {shares[i].toFixed(2)}
                  {'%'}
                </td>
                <td className="up">
                  {'+'}
                  {(8.6 - i * 1.8).toFixed(2)}
                  {'%'}
                </td>
                <td className={i === 1 ? 'down' : 'up'}>
                  {i === 1 ? '-2.10' : '+3.25'}
                  {'%'}
                </td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function bars(names: string[], series: number[][], line = true) {
  let max = Math.ceil(Math.max(...series.flat()) / 10) * 10 || 10;
  let base = 177,
    top = 20,
    step = 515 / names.length,
    y = (v) => base - (v / max) * (base - top);
  return (
    <svg
      className="chart"
      viewBox="0 0 600 215"
      role="img"
      aria-label={names.join('、') + '，' + (line ? '日均TCE、保本点、航交所TCE' : '船型数据')}
    >
      {[0, 1, 2, 3, 4].map((i, _index) => {
        let yy = base - (i * (base - top)) / 4;
        return (
          <Fragment key={_index}>
            <>
              <path d={'M45 ' + yy + 'H590'} stroke="#e8eef6" strokeDasharray={i ? '4 5' : '0'} />
              <text x="34" y={yy + 4} textAnchor="end">
                {fmt((max * i) / 4, max < 10 ? 1 : 0)}
              </text>
            </>
          </Fragment>
        );
      })}
      {names.map((n, i) => {
        let x = 52 + step * (i + 0.5),
          bw = Math.min(26, step / 5);
        return (
          <Fragment key={i}>
            <>
              {series.slice(0, line ? 2 : 1).map((s, j) => (
                <Fragment key={j}>
                  <>
                    <rect
                      x={x + (j === 0 ? -bw - 3 : 3)}
                      y={y(s[i])}
                      width={line ? bw : bw * 1.6}
                      height={base - y(s[i])}
                      rx="3"
                      fill={j ? '#28c797' : '#2786ff'}
                      data-tip={
                        n +
                        '\n' +
                        (line ? (j ? '保本点' : '日均TCE') : state.riverMetric) +
                        '：' +
                        fmt(s[i], 2) +
                        ' ' +
                        (line ? '万元' : unit(state.riverMetric))
                      }
                    />
                    <text
                      className="vlabel"
                      x={x + (j === 0 ? -bw / 2 - 3 : bw / 2 + 3)}
                      y={y(s[i]) - 7}
                      textAnchor="middle"
                    >
                      {fmt(s[i], max > 100 ? 0 : 2)}
                    </text>
                  </>
                </Fragment>
              ))}
              <text x={x} y="201" textAnchor="middle">
                {n}
              </text>
            </>
          </Fragment>
        );
      })}
      {line ? (
        <>
          <polyline
            points={names.map((n, i) => `${52 + step * (i + 0.5)},${y(series[2][i])}`).join(' ')}
            fill="none"
            stroke="#ffc443"
            strokeWidth="2"
          />
          {names.map((n, i) => (
            <Fragment key={i}>
              <circle
                cx={52 + step * (i + 0.5)}
                cy={y(series[2][i])}
                r="3.5"
                fill="#ffc443"
                stroke="white"
                data-tip={n + '\n航交所TCE：' + fmt(series[2][i], 2) + ' 万元'}
              />
            </Fragment>
          ))}
        </>
      ) : (
        ''
      )}
    </svg>
  );
}
export const tceLegend = () => (
  <div className="legend">
    <span>
      <i style={css('background:#2786ff')} />
      {'日均TCE'}
    </span>
    <span>
      <i style={css('background:#28c797')} />
      {'保本点'}
    </span>
    <span>
      <i className="line-key" />
      {'航交所TCE'}
    </span>
  </div>
);
