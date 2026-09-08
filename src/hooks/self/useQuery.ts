import { useMemo, useState } from 'react';
import { ORG_LEAVES, MET_DEFAULT } from '../../data/self/catalog';
import { createQueryEngine } from '../../data/self/queryEngine';
import type { QueryConfig, DetailRow } from '../../data/self/types';
export const initialQuery: QueryConfig = {
  orgSel: Object.fromEntries(ORG_LEAVES.map((l) => [l.k, true])),
  period: { y: 2026, m0: 8, m1: 8 },
  caliber: 'self',
  cargo: 'all',
  ship: 'all',
  dims: ['unit', 'cargo'],
  metrics: Object.fromEntries(Object.entries(MET_DEFAULT).map(([k, v]) => [k, !!v])),
  sortKey: 'date',
  sortDir: 'desc',
};
export function useQuery() {
  const [config, setConfig] = useState<QueryConfig>(() => structuredClone(initialQuery));
  const [applied, setApplied] = useState<QueryConfig | null>(null);
  const [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(10);
  const engine = useMemo(() => createQueryEngine(config), [config]);
  const result = useMemo(() => engine.compute(), [engine]);
  const rows = useMemo(() => {
    if (!applied) return [];
    const items = createQueryEngine(applied).genDetails();
    return items.sort((a, b) => {
      const x = a[applied.sortKey],
        y = b[applied.sortKey];
      const cmp =
        typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
      return cmp * (applied.sortDir === 'asc' ? 1 : -1);
    });
  }, [applied]);
  const patch = (next: Partial<QueryConfig>) =>
    setConfig((current) => {
      const config = { ...current, ...next };
      if (next.orgSel) {
        const units = createQueryEngine(config).orgUnits();
        config.ship = units.length === 1 ? (units[0] === 'yanj' ? 'river' : 'sea') : 'all';
      }
      return config;
    });
  const run = (next = config) => {
    setApplied(structuredClone(next));
    setPage(1);
  };
  return {
    config,
    setConfig,
    patch,
    engine,
    result,
    rows,
    applied,
    run,
    page,
    setPage,
    pageSize,
    setPageSize,
    dirty: !!applied && JSON.stringify(config) !== JSON.stringify(applied),
  };
}
export type QueryController = ReturnType<typeof useQuery>;
