import { useQuery, useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Bookmark, MapPin, CalendarDays, ArrowUpRight, Briefcase, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getCareerProfile, getCareerJobs, getCareerApplications, getCareerActivity, saveCareerJob, type JobOpportunity } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { safeExternalUrl } from '@/lib/career';
export const careerQueries = {
 profile: { queryKey: ['career','profile'], queryFn: getCareerProfile },
 jobs: { queryKey: ['career','jobs'], queryFn: getCareerJobs },
 applications: { queryKey: ['career','applications'], queryFn: getCareerApplications },
 activity: { queryKey: ['career','activity'], queryFn: getCareerActivity },
};
export function useCareerData() {
 const profile=useSuspenseQuery(careerQueries.profile).data;
 const jobs=useSuspenseQuery(careerQueries.jobs).data;
 const applications=useSuspenseQuery(careerQueries.applications).data;
 const activity=useSuspenseQuery(careerQueries.activity).data;
 return {profile,jobs,applications,activity};
}
export function CareerNotice(){return <p role="status" className="mb-6 border-l-2 border-warning bg-warning/10 px-4 py-3 text-xs leading-5 text-muted-foreground">Career preview · Vacancies are fictional examples. Profile edits and files last for this session only. Live research, AI preparation and employer submission are not connected.</p>;}
export function CareerChatButton({prompt='Help me with my career search'}:{prompt?:string}){return <Button variant="outline" onClick={()=>window.dispatchEvent(new CustomEvent('kaliza-chat',{detail:{service:'career',prompt}}))}><MessageCircle className="size-4"/>Chat with Kaliza</Button>;}
export function ExternalLink({url,label}:{url?:string|undefined;label:string}){const safe=safeExternalUrl(url);return safe?<Button asChild variant="outline"><a href={safe} target="_blank" rel="noopener noreferrer">{label}<ArrowUpRight className="size-4"/></a></Button>:null;}
export function JobCard({job}:{job:JobOpportunity}){const qc=useQueryClient();return <article className="flex flex-col rounded-lg border bg-card p-5"><div className="flex items-start gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><Briefcase className="size-5"/></div><div className="min-w-0 flex-1"><p className="text-[10px] uppercase text-muted-foreground">Fictional sample · {job.category}</p><Link to="/career/opportunities/$id" params={{id:job.id}} className="mt-1 block font-semibold hover:text-primary">{job.title}</Link><p className="mt-1 text-xs text-muted-foreground">{job.employer}</p></div><Button size="icon" variant="ghost" aria-label={job.saved?'Unsave job':'Save job'} aria-pressed={job.saved} onClick={async()=>{try{await saveCareerJob(job.id,!job.saved);await qc.invalidateQueries({queryKey:['career']});}catch(e){toast.error(e instanceof Error?e.message:'Could not save job');}}}><Bookmark className={job.saved?'size-4 fill-primary text-primary':'size-4'}/></Button></div><div className="mt-5 flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><MapPin className="size-3"/>{job.location}</span><span>{job.employment}</span><span>{job.level}</span></div><p className="mt-4 flex items-center gap-1 text-xs"><CalendarDays className="size-3 text-warning"/>Deadline {new Date(job.deadline).toLocaleDateString()}</p><div className="mt-4 border-t pt-4 text-xs text-muted-foreground">{job.match===null?'Match analysis pending':`${job.match}% match`}<p className="mt-2 leading-5">{job.analysis}</p></div><Button asChild variant="outline" className="mt-5"><Link to="/career/opportunities/$id" params={{id:job.id}}>Review opportunity<ArrowUpRight className="size-4"/></Link></Button></article>;}
