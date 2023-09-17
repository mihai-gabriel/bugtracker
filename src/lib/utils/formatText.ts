import type { Priority, Status } from '$lib/interfaces/shared';

export const formatStatusText = (status: Status) => {
  return `${status.charAt(0).toUpperCase()}${status.split('_').join(' ').slice(1).toLowerCase()}`;
};

export const formatPriorityText = (priority: Priority) => {
  return `${priority.charAt(0).toUpperCase()}${priority.slice(1).toLowerCase()}`;
};
