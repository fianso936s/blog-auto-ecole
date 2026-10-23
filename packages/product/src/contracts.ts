/** Public API contract; authentication is supplied by a platform adapter. Never stores tokens. */
export type Transport=<T=any>(path:string,method?:string,body?:unknown)=>Promise<T>;
export type Reading=Record<string,{read?:boolean;review?:boolean}>;
export type QuizStat={courseId:string;bestScore:number;total:number;attempts:number};
export type Plan={courseId:string;active:boolean;level:string;note:string};
export type Learning={reading:{courseId:string;read:boolean;review:boolean}[];quizzes:QuizStat[];plan:Plan[]};
export type Quiz={revision:string;questions:{id:string;question:string;options:string[]}[]};
export type QuizResult={score:number;total:number;passed:boolean;corrections:{id:string;correct:boolean;answer:number;explanation:string}[]};
const segment=(value:string)=>encodeURIComponent(value);
export const paths={courses:'/v1/courses',learning:'/v1/courses/me',students:'/v1/students',teaching:'/v1/courses/students',videos:'/v1/videos',routes:'/v1/routes',events:'/v1/content/events',
 course:(id:string)=>`/v1/courses/${segment(id)}`,student:(id:string)=>`/v1/courses/students/${segment(id)}`,video:(id:string)=>`/v1/videos/${segment(id)}`,route:(id:string)=>`/v1/routes/${segment(id)}`};
export function createProductClient(send:Transport){
 return {teachers:()=>send<{teachers:{id:string;name:string}[]}>('/v1/teaching/teachers'),slots:(teacherId:string,from:string,to:string)=>send<{slots:import('./teaching').TeacherSlot[]}>(`/v1/teaching/slots?teacherId=${segment(teacherId)}&from=${segment(from)}&to=${segment(to)}`),slot:(body:{teacherId:string;start:string;end:string;open:boolean;expectedVersion:number})=>send<{slot:import('./teaching').TeacherSlot}>('/v1/teaching/slots','PUT',body),learning:()=>send<Learning>(paths.learning),read:(id:string,patch:{read?:boolean;review?:boolean})=>send(paths.course(id)+'/progress','PUT',patch),
  quiz:(id:string)=>send<Quiz>(paths.course(id)+'/quiz'),answer:(id:string,body:{revision:string;attemptId:string;answers:Record<string,number>})=>send<QuizResult>(paths.course(id)+'/quiz','POST',body),
  students:()=>send<{students:any[]}>(paths.teaching),student:(id:string)=>send<any>(paths.student(id)),plan:(student:string,id:string,body:Pick<Plan,'active'|'level'|'note'>)=>send(paths.student(student)+'/plan/'+segment(id),'PUT',body),
  shareVideo:(id:string,students:string[],published:boolean)=>send(paths.video(id)+'/grants','PUT',{students,published}),
  routeProgress:(id:string,fixIndex:number)=>send(paths.route(id)+'/progress','POST',{fixIndex})};
}
export type ProductClient=ReturnType<typeof createProductClient>;
export function studyProgress(ids:string[],reading:Reading,quizzes:QuizStat[],plan:Plan[]){
 const assigned=plan.filter(p=>p.active);const path=assigned.length?ids.filter(id=>assigned.some(p=>p.courseId===id)):ids;
 const read=path.filter(id=>reading[id]?.read).length,passed=path.filter(id=>quizzes.some(q=>q.courseId===id&&q.bestScore===q.total)).length;
 return {path,read,passed,percent:path.length?Math.round((read+passed)/(path.length*2)*100):0};
}
