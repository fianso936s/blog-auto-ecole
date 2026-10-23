/** Transaction notifications carry no identifiers or content; each client re-fetches its authorized catalog. */
import { Client } from 'pg';
import { EventEmitter } from 'node:events';
import { streamSSE } from 'hono/streaming';
import type { Hono } from 'hono';
import type { Env } from './security.js';
const changes = new EventEmitter();
changes.setMaxListeners(0);
let client: Client | undefined;
let connecting: Promise<void> | undefined;
let retry: ReturnType<typeof setTimeout> | undefined;
async function listen() {
  if (client || connecting) return connecting;
  connecting = (async () => {
    const address=new URL((process.env.APP_DATABASE_URL || process.env.DATABASE_URL)!);
    address.hostname=address.hostname.replace('-pooler.','.'); // LISTEN needs a session, outside a transaction pool.
    const next = new Client({connectionString:address.toString(),connectionTimeoutMillis:10000});
    const failed = () => {
      if (client === next) client = undefined;
      void next.end().catch(()=>{});
      if (changes.listenerCount('change') && !retry) retry = setTimeout(()=>{retry=undefined;void listen().catch(()=>{});},3000);
    };
    next.on('error',failed);
    next.on('end',()=>{if(client===next)failed();});
    try {
      await next.connect();
      await next.query('LISTEN repere_content');
      client=next;
      next.on('notification',()=>changes.emit('change'));
      changes.emit('change'); // catch updates during a reconnect.
    } catch (error) {failed();throw error;}
  })().finally(()=>{connecting=undefined;});
  return connecting;
}
export function installContentEvents(app:Hono<Env>) {
  app.get('/v1/content/events', c => {
    c.header('X-Accel-Buffering','no');
    return streamSSE(c, async stream => {
      let stopped=false, pending=false, writing=false;
      const send=async()=>{
        pending=true;
        if(writing||stopped)return;
        writing=true;
        try {while(pending&&!stopped){pending=false;await stream.writeSSE({event:'content',data:'changed'});}}
        catch {stopped=true;}
        finally {writing=false;}
      };
      const changed=()=>{void send();};
      changes.on('change',changed);
      stream.onAbort(()=>{stopped=true;changes.off('change',changed);});
      try {
        await send();
        await listen();
        // Bound connection lifetime: re-authenticate regularly via EventSource reconnect.
        for(let i=0;i<12&&!stopped;i++) {
          await stream.sleep(15000);
          if(!stopped)await stream.writeSSE({event:'ping',data:'ok'});
        }
      } finally {
        stopped=true;changes.off('change',changed);
        if(!changes.listenerCount('change')){
          if(retry){clearTimeout(retry);retry=undefined;}
          const old=client;client=undefined;await old?.end().catch(()=>{});
        }
      }
    });
  });
}
