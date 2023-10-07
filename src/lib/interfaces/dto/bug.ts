import type { Permission, Priority, Status } from "$lib/interfaces/shared";
import type { OptionalAssignedUser } from "./user";
import type { TrackerResponse } from "$lib/interfaces/dto/tracker";

// TODO: Provide explanations / description for each field

// assignee and reviewer should be ObjectId-Like strings
export type BugRequest = {
  id: string;
  title: string;
  description: string;
  assignee: string; // stringified BugUserRequest
  reviewer: string; // stringified BugUserRequest
  priority: Priority;
  status: Status;
  archived: boolean;
};

// assignee and reviewer should be one of these: usernames/email/name.
// I'll decide that later
export type BugResponse = {
  _id: string;
  title: string;
  description: string;
  assignee: OptionalAssignedUser;
  reviewer: OptionalAssignedUser;
  priority: Priority;
  status: Status;
  archived: boolean;
};

export type BugResponseWithTracker = BugResponse & {
  tracker: Partial<TrackerResponse>;
};

export type AssignedIssuesResponse = BugResponseWithTracker & {
  permissions: Permission[];
};
