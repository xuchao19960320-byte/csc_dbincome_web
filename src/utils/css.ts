import type { CSSProperties } from 'react';
/** Convert the original chart's CSS custom properties to React style objects. */
export function css(declarations: string): CSSProperties {
  return Object.fromEntries(
    declarations
      .split(';')
      .filter(Boolean)
      .map((part) => {
        const separator = part.indexOf(':');
        const key = part.slice(0, separator).trim();
        return [
          key.startsWith('--') ? key : key.replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
          part.slice(separator + 1).trim(),
        ];
      }),
  );
}
