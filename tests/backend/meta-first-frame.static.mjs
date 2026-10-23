import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../../apps/mobile/modules/repere-meta/ios/RepereInstantPublisher.swift',import.meta.url),'utf8');
const module=fs.readFileSync(new URL('../../apps/mobile/modules/repere-meta/ios/RepereMetaModule.swift',import.meta.url),'utf8');
const screen=fs.readFileSync(new URL('../../apps/mobile/src/components/MetaLivePanel.tsx',import.meta.url),'utf8');
// LiveKit buffer tracks need their first video frame BEFORE publish. Otherwise dimensions
// are unresolved and publishing can time out before the camera starts.
assert.match(source,/self\.capture\?\.capture\(frame\.pixel\)/);
const publish=source.indexOf('room.localParticipant.publish(videoTrack:currentTrack');
const firstFrame=source.indexOf('self.capture?.capture(frame.pixel)');
assert.ok(firstFrame>0 && publish>firstFrame,'Never publish before the first Meta frame');
assert.match(source,/self\.publishSucceeded=true/);
assert.match(source,/self\.publishFailed=true/);
assert.match(module,/"published":self\.instantPublisher\?\.isPublished/);
assert.match(screen,/realStreamStarted\s*\?/);
assert.match(screen,/Connexion en cours · Attente des premières images Meta/);
console.log('PASS Meta first-frame/publish order, native status and honest iPhone live state');
