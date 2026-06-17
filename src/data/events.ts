import type { DayEvent } from '../types';
import raw from './events.json?raw';

const d = JSON.parse(raw) as {
  DAY_EVENTS: Record<number, DayEvent>;
  DAY_ARRIVAL_EVENTS: Record<number, DayEvent>;
  DAY_OUTING_EVENTS: Record<number, DayEvent>;
};

export const DAY_EVENTS         = d.DAY_EVENTS;
export const DAY_ARRIVAL_EVENTS = d.DAY_ARRIVAL_EVENTS;
export const DAY_OUTING_EVENTS  = d.DAY_OUTING_EVENTS;
