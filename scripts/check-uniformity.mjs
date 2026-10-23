import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {generateProduct} from './generate-product.mjs';
await generateProduct({check:true});
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const product=JSON.parse(await read('packages/product/product.json'));
for(const file of ['src/shared/courses.ts','apps/mobile/src/pedagogy/courses.ts']){
 const text=await read(file);assert.match(text,/export \* from .*packages\/product\/src\/courses/,'Pas de seconde copie des cours : '+file);assert.ok(text.length<200);
}
for(const file of ['src/shared/core.ts'])assert.match(await read(file),/packages\/core\/src\/index/);
for(const file of ['src/CourseLearning.tsx','apps/mobile/src/components/CourseLearning.tsx'])assert.match(await read(file),/useProductQuiz/,'Le quiz doit utiliser le contrôleur partagé : '+file);
for(const file of ['src/CourseLearning.tsx','apps/mobile/src/screens/Pedagogy.tsx'])assert.match(await read(file),/useProductLearning/,'Le suivi doit utiliser le contrôleur partagé : '+file);
for(const file of ['src/app.tsx','apps/mobile/src/App.tsx'])assert.match(await read(file),/product.navigation/);
assert.match(await read('apps/mobile/src/theme.ts'),/product.colors/);
assert.match(await read('src/worker.js'),/product.apiOrigin/);
assert.match(await read('apps/mobile/src/config.ts'),/product.apiOrigin/);
assert.match(await read('src/VideoPlayer.tsx'),/packages\/ui-web\/src\/VideoPlayer/);
assert.match(await read('apps/mobile/src/screens/Videos.tsx'),/recordedVideoHtml/);
assert.equal(JSON.parse(await read('apps/mobile/eas.json')).build.base.env.EXPO_PUBLIC_API_URL,product.apiOrigin);
const lock=JSON.parse(await read('package-lock.json'));
for(const workspace of ['apps/mobile','apps/api','packages/core','packages/product','packages/ui-web'])assert.ok(lock.packages[workspace],`Workspace absent du verrou : ${workspace}`);
console.log('Uniformité validée : cours, quiz, suivi, navigation, lecteur, couleurs et serveur communs.');

for(const file of ['src/Teaching.tsx','apps/mobile/src/components/Teaching.tsx']){const source=await read(file);assert.match(source,/useTeacherSchedule/);assert.match(source,/useStudentDashboard/);assert.match(source,/studentStatistics/);}
