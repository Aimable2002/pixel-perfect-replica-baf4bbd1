import { describe, it, expect } from 'vitest';
import { parseLegalDetails, legalSchema, legalReady, legalFields, requiredLegalKeys, privacyRequestSchema, privacyReviewSchema } from '@/lib/legal';
describe('Legal configuration rules', () => {
  it('keeps every document placeholder editable without invented values', () => {
    const values = parseLegalDetails({});
    for (const [, key] of legalFields) expect(values[key]).toBe('');
    expect(legalFields.length).toBe(36);
  });
  it('does not remove draft status without both required details and legal review', () => {
    const details = parseLegalDetails({});
    expect(legalReady(details)).toBe(false);
    for (const key of requiredLegalKeys) details[key] = 'Verified detail';
    expect(legalReady(details)).toBe(false);
    details.reviewed = true;
    expect(legalReady(details)).toBe(true);
    details.companyName = '';
    expect(legalReady(details)).toBe(false);
  });
  it('rejects unsafe contact links', () => {
    expect(legalSchema.safeParse({ privacyEmail: 'not-an-email' }).success).toBe(false);
    expect(legalSchema.safeParse({ productionDomain: 'javascript:alert(1)' }).success).toBe(false);
    expect(legalSchema.safeParse({ productionDomain: 'https://kaliza.example' }).success).toBe(true);
  });
  it('limits privacy request notes to 2000 characters', () => {
    expect(privacyRequestSchema.safeParse({ kind: 'delete_account', note: 'a'.repeat(2000) }).success).toBe(true);
    expect(privacyRequestSchema.safeParse({ kind: 'delete_account', note: 'a'.repeat(2001) }).success).toBe(false);
  });
  it('cannot record a deletion as completed through manual review', () => {
    const input = { id: '5f647f75-b030-4816-95df-c20137a54e79', response: '' };
    expect(privacyReviewSchema.safeParse({ ...input, status: 'in_review' }).success).toBe(true);
    expect(privacyReviewSchema.safeParse({ ...input, status: 'completed' }).success).toBe(false);
  });
});