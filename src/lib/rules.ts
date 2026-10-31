import type { Conversation } from './types';
export const plans = [ { name: 'Starter', price: 79, brands: 1, voice: 100 }, { name: 'Pro', price: 149, brands: 2, voice: 300 }, { name: 'Scale', price: 299, brands: 5, voice: 1000 }, { name: 'Agency', price: 599, brands: 10, voice: 2000 } ];
export function canReply(conversation: Conversation | undefined) { return !!conversation?.messages.some(m => m.from === 'customer'); }
export function allowedAgentAction(type: string) { return ['post', 'budget', 'reply'].includes(type); }
