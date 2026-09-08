import { readFile } from 'node:fs/promises';
export async function load(url, context, nextLoad) {
  if (url.endsWith('.css?inline')) {
    const css = await readFile(new URL(url.replace('?inline', '')), 'utf8');
    return {
      format: 'module',
      source: `export default ${JSON.stringify(css)};`,
      shortCircuit: true,
    };
  }
  return nextLoad(url, context);
}
