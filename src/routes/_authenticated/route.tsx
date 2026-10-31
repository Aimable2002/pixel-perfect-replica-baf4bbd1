import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { getCurrentUser } from '@/lib/api';
export const Route = createFileRoute('/_authenticated')({ ssr: false, beforeLoad: async () => { const user=await getCurrentUser(); if(!user && sessionStorage.getItem('kaliza-demo') !== 'true') throw redirect({to:'/auth'}); }, component: Outlet });
