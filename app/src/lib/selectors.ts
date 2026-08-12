import { FamilyEvent, FamilyTask } from '../types/models';

export function eventsOnDate(events: FamilyEvent[], iso: string): FamilyEvent[] {
  return events.filter((e) => iso >= e.start_date && iso <= e.end_date);
}

export function tasksOnDate(tasks: FamilyTask[], iso: string): FamilyTask[] {
  return tasks.filter((t) => t.due_date === iso);
}
