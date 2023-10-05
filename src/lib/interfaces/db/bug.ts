import type { Priority, Status } from "$lib/interfaces/shared";
import type { OptionalAssignedUserDb } from "$lib/interfaces/db/user";

export type Bug = {
  title: string;
  description: string;
  assignee: OptionalAssignedUserDb;
  reviewer: OptionalAssignedUserDb;
  priority: Priority;
  status: Status;
  archived: boolean;
};
