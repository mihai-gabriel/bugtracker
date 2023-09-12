import type { Bug } from '$lib/interfaces/db';
import type { Priority, Status } from '$lib/interfaces/shared';
import { ObjectId } from 'mongodb';

export const parseBugFormData = (formData: FormData): Bug => {
  const title = String(formData.get('title'));
  const description = String(formData.get('description'));
  const assignee = new ObjectId(String(formData.get('assignee')));
  const reviewer = new ObjectId(String(formData.get('reviewer')));
  const priority = String(formData.get('priority')) as Priority;
  const status = String(formData.get('status')) as Status;

  return {
    title,
    description,
    assignee,
    reviewer,
    priority,
    status
  };
};
