import type { ChartSeries } from '../data/types';
import { Fragment } from 'react';
import { state } from '../hooks/dashboardStore';
import { monthlyDates } from '../data/selectors';
import { fmt } from '../utils/format';
import { bars } from './DistributionCharts';
import { css } from '../utils/css';
export function comboChart(series: ChartSeries[], leftUnit: string, rightUnit?: string) {
  const allSeries = series;
  series = series.filter((s) => !state.hiddenSeries[state.trendTab + '|' + s.name]);
  const dates = monthlyDates(),
    bars = series.filter((s) => s.kind === 'bar'),
    maxFor = (axis) => {
      const vals = series.filter((s) => (s.axis || 'left') === axis).flatMap((s) => s.values);
      return Math.max(1, ...vals) * 1.15;
    },
    maxL = maxFor('left'),
    maxR = maxFor('right'),
    x = (i) => 78 + i * 89,
    y = (v, axis) => 280 - (v / (axis === 'right' ? maxR : maxL)) * 220;
  return (
    <>
      <div className="combo-scroll">
        <svg
          className="combo-chart"
          viewBox="0 0 1140 340"
          role="img"
          aria-label={series.map((s) => s.name).join('、') + '，近12个月趋势'}
        >
          <text x="30" y="22" fill="#8595aa">
            {leftUnit}
          </text>
          {rightUnit ? (
            <text x="1105" y="22" textAnchor="end" fill="#8595aa">
              {rightUnit}
            </text>
          ) : (
            ''
          )}
          {[0, 1, 2, 3, 4].map((j, _index) => {
            const yy = 280 - j * 55;
            return (
              <Fragment key={_index}>
                <>
                  <path d={'M42 ' + yy + 'H1090'} stroke="#e9eef6" strokeDasharray="4 5" />
                  <text x="34" y={yy + 4} textAnchor="end" fill="#8293ab">
                    {fmt((maxL * j) / 4, maxL < 20 ? 1 : 0)}
                  </text>
                  {rightUnit ? (
                    <text x="1100" y={yy + 4} fill="#8293ab">
                      {fmt((maxR * j) / 4, maxR < 20 ? 1 : 0)}
                    </text>
                  ) : (
                    ''
                  )}
                </>
              </Fragment>
            );
          })}
          {bars.map((s, j) =>
            s.values.map((v, i) => (
              <Fragment key={i}>
                <rect
                  x={x(i) + (j - (bars.length - 1) / 2) * 14 - 6}
                  y={y(v, s.axis)}
                  width="12"
                  height={280 - y(v, s.axis)}
                  rx="2"
                  fill={s.color}
                  data-tip={dates[i] + '\n' + s.name + '：' + fmt(v, 2) + ' ' + s.unit}
                >
                  <title>{'' + dates[i] + ' ' + s.name + '：' + fmt(v, 2) + ' ' + s.unit}</title>
                </rect>
              </Fragment>
            )),
          )}
          {series
            .filter((s) => s.kind === 'line')
            .map((s, _index2) => (
              <Fragment key={_index2}>
                <>
                  <polyline
                    points={s.values.map((v, i) => `${x(i)},${y(v, s.axis)}`).join(' ')}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="2.2"
                    {...(s.dash
                      ? {
                          strokeDasharray: '6 5',
                        }
                      : {})}
                  />
                  {s.values.map((v, i) => (
                    <Fragment key={i}>
                      <circle
                        cx={x(i)}
                        cy={y(v, s.axis)}
                        r="3"
                        fill={s.color}
                        data-tip={dates[i] + '\n' + s.name + '：' + fmt(v, 2) + ' ' + s.unit}
                      >
                        <title>
                          {'' + dates[i] + ' ' + s.name + '：' + fmt(v, 2) + ' ' + s.unit}
                        </title>
                      </circle>
                    </Fragment>
                  ))}
                </>
              </Fragment>
            ))}
          {dates.map((d, i) => (
            <Fragment key={i}>
              <rect
                className="month-hover"
                x={x(i) - 44.5}
                y="40"
                width="89"
                height="250"
                fill="transparent"
                tabIndex={0}
                aria-label={d + '月度指标'}
                data-tip={
                  d +
                  '\n' +
                  allSeries
                    .map((item) => item.name + '：' + fmt(item.values[i], 2) + ' ' + item.unit)
                    .join('\n')
                }
              />
            </Fragment>
          ))}
          {dates.map((d, i) => (
            <Fragment key={i}>
              <text x={x(i)} y="311" textAnchor="middle" fill="#798da6">
                {d.slice(5) === '01' ? d.slice(2, 4) + '年1月' : Number(d.slice(5)) + '月'}
              </text>
            </Fragment>
          ))}
        </svg>
      </div>
      <div className="combo-legend">
        {series.map((s, _index3) => (
          <Fragment key={_index3}>
            <span>
              <i
                className={
                  (s.kind === 'line' ? 'legend-stroke' : '') + ' ' + (s.dash ? 'dashed' : '')
                }
                style={css('--series:' + s.color)}
              />
              {s.name}
            </span>
          </Fragment>
        ))}
      </div>
    </>
  );
}
