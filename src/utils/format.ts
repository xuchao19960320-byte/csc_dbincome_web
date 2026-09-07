
export const fmt = (x, d = 0) => Number(x).toLocaleString('en-US', {
  minimumFractionDigits: d,
  maximumFractionDigits: d
});