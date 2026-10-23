/** Static audit of the Meta/native/EAS integration: does not claim an iOS build. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const load=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
for(const name of [
 '../../apps/mobile/src/components/MetaLivePanel.tsx',
 '../../apps/mobile/src/services/meta-live.ts',
 '../../apps/mobile/src/screens/Videos.tsx',
 '../../apps/mobile/app.config.ts',
 '../../apps/api/src/live.ts',
 '../../apps/api/src/videos.ts',
]){
 const src=load(name);
 const ast=ts.createSourceFile(name,src,ts.ScriptTarget.Latest,true,name.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 assert.deepEqual(ast.parseDiagnostics,[],`TypeScript parsing failed: ${name}`);
}
const cfg=load('../../apps/mobile/app.config.ts');
assert.ok(cfg.includes(`version: "${JSON.parse(load('../package.json')).version}"`),'Expo version must match release package');
assert.match(cfg,/MetaAppID: process\.env\.META_APP_ID/);
assert.match(cfg,/NSBluetoothAlwaysUsageDescription/);
assert.match(cfg,/UISupportedExternalAccessoryProtocols/);
assert.match(cfg,/deploymentTarget: "17\.2"/);
const podspec=load('../../apps/mobile/modules/repere-meta/ios/RepereMeta.podspec');
assert.match(podspec,/s\.dependency 'ExpoModulesCore'/);
assert.match(podspec,/s\.platform = :ios, '17\.2'/);
assert.doesNotMatch(podspec,/s\.source = \{ :path/);
const native=load('../../apps/mobile/modules/repere-meta/ios/RepereMetaModule.swift');
for(const name of ['register','authorizeCamera','connect','startCapture','stopCapture','recoverSegments','recoverRecordings','captureStatus']) {
 assert.ok(native.includes(`AsyncFunction("${name}")`),`Missing native API ${name}`);
}
for(const flag of ['.hvc1','write(to: sidecar, options: .atomic)','didEnterBackgroundNotification','sourceDuration','kCMSampleAttachmentKey_NotSync']){
 assert.ok(native.includes(flag),`Missing native safety mechanism ${flag}`);
}
// Single-file capture is independent from the optional live transfer writer.
const recording=load('../../apps/mobile/modules/repere-meta/ios/RepereHEVCContinuousWriter.swift');
assert.match(recording,/AVAssetWriter\(outputURL: url, fileType: \.mov\)/);
assert.ok(recording.includes(`recording-\\(fileID).mov`));
assert.doesNotMatch(recording,/segment-%05d/);
assert.match(native,/let liveWriter = liveEnabled \?/);
assert.match(native,/Events\("onState","onSegment","onRecordingSaved","onError","onRealtimeState"\)/);
const def=JSON.parse(load('../../apps/mobile/modules/repere-meta/expo-module.config.json'));
assert.deepEqual(def.ios.modules,['RepereMetaModule']);
const pkg=JSON.parse(load('../../apps/mobile/modules/repere-meta/package.json'));
assert.equal(pkg.name,'repere-meta');
const podfile=load('../../apps/mobile/ios/Podfile');
assert.match(podfile,/post_integrate do/);
assert.match(podfile,/repere_link_meta_spm/);
const script=load('../../apps/mobile/ios/scripts/link-meta-spm.rb');
for(const value of ['META_PACKAGE_VERSION = \'1.0.1\'','MWDATCore','MWDATCamera','LeReperePermis','RepereMeta']) assert.ok(script.includes(value));
const ui=load('../../apps/mobile/src/components/MetaLivePanel.tsx');
assert.match(ui,/await native\.startCapture\(dir\.uri,remote\)/);
assert.match(ui,/recoverLocalSegments/);
assert.match(ui,/recoverLocalRecordings/);
assert.match(ui,/Vidéo complète sur cet iPhone/);
assert.match(ui,/AppState\.addEventListener/);
assert.match(ui,/Linking\.getInitialURL/);
assert.match(ui,/Enregistrer une vidéo/);
assert.match(ui,/Démarrer le direct/);
const api=load('../../apps/api/src/live.ts');
assert.match(api,/video_grants g WHERE g.video_id=v.id AND g.student_id=\$2/);
assert.match(api,/teacher_students t WHERE t.teacher_id=v.author_id AND t.student_id=\$2/);
assert.match(api,/storageSign\("GET"/);
assert.match(api,/BUDGET = 7 \* 1024 \* 1024 \* 1024/);
console.log('PASS Meta integration static preflight: version, SPM wiring, native, recovery, permissions, private live');
