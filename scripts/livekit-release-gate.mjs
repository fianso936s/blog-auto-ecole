/** Production readiness gate. Never prints API secrets or tokens. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const root=new URL('../',import.meta.url);
const get=p=>fs.readFileSync(new URL(p,root),'utf8');
const mobile=JSON.parse(get('apps/mobile/package.json'));
const rootPkg=JSON.parse(get('package.json'));
const lock=JSON.parse(get('package-lock.json'));
const issues=[];
const appConfig=get('apps/mobile/app.config.ts');
const pbx=get('apps/mobile/ios/LeReperePermis.xcodeproj/project.pbxproj');
for(const [what,v] of [['root package',rootPkg.version],['mobile package',mobile.version],['root npm lock',lock.version]]){
 if(v!=='1.5.2')issues.push(`${what} version is ${v} instead of 1.5.2`);
}
if(!appConfig.includes('version: "1.5.2"') || !pbx.includes('MARKETING_VERSION = 1.5.2;'))
 issues.push('Expo/native marketing versions mismatch');
const deps=['@livekit/react-native','@livekit/react-native-webrtc','@livekit/react-native-expo-plugin','@config-plugins/react-native-webrtc','livekit-client'];
for(const name of deps){
 if(!mobile.dependencies[name])issues.push(`Missing dependency declaration: ${name}`);
 if(!lock.packages?.[`node_modules/${name}`]?.integrity)issues.push(`Missing verified npm lock integrity: ${name}. Run npm run release:prepare on internet-enabled runner.`);
}
for(const name of ['LIVEKIT_URL','LIVEKIT_API_KEY','LIVEKIT_API_SECRET']){
 if(!process.env[name])issues.push(`Neon server environment not supplied here: ${name}`);
}
if(!process.env.META_APP_ID || process.env.META_APP_ID==='0')issues.push('Meta production App ID not supplied to the build');
if(!process.env.META_CLIENT_TOKEN)issues.push('Meta production client token not supplied to the build');
if(!process.env.EXPO_TOKEN)issues.push('Expo EAS authenticated token not supplied to the build environment');
if(!get('apps/api/src/webrtc.ts').includes('MAX_STUDENTS = 10'))issues.push('The pupil quota is not enforced');
if(!get('apps/mobile/src/components/InstantLivePlayer.tsx').includes('joinRTC(videoId)'))issues.push('No secured student player');
if(/EXPO_PUBLIC_LIVEKIT_API_SECRET|EXPO_PUBLIC_LIVEKIT_API_KEY/.test(appConfig))issues.push('CRITICAL: LiveKit secret in the client');
console.log('Le Repère Permis iOS 1.5.2 — delivery readiness');
console.log('Code/configuration checks complete; remaining external requirements:');
issues.forEach(x=>console.log('- '+x));
console.log(`Result: ${issues.length?'NOT READY FOR TESTFLIGHT':'READY FOR EAS BUILD (native/device tests still required)'}`);
if(process.argv.includes('--strict') && issues.length)process.exitCode=1;
