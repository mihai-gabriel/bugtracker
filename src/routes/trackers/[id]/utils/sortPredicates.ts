import { Priority, Status } from "$lib/interfaces/shared";
import type { BugResponse } from "$lib/interfaces/dto";

export const sortPredicateStatus = (a: Status, b: Status) => {
  return Object.values(Status).indexOf(a) - Object.values(Status).indexOf(b);
};

export const sortPredicateBugPriority = (a: BugResponse, b: BugResponse) => {
  return Object.values(Priority).indexOf(b.priority) - Object.values(Priority).indexOf(a.priority);
};
