import test from 'node:test';
import assert from 'node:assert/strict';
import {connectionLabel,diagnosticEvent} from '../../apps/mobile/src/services/diagnostic-data';

test('association remains confirmed when BLE connection drops',()=>{
  assert.equal(connectionLabel({registered:true,available:false,connected:false}),'Lunettes associées · connexion en attente');
  assert.equal(connectionLabel({registered:false,available:true,connected:false}),'Lunettes non associées');
  assert.equal(connectionLabel({registered:true,available:true,connected:true}),'Lunettes associées · connectées');
});
test('technical logs reject arbitrary keys and never copy response objects',()=>{
  assert.throws(()=>diagnosticEvent('token=secret',true));
  const e=diagnosticEvent('frames',false,NaN);
  assert.deepEqual(Object.keys(e).sort(),['at','ok','step']);
  assert.equal(diagnosticEvent('frames',true,24).value,24);
});
