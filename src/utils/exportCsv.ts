import type { DetailRow } from '../data/self/types';
export function detailsCsv(rows: DetailRow[]): string {
  const headers = [
    '提单/航次号',
    '完成日期',
    '单位',
    '货类',
    '航线',
    '船名',
    '货量（万吨）',
    '均价（元/吨）',
    '收入（万元）',
  ];
  const keys: (keyof DetailRow)[] = [
    'bill',
    'date',
    'unit',
    'cat',
    'route',
    'ship',
    't',
    'price',
    'income',
  ];
  const cell = (v: unknown) => {
    let text = String(v ?? '');
    if (/^[=+@-]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  };
  return (
    '\ufeff' +
    [
      headers.map(cell).join(','),
      ...rows.map((row) => keys.map((k) => cell(row[k])).join(',')),
    ].join('\r\n')
  );
}
export function downloadText(text: string, name: string, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
