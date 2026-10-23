import type {Hono} from 'hono';
import {z} from 'zod';
import {pool} from './db.js';
import {writer,type Env} from './security.js';
export function installMetaDevices(app:Hono<Env>){
 app.get('/v1/meta/device',async c=>{const p=c.get('profile');writer(p);const r=await pool.query('SELECT module_present AS "modulePresent",available,connected,registered,frames_recent AS "framesRecent",source,app_version AS "appVersion",updated_at AS "updatedAt" FROM meta_device_status WHERE user_id=$1',[p.id]);const device=r.rows[0]||null;return c.json({nativeRequired:true,device,online:!!device&&Date.now()-new Date(device.updatedAt).getTime()<45000,openAppUrl:'reperespot://meta-live'});});
 app.put('/v1/meta/device',async c=>{const p=c.get('profile');writer(p);const data=z.object({modulePresent:z.boolean(),available:z.boolean(),connected:z.boolean(),registered:z.boolean(),framesRecent:z.boolean(),source:z.string().max(30),appVersion:z.string().max(30)}).strict().parse(await c.req.json());await pool.query('INSERT INTO meta_device_status(user_id,module_present,available,connected,registered,frames_recent,source,app_version) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(user_id) DO UPDATE SET module_present=$2,available=$3,connected=$4,registered=$5,frames_recent=$6,source=$7,app_version=$8,updated_at=now()',[p.id,data.modulePresent,data.available,data.connected,data.registered,data.framesRecent,data.source,data.appVersion]);return c.json({ok:true});});
}
