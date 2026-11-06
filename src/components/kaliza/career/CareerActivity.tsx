import { Link } from '@tanstack/react-router';
import { Activity } from 'lucide-react';
import { AppShell } from '../AppShell';
import { PageHeader, EmptyState } from '../common';
import { Button } from '@/components/ui/button';
import { CareerNotice, CareerChatButton, useCareerData } from './shared';
export function CareerActivity(){const {activity}=useCareerData();return <AppShell><PageHeader title="Career activity" description="Your search, one step at a time." actions={<CareerChatButton/>}/><CareerNotice/>{activity.length?activity.map(a=><div key={a.id} className="flex items-start gap-3 border-b py-5"><Activity className="mt-1 size-4 shrink-0 text-primary"/><div className="min-w-0 flex-1"><p className="text-sm">{a.text}</p><p className="mt-2 text-xs text-muted-foreground">{new Date(a.time).toLocaleString()}</p></div>{a.applicationId&&<Button asChild variant="outline" size="sm"><Link to="/career/applications/$id" params={{id:a.applicationId}}>Review</Link></Button>}</div>):<EmptyState title="No career activity yet" body="Your saved opportunities and application history will appear here."/>}</AppShell>;}
