/** Honest offline preflight. Never prints secrets. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const get=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const mobile=JSON.parse(get('apps/mobile/package.json'));
const lock=JSON.parse(get('package-lock.json'));
const required=['@livekit/react-native','@livekit/react-native-expo-plugin','@livekit/react-native-webrtc','@config-plugins/react-native-webrtc','livekit-client'];
for(const name of required)assert.ok(mobile.dependencies[name],`Missing ${name} in mobile package.json`);
const locked=required.filter(name=>!(lock.packages?.['node_modules/'+name]));
console.log('WebRTC dependencies declared:',required.join(', '));
if(locked.length)console.log('NOT READY for npm ci/EAS: run npm install with network to refresh package-lock.json. Missing:',locked.join(', '));
else console.log('Lockfile has WebRTC packages (still verify actual native linking).');
for(const name of ['LiveKitClient','ExpoModulesCore'])assert.ok(get('apps/mobile/modules/repere-meta/ios/RepereMeta.podspec').includes(name));
assert.ok(get('apps/mobile/ios/Podfile').includes('livekit/podspecs.git'));
const serverReady=Boolean(process.env.LIVEKIT_URL && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET);
console.log(serverReady?'LiveKit server variables present (values hidden).':'LiveKit server credentials not set here; required on Neon Functions.');
console.log('Xcode/EAS build and real Meta devices must validate the remainder.');
