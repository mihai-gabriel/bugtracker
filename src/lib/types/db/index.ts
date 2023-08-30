import type { Priority, Status } from '$lib/types';
import type { ObjectId } from 'mongodb';

export type Bug = {
	title: string;
	description: string;
	assignee: ObjectId;
	reviewer: ObjectId;
	priority: Priority;
	status: Status;
};

export type Tracker = {
	name: string;
	bugs: Bug[];
};
