import { useSyncExternalStore } from 'react';
import { initialState } from '../data/initialState';
import { types, shipRecords } from '../data/fleet';

export type DashboardState = Omit<typeof initialState, 'matrixSelected' | 'hiddenSeries'> & {
  matrixSelected: number | null;
  hiddenSeries: Record<string, boolean>;
};
export const state: DashboardState = structuredClone(initialState);
let revision = 0;
const listeners = new Set<() => void>();
export function notify() { revision++; listeners.forEach(fn => fn()); }
export function useDashboard() {
  useSyncExternalStore(fn => { listeners.add(fn); return () => { listeners.delete(fn); }; }, () => revision, () => revision);
  return state;
}
export let trackTimer: ReturnType<typeof setInterval> | null = null;
export function stopTrack() { if (trackTimer) clearInterval(trackTimer); trackTimer = null; }
export function update(key: keyof DashboardState, value: string | number) {
  stopTrack();
  if (['multiFleet', 'org', 'month'].includes(key)) {
    state.matrixSelected = null; state.matrixStep = 11; state.multiTablePage = 1;
  }
  if (['multiTablePage', 'overPage', 'rankPage'].includes(key)) value = Number(value);
  Object.assign(state, { [key]: value });
  if (key === 'shipFleet') state.shipFilter = '全部';
  if (key === 'incomeFleet') state.incomeType = types[value][0];
  if (key === 'fleet') state.shipType = '全部船型';
  if (key === 'company') state.overPage = 1;
  if (key === 'rank') state.rankPage = 1;
  if (key === 'page') {
    if (value === 'ranking') state.detailRank = state.rank;
    globalThis.window?.scrollTo(0, 0);
  }
  notify();
}
export function toggleTrack() {
  if (state.matrixSelected === null) return;
  if (trackTimer) stopTrack();
  else {
    if (state.matrixStep === 11) state.matrixStep = 0;
    trackTimer = setInterval(() => {
      state.matrixStep++;
      if (state.matrixStep >= 11) stopTrack();
      notify();
    }, 850);
  }
  notify();
}
export let recentShips: string[] = [];
try {
  const saved = JSON.parse(localStorage.getItem('bulk-recent-ships') || '[]');
  if (Array.isArray(saved)) recentShips = saved.filter(n => shipRecords.some(s => s.name === n)).slice(0, 6);
} catch { /* Storage is optional, including during server-side validation. */ }
export function rememberShip(name: string) {
  recentShips = [name, ...recentShips.filter(n => n !== name)].slice(0, 6);
  try { localStorage.setItem('bulk-recent-ships', JSON.stringify(recentShips)); } catch { /* Private mode. */ }
}
export function searchShips(query: string) {
  state.shipQuery = query.trim();
  if (state.shipQuery) shipRecords.filter(s => s.name.includes(state.shipQuery)).slice(0, 3).forEach(s => rememberShip(s.name));
  notify();
}
