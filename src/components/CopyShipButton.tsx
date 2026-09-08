import { useState } from 'react';
import type { ShipRecord } from '../data/types';
export function CopyShipButton({ ship }: { ship: ShipRecord }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  return (
    <button
      className="copy-ship"
      data-copy={ship.name}
      aria-label={status === 'copied' ? '已复制' : `复制${ship.name}`}
      title={
        status === 'copied' ? '已复制' : status === 'failed' ? '复制失败，请手动复制' : '复制船名'
      }
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(ship.name);
          setStatus('copied');
        } catch {
          setStatus('failed');
        }
      }}
    >
      {status === 'copied' ? (
        '✓'
      ) : status === 'failed' ? (
        '复制失败'
      ) : (
        <svg viewBox="0 0 24 24">
          <rect x="8" y="8" width="11" height="12" rx="2" />
          <path d="M15 5V3H3v13h2" />
        </svg>
      )}
    </button>
  );
}
