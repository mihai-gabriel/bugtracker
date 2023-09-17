import { Priority, Status } from '$lib/interfaces/shared';
import type { BugResponseFull } from '$lib/interfaces/dto';

export const sortPredicateStatus = (a: Status, b: Status) => {
  return Object.values(Status).indexOf(a) - Object.values(Status).indexOf(b);
};

export const sortPredicateBugPriority = (a: BugResponseFull, b: BugResponseFull) => {
  return Object.values(Priority).indexOf(b.priority) - Object.values(Priority).indexOf(a.priority);
};
