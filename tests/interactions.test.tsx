import assert from 'node:assert/strict';
import { test, afterEach } from 'node:test';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { App } from '../src/App';
import { state, stopTrack } from '../src/hooks/dashboardStore';
import { initialState } from '../src/data/initialState';
let root: Root | undefined;
async function mount() {
  Object.assign(state, structuredClone(initialState));
  const container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root!.render(<App />));
  return container;
}
afterEach(async () => {
  stopTrack();
  if (root) await act(async () => root!.unmount());
  root = undefined;
  document.body.replaceChildren();
});
async function click(el: Element | null) {
  assert.ok(el, 'control exists');
  await act(async () => {
    el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, composed: true }));
  });
}
function button(scope: ParentNode, text: string) {
  return [...scope.querySelectorAll('button')].find((b) => b.textContent!.trim() === text) || null;
}
async function input(el: HTMLInputElement | HTMLSelectElement, value: string) {
  assert.ok(el);
  const prototype =
    el.tagName === 'SELECT'
      ? window.HTMLSelectElement.prototype
      : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value')!.set!.call(el, value);
  await act(async () => {
    el.dispatchEvent(
      new window.Event(el.tagName === 'SELECT' ? 'change' : 'input', {
        bubbles: true,
        composed: true,
      }),
    );
  });
}
test('overview metric tabs, fleet select, sorting, all-series month tooltip and KPI modal', async () => {
  const c = await mount();
  await click(c.querySelector('[data-key="cargoMetric"][data-value="业务毛利"]'));
  assert.equal(state.cargoMetric, '业务毛利');
  assert.match(c.querySelector('.cargo-card')!.textContent!, /当月业务毛利/);
  await click(c.querySelector('[data-key="fleet"][data-value="江船"]'));
  const select = c.querySelector<HTMLSelectElement>('[data-select="shipType"]')!;
  await input(select, '江船6700型');
  assert.equal(select.value, '江船6700型');
  assert.equal(state.shipType, '江船6700型');
  await click(c.querySelector('[data-sort="cost"]'));
  assert.equal(state.rankSort, 'cost');
  await click(c.querySelector('[data-sort="cost"]'));
  assert.equal(state.rankDirection, 'asc');
  await click(c.querySelector('[data-series="当年收入"]'));
  assert.equal(state.hiddenSeries['收入趋势分析|当年收入'], true);
  assert.match(c.querySelector('.month-hover')!.getAttribute('data-tip')!, /当年收入：/);
  await click(c.querySelector('[data-trend="0"]'));
  assert.ok(c.querySelector('dialog[open]'));
  assert.match(c.querySelector('dialog')!.textContent!, /近 12 个月趋势/);
  await click(c.querySelector('#trend-close'));
  assert.equal(c.querySelector('dialog'), null);
});
test('ship search, recent search, copy and single-ship navigation', async () => {
  const c = await mount();
  let copied = '';
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: async (s: string) => {
        copied = s;
      },
    },
  });
  await click(c.querySelector('#ships-tab'));
  await input(c.querySelector('#ship-search')!, '长航卓海');
  await act(async () => {
    c.querySelector('form')!.dispatchEvent(
      new window.Event('submit', { bubbles: true, cancelable: true }),
    );
  });
  assert.equal(c.querySelectorAll('.ship-item').length, 1);
  assert.match(c.querySelector('.recent-ships')!.textContent!, /长航卓海/);
  await click(c.querySelector('[data-copy]'));
  assert.equal(copied, '长航卓海');
  assert.equal(state.page, 'ships');
  await click(c.querySelector('.ship-item'));
  assert.equal(state.page, 'shipDetail');
  assert.match(c.textContent!, /航次与异常/);
  await click(button(c, '异常诊断'));
  assert.match(c.textContent!, /空排率/);
});
test('matrix ship selection, search, playback, slider and structure metric tabs', async () => {
  const c = await mount();
  await click(c.querySelector('#multi-tab'));
  assert.match(
    c.querySelector('.matrix-svg')!.textContent!,
    /第三档 · 跑输市场.*第二档 · 与市场持平.*第一档 · 跑赢市场/,
  );
  await input(c.querySelector('#matrix-search')!, '长航北海');
  assert.equal(c.querySelectorAll('.matrix-list button').length, 1);
  await click(c.querySelector('.matrix-list button'));
  assert.notEqual(state.matrixSelected, null);
  await click(c.querySelector('[data-play-track]'));
  assert.equal(state.matrixStep, 0);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 900));
  });
  assert.equal(state.matrixStep, 1);
  await click(c.querySelector('[data-play-track]'));
  await input(c.querySelector('#track-step')!, '5');
  assert.equal(state.matrixStep, 5);
  assert.equal((c.querySelector('#track-step') as HTMLInputElement).value, '5');
  await click(c.querySelector('[data-key="structureMetric"][data-value="业务成本"]'));
  assert.equal(state.structureMetric, '业务成本');
  assert.match(c.textContent!, /船舶月度核心指标明细/);
});
test('self analysis configuration, query, pagination, charts, save and restore template', async () => {
  localStorage.removeItem('ch_rev_query_templates_v2');
  const c = await mount();
  await click(c.querySelector('#self-tab'));
  const s = c.querySelector('.self-workspace')!.shadowRoot!;
  assert.ok(s);
  assert.equal(c.querySelector('iframe'), null);
  await click(button(s, '查询数据'));
  assert.ok(s.querySelectorAll('tbody tr').length > 1);
  const first = s.querySelector('tbody')!.textContent;
  await click(s.querySelector('.pager .pg-btn:last-of-type'));
  assert.notEqual(s.querySelector('tbody')!.textContent, first);
  await click(button(s, '趋势图表'));
  assert.ok(s.querySelector('svg[aria-label="查询结果趋势"]'));
  await input(s.querySelector('[aria-label="图表类型"]')!, '折线图');
  assert.ok(s.querySelector('polyline'));
  await click(button(s, '构成图表'));
  assert.ok(s.querySelector('.donut-svg'));
  await click(button(s, '保存为新模板'));
  await input(s.querySelector('[aria-label="模板名称"]')!, '迁移测试模板');
  await click(button(s, '保存'));
  assert.match(s.textContent!, /迁移测试模板/);
  assert.match(localStorage.getItem('ch_rev_query_templates_v2')!, /迁移测试模板/);
  await click(button(s, '配置查询'));
  await click(button(s, '管理展示指标'));
  assert.ok(s.querySelector('[role="dialog"]'));
  await click(button(s, '取消'));
  await click(button(s, '我的模板'));
  const template = [...s.querySelectorAll('.tpl-item')].find((t) =>
    t.textContent!.includes('迁移测试模板'),
  )!;
  await click(template);
  assert.match(s.textContent!, /已应用模板/);
});
