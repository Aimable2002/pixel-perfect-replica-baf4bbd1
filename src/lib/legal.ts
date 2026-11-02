import { z } from 'zod';

export const legalFields = [
  ['Identity', 'companyName', 'Company legal name'],
  ['Identity', 'registrationNumber', 'Company registration number'],
  ['Identity', 'registeredAddress', 'Registered address'],
  ['Identity', 'privacyEmail', 'Privacy email'],
  ['Identity', 'supportEmail', 'Support email'],
  ['Identity', 'dpoContact', 'Data protection officer name and contact'],
  ['Identity', 'productionDomain', 'Production website URL'],
  ['Policy', 'effectiveDate', 'Effective date'],
  ['Policy', 'version', 'Policy version'],
  ['Providers', 'hostingProvider', 'Account and database hosting provider'],
  ['Providers', 'sandboxProvider', 'Sandbox provider (if activated)'],
  ['Providers', 'modelProviders', 'AI model providers (if activated)'],
  ['Providers', 'voiceProvider', 'Voice provider (if activated)'],
  ['Providers', 'storageProvider', 'File storage provider (if activated)'],
  ['Providers', 'paymentProcessor', 'Payment processor (if activated)'],
  ['Providers', 'emailProvider', 'Email and notification provider'],
  ['Providers', 'processingLocations', 'Processing countries and regions'],
  ['Compliance', 'ncsaCertificate', 'NCSA registration certificate number'],
  ['Compliance', 'transferAuthorization', 'Verified overseas storage and transfer arrangements'],
  ['Compliance', 'authorityContact', 'Data protection authority contact'],
  ['Compliance', 'trainingPolicy', 'Verified AI provider training policy'],
  ['Compliance', 'securityMeasures', 'Verified security measures'],
  ['Compliance', 'cookiePolicy', 'Verified analytics and cookie practices'],
  ['Retention', 'accountRetention', 'Account and workspace retention'],
  ['Retention', 'tokenRetention', 'Connected account token retention (if activated)'],
  ['Retention', 'logRetention', 'Security and usage log retention'],
  ['Retention', 'billingRetention', 'Billing and tax record retention'],
  ['Retention', 'requestRetention', 'Privacy request record retention'],
  ['Retention', 'deletionTimeline', 'Verified live-system deletion timeframe'],
  ['Retention', 'backupTimeline', 'Verified backup removal timeframe'],
  ['Retention', 'acknowledgmentTimeline', 'Privacy request acknowledgment target'],
  ['Retention', 'rightsTimeline', 'Privacy rights response target'],
  ['Terms', 'refundPolicy', 'Refund policy'],
  ['Terms', 'governingLaw', 'Governing law'],
  ['Terms', 'disputeVenue', 'Courts or arbitration venue'],
  ['Terms', 'liabilityCap', 'Legally reviewed liability limit'],
] as const;
export type LegalKey = typeof legalFields[number][1];
export type LegalDetails = Record<LegalKey, string> & { reviewed: boolean };
const shape = Object.fromEntries(legalFields.map(([, key]) => [key, z.string().trim().max(4000).default('')]));
export const legalSchema = z.object({ ...shape, reviewed: z.boolean().default(false) }).superRefine((data, ctx) => {
  for (const key of ['privacyEmail', 'supportEmail']) {
    const value = data[key];
    if (value && !z.string().email().safeParse(value).success) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a valid contact email', path: [key] });
  }
  const domain = data['productionDomain'];
  if (domain && (!z.string().url().safeParse(domain).success || !domain.startsWith('https://'))) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Website URL must start with https://', path: ['productionDomain'] });
});
export function parseLegalDetails(value: unknown): LegalDetails {
  return legalSchema.parse(value ?? {}) as LegalDetails;
}
export const requiredLegalKeys: LegalKey[] = ['companyName', 'registrationNumber', 'registeredAddress', 'privacyEmail', 'supportEmail', 'effectiveDate', 'version', 'hostingProvider', 'processingLocations', 'transferAuthorization', 'accountRetention', 'requestRetention', 'governingLaw', 'disputeVenue'];
export function legalReady(details: LegalDetails) {
  return details.reviewed && requiredLegalKeys.every(key => details[key].trim().length > 0);
}
export const requestKinds = [
  ['delete_account', 'Delete my account and workspace'],
  ['delete_meta_data', 'Delete my connected Meta data'],
  ['access_data', 'Access my personal data'],
  ['correct_data', 'Correct my personal data'],
] as const;
export const privacyRequestSchema = z.object({ kind: z.enum(['delete_account', 'delete_meta_data', 'access_data', 'correct_data']), note: z.string().trim().max(2000).default('') });
export const privacyReviewSchema = z.object({ id: z.string().uuid(), status: z.enum(['requested', 'in_review', 'action_required']), response: z.string().trim().max(4000) });