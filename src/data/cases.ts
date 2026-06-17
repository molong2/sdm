import type { Case } from '../types';
import raw from './cases.json?raw';
export const cases: Case[] = JSON.parse(raw);
