import type { Priority, Status } from "$lib/interfaces/shared";
import type { UserResponse } from "./user";
import type { TrackerResponse } from "$lib/interfaces/dto/tracker";

// TODO: Provide explanations / description for each field

// assignee and reviewer should be ObjectId-Like strings
export type BugRequest = {
  id: string;
  title: string;
  description: string;
  assignee: string;
  reviewer: string;
  priority: Priority;
  status: Status;
};

// assignee and reviewer should be one of these: usernames/email/name.
// I'll decide that later
export type BugResponse = {
  _id: string;
  title: string;
  description: string;
  assignee: string;
  reviewer: string;
  priority: Priority;
  status: Status;
};

export type BugResponseFull = {
  _id: string;
  title: string;
  description: string;
  assignee: UserResponse;
  reviewer: UserResponse;
  priority: Priority;
  status: Status;
};

export type BugResponseFullWithTracker = BugResponseFull & {
  tracker: Partial<TrackerResponse>;
};
