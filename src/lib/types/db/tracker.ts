import type { Bug } from './bug';

export type Tracker = {
	name: string;
	bugs: Bug[];
};
