import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=async p=>readFile(path.join(root,p),'utf8');
const hash=value=>createHash('sha256').update(value).digest('hex');
export async function productOutputs(){
 const product=JSON.parse(await read('packages/product/product.json'));
 const bundle=await build({entryPoints:[path.join(root,'packages/product/src/courses.ts')],bundle:true,write:false,platform:'node',format:'esm'});
 const {courses,courseSources}=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].contents).toString('base64')}`);
 const questions=JSON.parse(await read('packages/assessment/questions.json'));
 for(const q of questions){if(!Array.isArray(q.questions)||!q.questions.length||new Set(q.questions.map(v=>v.id)).size!==q.questions.length||q.questions.some(v=>typeof v.id!=="string"||typeof v.question!=="string"||!Array.isArray(v.options)||v.options.length<2||v.options.some(o=>typeof o!=="string")||!Number.isInteger(v.answer)||v.answer<0||v.answer>=v.options.length||typeof v.explanation!=="string"))throw Error("Questions incohérentes pour "+q.id);}
 const bank=new Map(questions.map(q=>[q.id,q]));
 if(bank.size!==courses.length||courses.some(c=>!bank.has(c.id)))throw Error('Chaque cours doit avoir ses questions serveur.');
 const catalog=courses.map(course=>{const q=bank.get(course.id);const contentHash=hash(JSON.stringify({course,questions:q.questions}));if(!q.contentHash)throw Error('Initialiser le hash source des questions '+course.id);return {...course,questions:q.questions,revision:contentHash===q.contentHash?q.revision:contentHash.slice(0,16)};});
 const coreFiles=['index','controller','learning','street-replay'];const core=await Promise.all(coreFiles.map(name=>read(`packages/core/src/${name}.ts`)));
 const shared=await Promise.all(["packages/product/src/contracts.ts","packages/product/src/hooks.ts","packages/product/src/content.ts","packages/product/src/teaching.ts","packages/product/src/student-experience.ts","packages/ui-web/src/VideoPlayer.tsx","src/style.css"].map(read));
 const revision=hash(JSON.stringify({product,catalog,core,shared})).slice(0,20);
 const release={version:product.version,revision,apiOrigin:product.apiOrigin,courseCount:courses.length,questionCount:catalog.reduce((n,c)=>n+c.questions.length,0)};
 const tokens='/* Generated from packages/product/product.json. */\n:root {\n'+Object.entries(product.colors).map(([key,value])=>`  --${key.replace(/[A-Z]/g,l=>'-'+l.toLowerCase())}: ${value};`).join('\n')+'\n}\n';
 const eas=JSON.parse(await read('apps/mobile/eas.json'));eas.build.base.env.EXPO_PUBLIC_API_URL=product.apiOrigin;
 const apiPackage=JSON.parse(await read('apps/mobile/package.json'));apiPackage.version=product.version;
 const player=await build({entryPoints:[path.join(root,'packages/ui-web/src/native-player-entry.tsx')],bundle:true,write:false,platform:'browser',format:'iife',minify:true,jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},target:'safari16'});
 // Shared controls use the same CSS rules, including the mobile media query.
 const css=await read('src/style.css');const segments=['.btn {','.btn.secondary {','.video-player {','.recorded-video, .video-seek {','.video-seek {','.video-seek label {','.video-seek label span {','.video-seek input[type="range"] {','.video-seek-actions {','.video-seek-actions .btn {'];
 const rules=segments.map(start=>{const from=css.indexOf(start);if(from<0)throw Error('Style lecteur absent '+start);return css.slice(from,css.indexOf('}',from)+1);}).join('\n');
 const mobile='@media(max-width:620px){.video-seek-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.video-seek-actions .btn:first-child{grid-column:1/-1}.recorded-video .video-player{min-height:0;max-height:45dvh}}';
 const staticHtml='<!doctype html><html lang="fr"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>'+tokens+'*{box-sizing:border-box}body{margin:0;padding:12px;background:var(--paper);color:var(--ink);font-family:-apple-system,sans-serif}button,input{font:inherit}'+rules+mobile+'</style><div id="root"></div><script>window.__REPERE_VIDEO_SRC__=__SRC__;</script><script>'+player.outputFiles[0].text.replace(/<\/script/gi,'<\\/script')+'</script></html>';
 const nativePlayer='// Generated from the same React VideoPlayer used by the site.\nconst template='+JSON.stringify(staticHtml)+';\nexport const recordedVideoHtml=(src:string)=>template.replace("__SRC__",()=>JSON.stringify(src).replace(/</g,"\\\\u003c"));\n';
 return new Map([
  ['src/generated/product-tokens.css',tokens],['packages/product/generated/release.json',JSON.stringify(release,null,2)+'\n'],
  ['apps/api/src/course-catalog.json',JSON.stringify(catalog,null,2)+'\n'],['apps/api/src/product-content.json',JSON.stringify({release,courses,courseSources},null,2)+'\n'],
  ['apps/mobile/ios/LeReperePermis/Info.plist',(await read('apps/mobile/ios/LeReperePermis/Info.plist')).replace(/(<key>CFBundleShortVersionString<\/key>\s*<string>)[^<]+/,(_,prefix)=>prefix+product.version)],
  ['apps/mobile/ios/LeReperePermis.xcodeproj/project.pbxproj',(await read('apps/mobile/ios/LeReperePermis.xcodeproj/project.pbxproj')).replace(/MARKETING_VERSION = [^;]+;/g,'MARKETING_VERSION = '+product.version+';')],
  ['apps/mobile/src/generated/video-player.ts',nativePlayer],['apps/mobile/eas.json',JSON.stringify(eas,null,2)+'\n'],['apps/mobile/package.json',JSON.stringify(apiPackage,null,2)+'\n']
 ]);
}
export async function generateProduct({check=false}={}){const outputs=await productOutputs();for(const [p,content] of outputs){if(check){if(await read(p).catch(()=>null)!==content)throw Error(`Fichier généré divergent : ${p}. Lancez npm run product:generate.`);}else{await mkdir(path.dirname(path.join(root,p)),{recursive:true});await writeFile(path.join(root,p),content);}}return outputs;}
if(process.argv[1]===import.meta.filename){await generateProduct({check:process.argv.includes('--check')});console.log('Produit web/iOS : contenus, serveur, lecteur et identité vérifiés.');}
