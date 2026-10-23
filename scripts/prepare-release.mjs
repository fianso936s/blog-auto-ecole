/** Execute on a machine with registry access BEFORE requesting an EAS iOS build.
 * Refresh and validate package-lock, preserving SRI integrity hashes.
 */
import {execFileSync} from "node:child_process";
import {readFileSync} from "node:fs";
const root = new URL("../", import.meta.url).pathname;
const run = (file,args) => execFileSync(file,args,{cwd:root,stdio:"inherit",env:process.env});
run("npm",["install","--no-audit","--no-fund"]);
run("npm",["ci","--no-audit","--no-fund"]);
const lock=JSON.parse(readFileSync(new URL("../package-lock.json",import.meta.url)));
for(const name of ["@livekit/react-native","livekit-client","@livekit/react-native-webrtc","@livekit/react-native-expo-plugin","@config-plugins/react-native-webrtc"]){
  const item=lock.packages?.[`node_modules/${name}`];
  if(!item?.integrity) throw Error(`${name}: missing integrity record in package-lock`);
}
console.log("Lockfile and React Native dependencies validated; ready for native EAS checks.");
