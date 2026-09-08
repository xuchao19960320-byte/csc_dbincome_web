export interface Period {
  y: number;
  m0: number;
  m1: number;
}
export interface QueryConfig {
  orgSel: Record<string, boolean>;
  period: Period;
  caliber: string;
  cargo: string;
  ship: string;
  dims: string[];
  metrics: Record<string, boolean>;
  sortKey: keyof DetailRow;
  sortDir: 'asc' | 'desc';
}
export interface DetailRow {
  bill: string;
  date: string;
  unit: string;
  cat: string;
  route: string;
  ship: string;
  t: number;
  price: number;
  income: number;
}
export interface QueryTemplate {
  id: string;
  name: string;
  desc: string;
  def: boolean;
  time: string;
  p: {
    org: string[];
    period: Period;
    caliber: string;
    ship: string;
    cargo?: string;
    dims: string[];
    metrics: Record<string, boolean>;
    sortKey: string;
    sortDir: string;
  };
}
export interface TemplateLog {
  time: string;
  type: string;
  tpl: string;
  desc: string;
}
export type ChartMetric = 'inc' | 't' | 'p';
export type ChartDimension = 'cat' | 'unit' | 'route';
export interface ChartConfig {
  met: ChartMetric;
  dim: ChartDimension;
  type: string;
  gran: string;
}
