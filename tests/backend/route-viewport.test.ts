import { test } from "node:test";
import assert from "node:assert/strict";
import { routeBounds } from "../../apps/mobile/src/services/route-viewport.ts";
test("GPX viewport includes every point even if endpoints coincide", () => {
  assert.deepEqual(routeBounds([{lng:2,lat:48},{lng:4,lat:46},{lng:-1,lat:50},{lng:2,lat:48}]), [-1,46,4,50]);
});
test("large imported tracks fit without argument stack overflow", () => {
  assert.deepEqual(routeBounds(Array.from({length:200000}, (_,i)=>({lng:i/10000,lat:48}))), [0,48,19.9999,48]);
  assert.equal(routeBounds([]), null);
});

import {replayBearing} from '../../apps/mobile/src/services/route-viewport.ts';
test('GPS replay points forward, including the final point',()=>{
 const fixes=[{lat:48,lng:2,segment:0},{lat:48,lng:2.001,segment:0},{lat:48,lng:2.002,segment:0}];
 assert.ok(Math.abs(replayBearing(fixes,0)!-90)<1);
 assert.ok(Math.abs(replayBearing(fixes,2)!-90)<1);
 assert.equal(replayBearing([{lat:48,lng:2,segment:0},{lat:48,lng:2,segment:0}],0),null);
});
test('GPS replay never uses a fix across a recording gap',()=>{
 assert.equal(replayBearing([{lat:48,lng:2,segment:0},{lat:49,lng:3,segment:1}],0),null);
 const n=replayBearing([{lat:48,lng:2,segment:0},{lat:48.001,lng:2,segment:0},{lat:49,lng:3,segment:1}],1)!;
 assert.ok(n<1||n>359);
});
