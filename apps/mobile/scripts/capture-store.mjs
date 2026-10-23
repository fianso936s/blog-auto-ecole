import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
if (process.env.EAS_BUILD_PROFILE !== 'screenshots') process.exit(0);
const run = (args) => execFileSync('xcrun', args, { encoding: 'utf8', timeout: 180000 });
const devices = JSON.parse(run(['simctl', 'list', 'devices', 'available', '--json']));
const candidates = Object.values(devices.devices).flat();
const device = candidates.find(d => d.name === 'iPhone 17 Pro') || candidates.find(d => /iPhone.*Pro$/.test(d.name));
if (!device) throw new Error('No medium Dynamic Island iPhone simulator available');
function findApp(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    if (!item.isDirectory()) continue;
    const path = join(dir, item.name);
    if (item.name.endsWith('.app') && !item.name.includes('Tests')) return path;
    const found = findApp(path); if (found) return found;
  }
}
const app = findApp('ios/build/Build/Products');
if (!app) throw new Error('Simulator .app not found');
if (device.state !== 'Booted') run(['simctl', 'boot', device.udid]);
run(['simctl', 'bootstatus', device.udid, '-b']);
run(['simctl', 'status_bar', device.udid, 'override', '--time', '9:41', '--batteryState', 'charged', '--batteryLevel', '100']);
run(['simctl', 'install', device.udid, app]);
run(['simctl', 'launch', device.udid, 'fr.lerepere.spot']);
mkdirSync('store-captures', { recursive: true });
await new Promise(resolve => setTimeout(resolve, 15000));
run(['simctl', 'io', device.udid, 'screenshot', 'store-captures/01-accueil.png']);
writeFileSync('store-captures/device.json', JSON.stringify({ name: device.name, udid: device.udid, app }, null, 2));
console.log('Real simulator screenshot saved to store-captures/01-accueil.png');
