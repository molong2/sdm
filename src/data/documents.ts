import type { Document } from '../types';
import raw from './documents.json?raw';
export const documents: Document[] = JSON.parse(raw);
