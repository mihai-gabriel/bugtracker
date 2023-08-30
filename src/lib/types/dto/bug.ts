import type { Priority, Status } from '$lib/types';

export type BugResponse = {
	_id: string;
	title: string;
	description: string;
	assignee: string;
	reviewer: string;
	priority: Priority;
	status: Status;
};
