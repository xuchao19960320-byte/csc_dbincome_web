import { useState, useRef, type ReactNode } from 'react';
export function TooltipSurface({ children }: { children: ReactNode }) {
  const [tip, setTip] = useState({ text: '', x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  return <div onPointerMove={e => {
    const node = (e.target as Element).closest<HTMLElement>('[data-tip]');
    if (!node) { if(tip.text)setTip({ ...tip, text: '' }); return; }
    setTip({ text: node.dataset.tip!, x: Math.max(8, Math.min(e.clientX + 12, window.innerWidth - (ref.current?.offsetWidth || 220) - 10)), y: Math.max(8, Math.min(e.clientY + 12, window.innerHeight - (ref.current?.offsetHeight || 100) - 10)) });
  }} onPointerLeave={() => setTip({ ...tip, text: '' })} onFocus={e => { const node = (e.target as Element).closest<HTMLElement>('[data-tip]'); if(node){ const box = node.getBoundingClientRect(); setTip({text:node.dataset.tip!,x:Math.min(box.left,window.innerWidth-240),y:Math.max(8,box.top-100)}); } }} onBlur={() => setTip({...tip,text:''})}>{children}<div className="tooltip" ref={ref} style={{ display: tip.text ? 'block' : 'none', left: tip.x, top: tip.y }} role="tooltip">{tip.text}</div></div>;
}
