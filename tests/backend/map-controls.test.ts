import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

test('direction arrows use screen coordinates in 2D/3D; long press suppresses trailing tap', async () => {
  let refs=0; const moves:any[]=[]; const long:any[]=[];const taps:any[]=[];
  const camera={easeTo:(v:any)=>moves.push(v)};
  const map={getCenter:async()=>[2,48],project:async()=>[160,220],unproject:async(p:any)=>{moves.push(p);return [2.1,48.1];}};
  const react={createElement:(type:any,props:any,...children:any[])=>({type,props:props||{},children}),useEffect:()=>{},useMemo:(fn:any)=>fn(),useState:(v:any)=>[v,()=>{}],useRef:(v:any)=>({current:refs++===0?camera:refs===2?map:v})};
  const mocks:any={react:{__esModule:true,default:react,...react},'react-native':{View:'View',Text:'Text',Pressable:'Pressable'},'@maplibre/maplibre-react-native':{Map:'Map',Camera:'Camera'},'@repere/core':{geometry:()=>({type:'LineString',coordinates:[]})},'../services/route-viewport':{},'../theme':{colors:{}},'./UI':{Icon:'Icon'},'react-native-reanimated':{useReducedMotion:()=>false}};
  const module={exports:{} as any};const js=ts.transpileModule(readFileSync(new URL('../../apps/mobile/src/components/RouteMap.tsx',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText;
  vm.runInNewContext(js,{module,exports:module.exports,Date,require:(n:string)=>{if(!(n in mocks))throw Error(n);return mocks[n];}});
  const tree=module.exports.RouteMap({showPanControls:true,onLongPress:(p:any)=>long.push(p),onTap:(p:any)=>taps.push(p)});
  const nodes:any[]=[];function visit(n:any){if(!n||typeof n!=='object')return;if(Array.isArray(n)){n.forEach(visit);return;}nodes.push(n);n.children?.forEach(visit);}visit(tree);
  const native=nodes.find(n=>n.type==='Map');native.props.onLongPress({nativeEvent:{lngLat:[2.3123,48.9123]}});native.props.onPress({nativeEvent:{lngLat:[2.3123,48.9123]}});
  assert.equal(long.length,1);assert.equal(long[0].lng,2.3123);assert.equal(taps.length,0);
  const arrows=nodes.filter(n=>n.type==='Pressable'&&n.props.accessibilityLabel?.startsWith('Déplacer la carte'));
  assert.equal(arrows.length,4);
  for (const [index, expected] of [[0,[160,140]],[1,[80,220]],[2,[240,220]],[3,[160,300]]] as const) {
    moves.length=0; arrows[index]!.props.onPress();await new Promise(resolve=>setImmediate(resolve));
    assert.deepEqual(Array.from(moves[0]),expected);assert.deepEqual(Array.from(moves[1].center),[2.1,48.1]);
  }
});
