/** Offline tests for the private-video security model. No Neon writes or R2 calls. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts=require('typescript');
const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
for(const path of ['../../apps/api/src/videos.ts','../../apps/api/src/video-storage.ts','../../apps/mobile/src/screens/Videos.tsx','../../apps/mobile/src/services/private-videos.ts']) {
  const sf=ts.createSourceFile(path,read(path),ts.ScriptTarget.Latest,true,path.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  assert.equal(sf.parseDiagnostics.length,0,`Syntax issue in ${path}`);
}
const sql=read('../../db/migrations/009-private-videos.sql');
assert.match(sql,/video_grants/);
assert.match(sql,/REFERENCES users\(id\) ON DELETE CASCADE/);
assert.match(sql,/CHECK \(visibility IN \('private', 'students'\)\)/);
assert.doesNotMatch(sql,/CHECK \(visibility IN \(.*'public'/i);
const routes=read('../../apps/api/src/videos.ts');
assert.match(routes,/teacher_students ts WHERE ts.teacher_id=v.author_id AND ts.student_id=\$2/);
assert.match(routes,/video_grants g WHERE g.video_id=v.id AND g.student_id=\$2/);
assert.match(routes,/v.visibility='students' AND \(v.state='ready' OR v.live_status IN/);
assert.match(routes,/v.author_id=\$2 OR/);
assert.match(routes,/SELECT pg_advisory_xact_lock\(48172391\)/);
assert.match(routes,/R2|storageSign/);
assert.doesNotMatch(routes,/SELECT.*\bdata_url\b/);
// Execute just the storage signer with a fake API error class, to exercise signed headers.
const source = read('../../apps/api/src/video-storage.ts');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const module={exports:{}};
const localRequire=n=>n==='./security.js'?{ApiError:class ApiError extends Error{}}:n==='node:crypto'?crypto:require(n);
new Function('require','module','exports','process','fetch',js)(localRequire,module,module.exports,{
  env:{R2_ACCOUNT_ID:'a'.repeat(32),R2_ACCESS_KEY_ID:'test-access',R2_SECRET_ACCESS_KEY:'test-secret',R2_BUCKET:'repere-private'},
},()=>{ throw Error('network must not be called') });
const {storageSign}=module.exports;
const put=storageSign('PUT','a'.repeat(36)+'.mp4','video/mp4',300,new Date('2026-10-21T12:00:00Z'),12345);
assert.match(put.url,/X-Amz-Signature=[a-f0-9]{64}$/);
assert.match(put.url,/X-Amz-SignedHeaders=content-length%3Bcontent-type%3Bhost/);
assert.deepEqual(put.headers,{'Content-Type':'video/mp4','Content-Length':'12345'});
const get=storageSign('GET','a'.repeat(36)+'.mp4',undefined,300,new Date('2026-10-21T12:00:00Z'));
assert.match(get.url,/X-Amz-SignedHeaders=host/);
assert.notEqual(put.url,get.url);
console.log('PASS: TS/TSX syntax, default private schema, student+grant checks, R2 SigV4 URL and signed file size');
