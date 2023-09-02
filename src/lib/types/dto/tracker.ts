import type { BugResponse } from './bug';

export type TrackerRequest = {
	name: string;
};

export type TrackerResponse = {
	_id: string;
	name: string;
	bugs: BugResponse[];
};
