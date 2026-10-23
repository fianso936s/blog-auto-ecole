import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

test('replay opens any marker without moving progression or starting a quiz; archived markers stay hidden', () => {
  const updates:Record<number,unknown>={}; let state=0;
  const react={createElement:(type:any,props:any,...children:any[])=>({type,props:props||{},children}),useEffect:()=>{},useMemo:(fn:any)=>fn(),useState:(v:any)=>{const id=state++;return [v,(next:any)=>{updates[id]=next;}];},useRef:(v:any)=>({current:v})};
  const point={id:'point-a',name:'Far ahead',lat:48.9,lng:2.3,fixIndex:99,category:'Observation',photos:[],validated:false};
  const mocks:any={react:{__esModule:true,default:react,...react},'react-native':{Modal:'Modal',Text:'Text',View:'View',Pressable:'Pressable',AppState:{currentState:'active'}},'react-native-reanimated':{useReducedMotion:()=>true},'expo-crypto':{randomUUID:()=> 'uuid'},'@repere/core':{replayIndices:()=>[0,99]},'../state':{useApp:()=>({archivedPointIds:['archived'],config:{},profile:{id:'student'}})},'../theme':{colors:{},styles:{}},'../services/route-viewport':{replayBearing:()=>null},'../services/auth':{},'../services/local':{},'../components/UI':{Button:'Button',Chip:'Chip',IconButton:'IconButton',Sheet:'Sheet'},'../components/RouteMap':{RouteMap:'RouteMap'},'../components/ContentSafety':{ContentSafety:'ContentSafety'},'../components/PointEditor':{PointReader:'PointReader'},'../components/MapModeBar':{MapModeBar:'MapModeBar'},'../components/ModalFrame':{ModalFrame:'ModalFrame'},'../components/StreetViewButton':{StreetViewButton:'StreetViewButton'},'../components/PhotoGallery':{PhotoGallery:'PhotoGallery'}};
  const module={exports:{} as any};const js=ts.transpileModule(readFileSync(new URL('../../apps/mobile/src/screens/Replay.tsx',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText;
  vm.runInNewContext(js,{module,exports:module.exports,require:(name:string)=>{assert.ok(name in mocks,name);return mocks[name];}});
  const tree=module.exports.Replay({visible:true,route:{id:'route',version:1,progress:0,fixes:[],points:[point,{...point,id:'archived'}]},onClose:()=>{}});
  const nodes:any[]=[];function visit(n:any){if(!n||typeof n!=='object')return;if(Array.isArray(n)){n.forEach(visit);return;}nodes.push(n);n.children?.forEach(visit);}visit(tree);
  const map=nodes.find(n=>n.type==='RouteMap');assert.equal(map.props.points.length,1);map.props.onPoint(point);
  assert.equal(updates[1],false,'inspection pauses playback');assert.equal(updates[4],point,'exact clicked marker opens');assert.equal(updates[0],undefined,'inspection never seeks playback');assert.equal(updates[6],undefined,'inspection does not start automatic quiz');
  const entry=nodes.find(n=>n.type==='Pressable'&&n.props.accessibilityLabel==='Consulter Far ahead');assert.ok(entry);entry.props.onPress();assert.equal(updates[4],point);
});
