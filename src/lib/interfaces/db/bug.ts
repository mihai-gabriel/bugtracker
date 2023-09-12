import type { ObjectId } from 'mongodb';
import type { Priority, Status } from '$lib/interfaces/shared';

export type Bug = {
  title: string;
  description: string;
  assignee: ObjectId;
  reviewer: ObjectId;
  priority: Priority;
  status: Status;
};
