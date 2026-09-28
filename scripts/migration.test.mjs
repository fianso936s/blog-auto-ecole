import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Execute the real migration block with isolated browser API doubles.
// This exercises behavior, not a live browser or production storage.
const read = path => readFileSync(path, 'utf8');
const origin = 'https://webedrive.test';
function pageHarness({ registrations = [], keys = [], serviceWorker = true, cacheAvailable = true, failRead = false, failDelete = false } = {}) {
  const source = read('src/main.tsx');
  const start = source.indexOf('const LEGACY_SERVICE_WORKER_PATHS');
  const end = source.indexOf('createRoot(document');
  assert.ok(start >= 0 && end > start, 'actual migration block must be present');
  const code = ts.transpileModule(source.slice(start, end), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None },
  }).outputText;
  let onLoad;
  const deleted = [];
  const caches = {
    keys: async () => keys,
    delete: async key => { deleted.push(key); if (failDelete) throw new Error('isolated storage denial'); return true; },
  };
  const window = { location: { origin }, addEventListener: (type, callback) => { assert.equal(type, 'load'); onLoad = callback; } };
  if (cacheAvailable) window.caches = caches;
  const navigator = serviceWorker ? { serviceWorker: { getRegistrations: async () => {
    if (failRead) throw new Error('isolated storage denial');
    return registrations;
  } } } : {};
  vm.runInNewContext(code, { window, navigator, caches, URL }, { timeout: 1000 });
  return { onLoad, deleted };
}

function registration(url, removed, { state = 'active', reject = false } = {}) {
  return { [state]: { scriptURL: url }, unregister: async () => {
    removed.push(url);
    if (reject) throw new Error('isolated unregister denial');
    return true;
  } };
}

test('Migration unregisters only known same-origin workers and preserves unrelated registrations', async () => {
  const removed = [];
  const known = ['/sw.js', '/service-worker.js?version=old'].map(path => `${origin}${path}`);
  const unrelated = [`${origin}/other/sw.js`, `${origin}/sw.js.backup`, 'https://other.test/sw.js', 'not a URL'];
  const registrations = [
    registration(known[0], removed),
    registration(known[1], removed, { state: 'waiting' }),
    ...unrelated.map(url => registration(url, removed)),
    { unregister: async () => { throw new Error('empty registration must not be removed'); } },
  ];
  const harness = pageHarness({ registrations });
  await harness.onLoad();
  assert.deepEqual(removed, known);
});

test('Migration recognizes an installing historical worker', async () => {
  const removed = [];
  const url = `${origin}/sw.js`;
  await pageHarness({ registrations: [registration(url, removed, { state: 'installing' })] }).onLoad();
  assert.deepEqual(removed, [url]);
});

test('Page migration deletes owned cache prefixes only, including negative lookalikes', async () => {
  const owned = ['auto-blog-v1', 'webedrive-migration-v1'];
  const others = ['another-app-v1', 'prefix-auto-blog-v1', 'auto-blog', 'webedrive-other-v1'];
  const harness = pageHarness({ keys: [...owned, ...others] });
  await harness.onLoad();
  assert.deepEqual(harness.deleted, owned);
});

test('Migration is optional when service workers or Cache Storage are unavailable', async () => {
  assert.equal(pageHarness({ serviceWorker: false }).onLoad, undefined);
  const removed = [];
  const url = `${origin}/sw.js`;
  await pageHarness({ cacheAvailable: false, registrations: [registration(url, removed)] }).onLoad();
  assert.deepEqual(removed, [url]);
});

test('Denied storage and individual cleanup failures do not escape or stop unrelated cleanup', async () => {
  await assert.doesNotReject(pageHarness({ failRead: true }).onLoad);
  const removed = [];
  const harness = pageHarness({
    registrations: [registration(`${origin}/sw.js`, removed, { reject: true }), registration(`${origin}/service-worker.js`, removed)],
    keys: ['auto-blog-v1', 'webedrive-migration-v1', 'unrelated'],
    failDelete: true,
  });
  await assert.doesNotReject(harness.onLoad);
  assert.equal(removed.length, 2);
  assert.deepEqual(harness.deleted, ['auto-blog-v1', 'webedrive-migration-v1']);
});

function workerHarness({ failKeys = false, failDelete = false } = {}) {
  const listeners = new Map();
  const deleted = [];
  let claims = 0;
  let skipped = 0;
  const response = { isolated: true };
  let request;
  vm.runInNewContext(read('public/sw.js'), {
    self: {
      addEventListener: (type, callback) => listeners.set(type, callback),
      skipWaiting: async () => { skipped += 1; },
      clients: { claim: async () => { claims += 1; } },
    },
    caches: {
      keys: async () => { if (failKeys) throw new Error('isolated denial'); return ['auto-blog-v1', 'webedrive-migration-v1', 'another-app-v1']; },
      delete: async key => { deleted.push(key); if (failDelete) throw new Error('isolated denial'); return true; },
    },
    fetch: async value => { request = value; return response; },
  }, { timeout: 1000 });
  return { listeners, deleted, response, get claims() { return claims; }, get skipped() { return skipped; }, get request() { return request; } };
}

test('Actual migration worker activates without deleting another app cache', async () => {
  const harness = workerHarness();
  await harness.listeners.get('install')();
  let completion;
  harness.listeners.get('activate')({ waitUntil: promise => { completion = promise; } });
  await completion;
  assert.deepEqual(harness.deleted, ['auto-blog-v1', 'webedrive-migration-v1']);
  assert.equal(harness.claims, 1);
  assert.equal(harness.skipped, 1);
});

test('Migration worker remains network-only and passes the original request through', async () => {
  const harness = workerHarness();
  const request = { url: `${origin}/blog`, method: 'GET' };
  let result;
  harness.listeners.get('fetch')({ request, respondWith: promise => { result = promise; } });
  assert.equal(await result, harness.response);
  assert.equal(harness.request, request);
});

test('Migration worker tolerates denied cache access and individual delete failures', async () => {
  for (const options of [{ failKeys: true }, { failDelete: true }]) {
    const harness = workerHarness(options);
    let completion;
    harness.listeners.get('activate')({ waitUntil: promise => { completion = promise; } });
    await assert.doesNotReject(completion);
    assert.equal(harness.claims, 1);
  }
});
