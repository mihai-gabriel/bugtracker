import type { Bug } from './bug';

export type Tracker = {
  name: string;
  author: string;
  bugs: Bug[];
};
