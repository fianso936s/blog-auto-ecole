// Executed by EAS BEFORE installing workspace dependencies (official lifecycle hook).
// The source archive was made without npm registry access; never invent lock integrity.
// On the internet-connected EAS runner, resolve real dependencies prior to npm ci.
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
const root = new URL('../', import.meta.url).pathname;
const lockFile = new URL('../package-lock.json', import.meta.url);
const dependencies = ['@livekit/react-native','@livekit/react-native-expo-plugin','@livekit/react-native-webrtc','@config-plugins/react-native-webrtc','livekit-client'];
let lock;
try { lock=JSON.parse(readFileSync(lockFile)); } catch { lock=null; }
const missing = dependencies.filter(name=> !lock?.packages?.[`node_modules/${name}`]?.integrity);
if (missing.length) {
  console.log(`LiveKit npm lock is incomplete (${missing.length} packages). Resolving via registry on EAS...`);
  execFileSync('npm',['install','--package-lock-only','--ignore-scripts','--no-audit','--no-fund'], {cwd:root,stdio:'inherit'});
  const fresh=JSON.parse(readFileSync(lockFile));
  for (const name of dependencies) {
    if(!fresh.packages?.[`node_modules/${name}`]?.integrity)throw Error(`Invalid LiveKit package lock for ${name}`);
  }
}
console.log('EAS dependencies lock ready.');
