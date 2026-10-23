/** This runs without paid services or npm-install. Structural audit only — not SFU/Xcode E2E. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
for(const file of ['../../apps/api/src/webrtc.ts','../../apps/api/src/index.ts','../../apps/mobile/src/services/webrtc.ts',
  '../../apps/mobile/src/components/InstantLivePlayer.tsx','../../apps/mobile/src/components/MetaLivePanel.tsx','../../apps/mobile/src/screens/Videos.tsx']) {
  const src=read(file);
  const tree=ts.createSourceFile(file,src,ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  assert.deepEqual(tree.parseDiagnostics,[],`TypeScript parse ${file}`);
}
const api=read('../../apps/api/src/webrtc.ts');
const sql=read('../../db/migrations/011-webrtc-livekit.sql');
const viewer=read('../../apps/mobile/src/components/InstantLivePlayer.tsx');
const publisher=read('../../apps/mobile/modules/repere-meta/ios/RepereInstantPublisher.swift');
const meta=read('../../apps/mobile/modules/repere-meta/ios/RepereMetaModule.swift');
assert.match(api,/MAX_STUDENTS = 10/);
assert.match(api,/MAX_ROOM_PARTICIPANTS = MAX_STUDENTS \+ 1/);
assert.match(api,/max_participants:MAX_ROOM_PARTICIPANTS/);
assert.match(api,/video_grants g WHERE g.video_id=v.id AND g.student_id=\$2/);
assert.match(api,/teacher_students t WHERE t.teacher_id=v.author_id AND t.student_id=\$2/);
assert.match(api,/p.role!=="student"/);
assert.match(api,/canPublish: canPublish && !admin/);
assert.match(api,/canSubscribe: !admin/);
assert.match(api,/roomCommand\(config,"RemoveParticipant"/);
assert.match(api,/roomCommand\(config,"DeleteRoom"/);
assert.match(api,/webrtc_last_heartbeat_at=now\(\)/);
assert.match(api,/setExpirationTime\("60s"\)/);
assert.doesNotMatch(api,/EXPO_PUBLIC_LIVEKIT_API_SECRET/);
assert.match(sql,/webrtc_last_heartbeat_at/);
assert.match(sql,/webrtc_started_at/);
assert.match(viewer,/LiveKitRoom/);
assert.match(viewer,/audio=\{false\} video=\{false\}/);
assert.match(viewer,/rtcStatus\(videoId\)/);
assert.match(publisher,/ReperePixelDecoder/);
assert.match(publisher,/BufferCapturer/);
assert.match(publisher,/capture\(frame.pixel\)/);
assert.match(meta,/self\?\.instantPublisher\?\.push\(safe.sample\)/);
assert.match(meta,/let writer = RepereHEVCContinuousWriter/);
console.log('PASS: WebRTC TypeScript syntax, strict 10-student audience, backend-only auth, revoke, Meta video source, local MOV');
