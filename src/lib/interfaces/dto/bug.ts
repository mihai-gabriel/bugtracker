import type { Priority, Status } from '$lib/interfaces/shared';
import type { UserResponse } from './user';

// TODO: Provide explanations / description for each field

// asignee and reviewer should be ObjectId-Like strings
export type BugRequest = {
  id: string;
  title: string;
  description: string;
  assignee: string;
  reviewer: string;
  priority: Priority;
  status: Status;
};

// asignee and reviewer should be one of these: usernames/email/name.
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
