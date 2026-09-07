import { createQueryEngine } from './queryEngine';
import type { QueryConfig, ChartConfig, DetailRow, ChartMetric } from './types';
export const palette=['#0a6fc8','#2fb0ff','#0aa88f','#f59e0b','#e5484d','#8b5cf6','#64748b','#7cc4ff'];
export const metricNames={inc:'运输收入',t:'完成运量',p:'单吨均价'}, metricUnits={inc:'万元',t:'万吨',p:'元/吨'}, dimensionNames={cat:'货类',unit:'业务单位',route:'航线'};
export function niceMax(v:number) { if(v<=0)return 1;const p=Math.pow(10,Math.floor(Math.log10(v))),n=v/p;return(n<=1?1:n<=2?2:n<=2.5?2.5:n<=5?5:10)*p; }
export function cellValue(cell:{inc:number;t:number}|undefined,met:ChartMetric) { if(!cell)return 0;return met==='inc'?cell.inc:met==='t'?cell.t:cell.t>0?cell.inc/cell.t:0; }
export function aggregateTrend(config: QueryConfig, chart: ChartConfig) {
  const p=config.period,am=p.y*12+p.m1-1;
  const sm=chart.gran==='月度'?am-5:chart.gran==='季度'?(Math.floor(am/3)-3)*3:(p.y-3)*12;
  const startYear=Math.floor(sm/12),startMonth=sm%12+1;
  const endMonth=chart.gran==='月度'?p.m1:chart.gran==='季度'?(Math.floor(am/3)*3+2)%12+1:12;
  let rows:DetailRow[]=[];
  for(let y=startYear;y<=p.y;y++) rows.push(...createQueryEngine({...config,period:{y,m0:y===startYear?startMonth:1,m1:y===p.y?endMonth:12}}).genDetails());
  const map:Record<string,Record<string,{inc:number;t:number}>>={},totals:Record<string,number>={};
  rows.forEach(r=>{const month=Number(r.date.slice(5,7)),year=r.date.slice(0,4),key=chart.gran==='年度'?year+'年':chart.gran==='季度'?year+'Q'+Math.ceil(month/3):r.date.slice(0,7),dim=r[chart.dim];const cell=((map[key]??={})[dim]??={inc:0,t:0});cell.inc+=r.income;cell.t+=r.t;totals[dim]=(totals[dim]||0)+r.income;});
  return {map,periods:Object.keys(map).sort(),dims:Object.keys(totals).sort((a,b)=>totals[b]-totals[a])};
}
export function aggregateComposition(rows:DetailRow[],chart:ChartConfig) {
  const map:Record<string,{inc:number;t:number}>={};
  rows.forEach(r=>{const cell=(map[r[chart.dim]]??={inc:0,t:0});cell.inc+=r.income;cell.t+=r.t;});
  return Object.entries(map).map(([k,c])=>({k,v:cellValue(c,chart.met)})).sort((a,b)=>b.v-a.v);
}
