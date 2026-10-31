import { describe, it, expect } from 'vitest';
import { plans, allowedAgentAction, canReply } from '@/lib/rules';
import type { Conversation } from '@/lib/types';
describe('Kaliza safeguards', () => {
 it('never initiates contact', () => { expect(canReply({ messages: [{from: 'owner'}] } as Conversation)).toBe(false); expect(canReply({ messages: [{from:'customer'}] } as Conversation)).toBe(true); });
 it('blocks settings permissions and billing agent actions', () => { for(const action of ['settings','permissions','billing','disconnect']) expect(allowedAgentAction(action)).toBe(false); expect(allowedAgentAction('post')).toBe(true); });
 it('keeps the four discussed monthly prices', () => { expect(plans.map(p => p.price)).toEqual([79,149,299,599]); });
});
