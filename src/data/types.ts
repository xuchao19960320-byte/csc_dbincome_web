/** Shared domain models for the dry-bulk dashboard and chart components. */
export type FleetKind = '江船' | '海船';
export type ShipMetric = 'income' | 'cost' | 'rate' | 'tce' | 'cargo';
export interface ShipRecord {
  id: number;
  name: string;
  type: string;
  fleet: FleetKind;
  company: string;
  age: number;
  owned: boolean;
  income: number;
  cost: number;
  rate: number;
  tce: number;
  cargo: number;
}
export interface MatrixShip extends ShipRecord {
  rank: number;
  percent: number;
  op: number;
  tier: number;
  ratio: number;
  market: number;
}
export interface ChartSeries {
  name: string;
  color: string;
  kind: 'bar' | 'line';
  values: number[];
  axis?: 'left' | 'right';
  unit: string;
  dash?: boolean;
}
