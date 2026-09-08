import {
  useEffect,
  useState,
  type MouseEvent,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import {
  state,
  update,
  notify,
  stopTrack,
  toggleTrack,
  rememberShip,
  searchShips,
  type DashboardState,
} from './dashboardStore';
export function useDashboardActions() {
  const [trend, setTrend] = useState<{ index: number; period: string } | null>(null);
  useEffect(() => () => stopTrack(), []);
  function activate(target: Element) {
    const button = target.closest<HTMLElement>('[data-key]');
    if (button && !(button as HTMLButtonElement).disabled)
      update(button.dataset.key as keyof DashboardState, button.dataset.value!);
    const sort = target.closest<HTMLElement>('[data-sort]');
    if (sort) {
      const key = sort.dataset.sort!;
      state.rankDirection =
        state.rankSort === key && state.rankDirection === 'desc' ? 'asc' : 'desc';
      state.rankSort = key;
      state.rankPage = 1;
      notify();
    }
    const series = target.closest<HTMLElement>('[data-series]');
    if (series) {
      const key = `${state.trendTab}|${series.dataset.series}`;
      state.hiddenSeries[key] = !state.hiddenSeries[key];
      notify();
    }
    const open = target.closest<HTMLElement>('[data-open-ship]');
    if (open) {
      state.selectedShip = Number(open.dataset.openShip);
      update('page', 'shipDetail');
    }
    const recent = target.closest<HTMLElement>('[data-recent]');
    if (recent) {
      state.shipQuery = recent.dataset.recent!;
      rememberShip(state.shipQuery);
      notify();
    }
    const shipSort = target.closest<HTMLElement>('[data-ship-sort]');
    if (shipSort) {
      const key = shipSort.dataset.shipSort!;
      state.shipDir = state.shipSort === key && state.shipDir === 'desc' ? 'asc' : 'desc';
      state.shipSort = key;
      notify();
    }
    if (target.closest('[data-reset-ships]')) {
      state.shipQuery = '';
      state.shipFleet = '全部';
      state.shipFilter = '全部';
      state.org = '全部二级组织';
      notify();
    }
    const selected = target.closest<HTMLElement>('[data-matrix-ship]');
    if (selected) {
      stopTrack();
      state.matrixSelected = Number(selected.dataset.matrixShip);
      state.matrixStep = 11;
      notify();
    }
    if (target.closest('[data-clear-track]')) {
      stopTrack();
      state.matrixSelected = null;
      notify();
    }
    if (target.closest('[data-play-track]')) toggleTrack();
    const metric = target.closest<HTMLElement>('[data-trend]');
    if (metric) setTrend({ index: Number(metric.dataset.trend), period: metric.dataset.period! });
  }
  async function onClick(e: MouseEvent<HTMLElement>) {
    const target = e.target as Element;
    const copy = target.closest<HTMLButtonElement>('[data-copy]');
    if (copy) {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(copy.dataset.copy!);
        copy.setAttribute('title', '已复制');
        copy.setAttribute('aria-label', '已复制');
      } catch {
        copy.setAttribute('title', '复制失败，请手动复制');
      }
      return;
    }
    activate(target);
  }
  function onChange(e: ChangeEvent<HTMLElement>) {
    const target = e.target as HTMLInputElement;
    if (target.dataset.select) update(target.dataset.select as keyof DashboardState, target.value);
    if (target.id === 'matrix-search') {
      state.matrixQuery = target.value;
      notify();
    }
    if (target.id === 'track-step') {
      stopTrack();
      state.matrixStep = Number(target.value);
      notify();
    }
  }
  function onSubmit(e: FormEvent<HTMLElement>) {
    if ((e.target as HTMLElement).id !== 'ship-search-form') return;
    e.preventDefault();
    const input = e.currentTarget.querySelector<HTMLInputElement>('#ship-search');
    searchShips(input?.value || '');
  }
  function onKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (!['Enter', ' '].includes(e.key)) return;
    const target = e.target as Element;
    const item = target.closest('[data-key], [data-open-ship], [data-matrix-ship]');
    if (item && !['BUTTON', 'INPUT', 'SELECT'].includes(target.tagName)) {
      e.preventDefault();
      activate(target);
    }
  }
  return { trend, closeTrend: () => setTrend(null), onClick, onChange, onSubmit, onKeyDown };
}
