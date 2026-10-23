import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";

test("a map initialized in a hidden dialog follows its actual dimensions and Safari viewport changes", async () => {
  const result=await build({entryPoints:["src/shared/map-size.ts"],bundle:true,write:false,format:"esm",platform:"node"});
  const {observeMapSize}=await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].contents).toString("base64")}`);
  const prior={window:globalThis.window,ResizeObserver:globalThis.ResizeObserver};
  let observed,disconnected=false,frame=0,callback;
  const events=new Map(),viewportEvents=new Map(),sizes=[];
  const element={clientWidth:0,clientHeight:0};
  globalThis.ResizeObserver=class {constructor(fn){observed=fn;}observe(node){assert.equal(node,element);}disconnect(){disconnected=true;}};
  globalThis.window={requestAnimationFrame(fn){callback=fn;return ++frame;},cancelAnimationFrame(){callback=null;},addEventListener(k,fn){events.set(k,fn);},removeEventListener(k){events.delete(k);},visualViewport:{addEventListener(k,fn){viewportEvents.set(k,fn);},removeEventListener(k){viewportEvents.delete(k);}}};
  const flush=()=>{const fn=callback;callback=null;fn?.();};
  try {
    const stop=observeMapSize(element,{resize(){sizes.push([element.clientWidth,element.clientHeight]);}});
    flush();assert.deepEqual(sizes,[],"do not size the canvas from a hidden dialog");
    element.clientWidth=390;element.clientHeight=520;observed();flush();
    assert.deepEqual(sizes,[[390,520]],"fill the real stage when the dialog opens");
    observed();flush();assert.equal(sizes.length,1,"unchanged size does not interrupt camera animations");
    element.clientHeight=620;viewportEvents.get("resize")();flush();
    assert.deepEqual(sizes.at(-1),[390,620],"Safari browser bars change the map height");
    element.clientWidth=844;element.clientHeight=240;observed();flush();
    assert.deepEqual(sizes.at(-1),[844,240],"support landscape");
    stop();assert.ok(disconnected);assert.equal(events.size,0);assert.equal(viewportEvents.size,0);
    observed();assert.equal(callback,null);
  } finally {Object.assign(globalThis,prior);}
});
