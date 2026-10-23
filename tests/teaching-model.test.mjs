import test from 'node:test';import assert from 'node:assert/strict';import {build} from 'esbuild';
const r=await build({entryPoints:['packages/product/src/teaching.ts'],bundle:true,write:false,platform:'node',format:'esm'});const {schoolTime,monday,teachingWeek,studentStatistics}=await import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].contents).toString('base64'));
test('planning keeps school hours in Paris across daylight-saving transitions',()=>{
 assert.equal(schoolTime('2026-10-24',8),'2026-10-24T06:00:00.000Z');assert.equal(schoolTime('2026-10-25',8),'2026-10-25T07:00:00.000Z');assert.equal(schoolTime('2027-03-28',8),'2027-03-28T06:00:00.000Z');assert.equal(monday(new Date('2026-10-25T23:30:00Z')),'2026-10-26');
 const days=teachingWeek('2026-10-19');assert.equal(days.length,7);assert.equal(days[0].slots.length,12);assert.equal(days[6].slots[0].start,'2026-10-25T07:00:00.000Z');
});
test('student dashboard separates theoretical activity, best quiz results and practical validation',()=>{
 const stats=studentStatistics({reading:[{read:true},{read:false}],quizzes:[{bestScore:2,total:2,attempts:3},{bestScore:1,total:2,attempts:1}],plan:[{active:true,level:'validated'},{active:true,level:'working'}],routes:[{fixIndex:2,fixCount:3},{fixIndex:0,fixCount:5}]},4);
 assert.equal(stats.theoryPercent,25);assert.equal(stats.bestScorePercent,75);assert.equal(stats.attempts,4);assert.equal(stats.validated,1);assert.equal(stats.completedRoutes,1);
});
