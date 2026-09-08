import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import * as overview from '../src/pages/OverviewPage';
import * as ships from '../src/pages/ShipsPage';
import * as multi from '../src/pages/MultidimensionalPage';
import { state, stopTrack } from '../src/hooks/dashboardStore';
const fixtures = JSON.parse(
  fs.readFileSync(new URL('./fixtures/original-dashboard.json', import.meta.url), 'utf8'),
);
function normalize(html: string) {
  const dom = new JSDOM('<body>' + html + '</body>'),
    doc = dom.window.document;
  const result = {
    text: doc.body.textContent!.replace(/\s+/g, ' ').trim(),
    tags: [...doc.body.querySelectorAll('*')].map((el) => el.tagName),
    tips: [...doc.body.querySelectorAll('[data-tip]')].map((el) => el.getAttribute('data-tip')),
    geometry: [
      ...doc.body.querySelectorAll('svg path,svg circle,svg rect,svg polyline,svg text,svg g'),
    ].map((el) => [
      el.tagName,
      ...[
        'd',
        'x',
        'y',
        'cx',
        'cy',
        'width',
        'height',
        'r',
        'points',
        'transform',
        'fill',
        'stroke',
      ].map((a) => el.getAttribute(a)),
    ]),
  };
  dom.window.close();
  return result;
}
test('117 original dashboard states retain text, table structure, tooltips and SVG geometry', () => {
  stopTrack();
  const warnings: unknown[] = [],
    previous = console.error;
  console.error = (...args) => warnings.push(args);
  try {
    for (const fixture of fixtures) {
      Object.assign(state, structuredClone(fixture.patch));
      const names = {
        kpis: 'KpiGrid',
        cargo: 'CargoAnalysis',
        tce: 'TceAnalysis',
        ownership: 'OwnershipAnalysis',
        river: 'RiverSeaAnalysis',
        overdue: 'OverdueAnalysis',
        ranking: 'RankingAnalysis',
        trendPanels: 'TrendAnalysis',
        tceDetail: 'TceDetailPage',
        rankingDetail: 'RankingDetailPage',
        shipList: 'ShipsPage',
        shipDetail: 'ShipDetailPage',
        multiPage: 'MultidimensionalPage',
      };
      const render = { ...overview, ...ships, ...multi }[names[fixture.name]];
      const result = renderToStaticMarkup(<>{render()}</>);
      assert.deepEqual(
        normalize(result),
        fixture.expected,
        `${fixture.name} (${state.month}, ${state.org})`,
      );
    }
    assert.deepEqual(warnings, [], 'React rendering must not emit warnings');
  } finally {
    console.error = previous;
  }
});
