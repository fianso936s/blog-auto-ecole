import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const script = resolve('apps/mobile/ios/scripts/meta-archive-provenance.sh');

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'repere-archive-'));
  const products = join(root, 'products');
  const app = join(root, 'app');
  const derived = join(root, 'intermediates');
  mkdirSync(join(products, 'RepereMeta'), { recursive: true });
  for (const name of ['MWDATCore', 'MWDATCamera']) {
    mkdirSync(join(app, 'Frameworks', `${name}.framework`), { recursive: true });
    writeFileSync(join(app, 'Frameworks', `${name}.framework`, name), 'framework-binary');
    writeFileSync(join(products, `${name}.xcframework-ios.signature`), `${name}-provenance`);
    writeFileSync(join(products, 'RepereMeta', `${name}.xcframework-ios.signature`), `${name}-provenance`);
  }
  return { root, products, app, derived, run: () => spawnSync('/bin/sh', [script], {
    env: { ...process.env, CONFIGURATION_BUILD_DIR: products, TARGET_BUILD_DIR: app,
      FRAMEWORKS_FOLDER_PATH: 'Frameworks', DERIVED_FILE_DIR: derived }, encoding: 'utf8',
  }) };
}

test('archive keeps one Meta provenance entry and both embedded frameworks; rerun is safe', () => {
  const f = fixture();
  try {
    assert.equal(f.run().status, 0);
    for (const name of ['MWDATCore', 'MWDATCamera']) {
      assert.equal(existsSync(join(f.products, `${name}.xcframework-ios.signature`)), false);
      assert.equal(readFileSync(join(f.products, 'RepereMeta', `${name}.xcframework-ios.signature`), 'utf8'), `${name}-provenance`);
      assert.equal(readFileSync(join(f.app, 'Frameworks', `${name}.framework`, name), 'utf8'), 'framework-binary');
    }
    assert.equal(f.run().status, 0);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});

test('archive refuses to merge different Meta provenance', () => {
  const f = fixture();
  try {
    const duplicate = join(f.products, 'MWDATCore.xcframework-ios.signature');
    writeFileSync(duplicate, 'different');
    assert.notEqual(f.run().status, 0);
    assert.equal(readFileSync(duplicate, 'utf8'), 'different');
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});

test('archive fails when a Meta runtime framework is missing', () => {
  const f = fixture();
  try {
    rmSync(join(f.app, 'Frameworks', 'MWDATCore.framework'), { recursive: true });
    const result = f.run();
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Meta framework missing/);
    assert.equal(existsSync(join(f.products, 'MWDATCore.xcframework-ios.signature')), true);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});
