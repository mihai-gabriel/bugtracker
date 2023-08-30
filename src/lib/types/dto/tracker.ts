import type { BugResponse } from './bug';

export type TrackerResponse = {
	_id: string;
	name: string;
	bugs: BugResponse[];
};
