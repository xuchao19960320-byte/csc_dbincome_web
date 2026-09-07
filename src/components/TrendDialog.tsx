import { useEffect, useRef } from 'react';
import { state } from '../hooks/dashboardStore';
import { factor } from '../data/selectors';
import { fmt } from '../utils/format';
export function TrendDialog({ index: i, period, onClose }: { index: number; period: string; onClose: () => void }) {
const ref = useRef<HTMLDialogElement>(null);
useEffect(() => { const old = document.activeElement as HTMLElement; ref.current?.showModal(); return () => { old?.focus(); }; }, []);
const yearly = period === 'year',
  names = ['收入', '成本', '毛利', '货运量', '周转量'],
  label = i === 5 ? yearly ? '保本点' : '日均TCE' : (yearly ? '当年' : '当月') + names[i],
  u = i === 3 ? '万吨' : i === 4 ? '万吨/千米' : '万元',
  current = Math.round((yearly ? i === 5 ? 1111 : 9999 : 2222) * factor());
const ratios = [.76, .65, .7, .74, .76, .83, .88, .87, .91, .96, .94, 1],
  data = ratios.map(v => Math.round(current * v * 100) / 100),
  dates = Array.from({
    length: 12
  }, (_, j) => {
    const [y, m] = state.month.split('-').map(Number);
    const d = new Date(y, m - 1 - 11 + j, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
const lo = Math.floor(Math.min(...data) * .9 / 100) * 100,
  hi = Math.ceil(current * 1.12 / 100) * 100,
  x = j => 65 + j * 74,
  y = v => 245 - (v - lo) / (hi - lo) * 185,
  pts = data.map((v, j) => [x(j), y(v)]);
let path = `M${pts[0].join(' ')}`;
for (let j = 1; j < pts.length; j++) {
  const a = pts[j - 1],
    b = pts[j],
    mid = (a[0] + b[0]) / 2;
  path += ` C${mid} ${a[1]} ${mid} ${b[1]} ${b[0]} ${b[1]}`;
}
return <dialog ref={ref} className="trend-dialog" aria-labelledby="trend-heading" onClose={onClose} onClick={e => { if ((e.target as HTMLElement).id === 'trend-close') ref.current?.close(); if(e.target===ref.current){const r=ref.current.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)ref.current.close();} }}><><div className={"trend-head"}><div className={"trend-title"}><strong id={"trend-heading"}>{label}</strong><span>{"\u8FD1 12 \u4E2A\u6708\u8D8B\u52BF"}</span><button id={"trend-close"} aria-label={"\u5173\u95ED\u8D8B\u52BF"}>{"\xD7"}</button></div><div className={"trend-number"}>{fmt(current, 2)}<small>{u}</small></div><div className={"trend-context"}>{dates[0]}{" \u81F3 "}{dates[11]}{" \xB7 "}{state.org === '全部二级组织' ? '长航总部' : state.org}{" \xB7 "}{yearly && i !== 5 ? '各月年内累计 · ' : ''}{"\u793A\u4F8B\u6570\u636E"}</div></div><div className={"trend-plot"}><svg viewBox={"0 0 950 310"} role={"img"} aria-label={label + "\u8FD112\u4E2A\u6708\u8D8B\u52BF"}><defs><linearGradient id={"trend-fill"} x1={"0"} y1={"0"} x2={"0"} y2={"1"}><stop offset={"0%"} stopColor={"#267cff"} stopOpacity={".14"} /><stop offset={"100%"} stopColor={"#267cff"} stopOpacity={".02"} /></linearGradient></defs>{[0, 1, 2, 3, 4].map(j => {
        const v = lo + (hi - lo) * j / 4;
        return <><path d={"M48 " + y(v) + "H900"} stroke={"#e8eef7"} /><text x={"39"} y={y(v) + 4} textAnchor={"end"} fill={"#8d9fb9"}>{fmt(v)}</text></>;
      })}<path d={path + " L" + x(11) + " 245 L" + x(0) + " 245Z"} fill={"url(#trend-fill)"} /><path d={path} fill={"none"} stroke={"#267cff"} strokeWidth={"2.7"} />{pts.map((pt, j) => <>{j === 11 ? <circle cx={pt[0]} cy={pt[1]} r={"11"} fill={"#267cff22"} /> : ''}<circle cx={pt[0]} cy={pt[1]} r={j === 11 ? 7 : 4.5} fill={j === 11 ? '#267cff' : 'white'} stroke={"#267cff"} strokeWidth={"2.5"}><title>{dates[j]}{"\uFF1A"}{fmt(data[j], 2)}{" "}{u}</title></circle><text x={pt[0]} y={pt[1] + (j % 2 && j !== 11 ? 21 : -13)} textAnchor={"middle"} fill={j === 11 ? '#267cff' : '#253140'} fontWeight={j === 11 ? 700 : 400}>{fmt(data[j], 2)}</text><text x={pt[0]} y={"274"} textAnchor={"middle"} fill={j === 11 ? '#267cff' : '#7386a1'}>{dates[j].slice(5) === '01' ? dates[j].slice(2, 4) + '年1月' : Number(dates[j].slice(5)) + '月'}</text>{j === 11 ? <text x={pt[0]} y={"294"} textAnchor={"middle"} fill={"#267cff"}>{"\u5F53\u524D"}</text> : ''}</>)}</svg></div></></dialog>;
}