export const SCHOOL_ZONE='Europe/Paris';
export type TeacherSlot={id:string;teacherId:string;start:string;end:string;open:boolean;version:number;studentId?:string|null;studentName?:string|null};
export type BookableStudent={id:string;name:string;email:string};
export function parisDay(date=new Date()){const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:SCHOOL_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).map(p=>[p.type,p.value]));return `${p.year}-${p.month}-${p.day}`;}
export function addDays(day:string,count:number){const date=new Date(day+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+count);return date.toISOString().slice(0,10);}
export function monday(date=new Date()){const day=parisDay(date),weekday=new Date(day+'T12:00:00Z').getUTCDay();return addDays(day,-((weekday+6)%7));}
export function schoolTime(day:string,hour:number){
 const target=Date.parse(day+'T'+String(hour).padStart(2,'0')+':00:00Z');let utc=target;
 const formatter=new Intl.DateTimeFormat('en-CA',{timeZone:SCHOOL_ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 for(let i=0;i<2;i++){const p=Object.fromEntries(formatter.formatToParts(new Date(utc)).map(p=>[p.type,p.value]));const shown=Date.parse(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}Z`);utc+=target-shown;}
 return new Date(utc).toISOString();
}
export function teachingWeek(start:string){return Array.from({length:7},(_,day)=>({date:addDays(start,day),slots:Array.from({length:12},(_,index)=>{const hour=8+index;return {start:schoolTime(addDays(start,day),hour),end:schoolTime(addDays(start,day),hour+1),hour};})}));}
export function studentStatistics(detail:any,totalCourses:number){
 const reads=detail?.reading||[],quizzes=detail?.quizzes||[],plans=detail?.plan||[],routes=detail?.routes||[];
 const read=reads.filter((r:any)=>r.read).length,passed=quizzes.filter((q:any)=>q.bestScore===q.total).length,attempts=quizzes.reduce((n:number,q:any)=>n+q.attempts,0),possible=quizzes.reduce((n:number,q:any)=>n+q.total,0),score=quizzes.reduce((n:number,q:any)=>n+q.bestScore,0);
 const activity=[...reads.map((r:any)=>r.updatedAt),...quizzes.map((q:any)=>q.lastAttempt),...routes.map((r:any)=>r.updatedAt)].filter(Boolean).sort();
 return {read,passed,attempts,theoryPercent:totalCourses?Math.min(100,Math.round((read+passed)/(2*totalCourses)*100)):0,bestScorePercent:possible?Math.round(score/possible*100):null,assigned:plans.filter((p:any)=>p.active).length,validated:plans.filter((p:any)=>p.active&&p.level==='validated').length,routes:routes.length,completedRoutes:routes.filter((r:any)=>r.fixCount>1&&r.fixIndex>=r.fixCount-1).length,lastActivity:activity.at(-1)||null};
}
