/** Offline security and integration regression: does not contact Neon, Meta or R2. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const files=['../../apps/api/src/live.ts','../../apps/api/src/videos.ts','../../apps/mobile/src/services/meta-live.ts',
  '../../apps/mobile/src/screens/Videos.tsx','../../apps/mobile/src/components/MetaLivePanel.tsx','../../apps/mobile/src/App.tsx'];
for(const file of files){
  const s=fs.readFileSync(new URL(file,import.meta.url),'utf8');
  const ast=ts.createSourceFile(file,s,ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  assert.equal(ast.parseDiagnostics.length,0,`Invalid TypeScript in ${file}`);
}
const sql=fs.readFileSync(new URL('../../db/migrations/010-live-private-segments.sql',import.meta.url),'utf8');
const api=fs.readFileSync(new URL('../../apps/api/src/live.ts',import.meta.url),'utf8');
const old=fs.readFileSync(new URL('../../apps/api/src/videos.ts',import.meta.url),'utf8');
const ui=fs.readFileSync(new URL('../../apps/mobile/src/components/MetaLivePanel.tsx',import.meta.url),'utf8');
assert.match(sql,/CREATE TABLE IF NOT EXISTS video_segments/);
assert.match(sql,/REFERENCES video_sessions\(id\) ON DELETE CASCADE/);
assert.match(api,/video_grants g WHERE g.video_id=v.id AND g.student_id=\$2/);
assert.match(api,/teacher_students t WHERE t.teacher_id=v.author_id AND t.student_id=\$2/);
assert.match(api,/\$3='student' AND v.visibility='students'/);
assert.match(api,/allowed.rows.length!==payload.students.length/);
assert.match(api,/storageSign\("PUT"/);
assert.match(api,/storageSign\("GET"/);
assert.match(api,/SELECT pg_advisory_xact_lock\(48172391\)/);
assert.match(api,/\bBUDGET\b/);
assert.match(old,/deleteLiveSegments\(id\)/);
assert.match(ui,/Enregistrer une vidéo/);
assert.match(ui,/Démarrer le direct/);
assert.match(ui,/Ancien live différé/);
assert.doesNotMatch(api,/\bpublic\b.*visibility='public'/);
const paths=['../../apps/mobile/modules/repere-meta/ios/RepereMetaModule.swift',
  '../../apps/mobile/modules/repere-meta/expo-module.config.json'];
for(const x of paths) assert.ok(fs.existsSync(new URL(x,import.meta.url)),`Native source missing ${x}`);
console.log('PASS private live: authenticated audience, signer, quota, local-only mode, native bridge stub, TS parse');
