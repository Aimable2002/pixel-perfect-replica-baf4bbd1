import type { CareerProfile } from './types';
export const applicationStatuses = ['Interested', 'Preparing', 'Awaiting Approval', 'Ready to Submit', 'Submitted', 'Action Required', 'Interview', 'Rejected', 'Successful', 'Expired'] as const;
export const careerPrompts = ['Find jobs in Rwanda', 'Review my career profile', 'Check application deadlines', 'Help prepare my application'];
export const careerOptions = {
  category: ['Technology', 'Finance', 'Design', 'Education', 'Healthcare', 'Hospitality', 'Sales & marketing', 'Operations', 'Engineering', 'Public service'],
  location: ['Kigali', 'Northern Province', 'Southern Province', 'Eastern Province', 'Western Province', 'Anywhere in Rwanda', 'Remote', 'East Africa'],
  employment: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'],
  level: ['Entry-level', 'Mid-level', 'Senior', 'Management'],
  salary: ['Below 300,000', '300,000–600,000', '600,000–1,000,000', '1,000,000–2,000,000', 'Above 2,000,000', 'Negotiable'],
  currency: ['RWF', 'USD'],
};
export function profileCompletion(profile: CareerProfile) {
  const fields = [profile.name, profile.email, profile.headline, profile.education, profile.experience, profile.skills, profile.languages, profile.category, profile.location, profile.documents.length ? 'document' : ''];
  return Math.round(fields.filter(v => v.trim()).length / fields.length * 100);
}
export function safeExternalUrl(value?: string) {
  if (!value) return undefined;
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : undefined; } catch { return undefined; }
}