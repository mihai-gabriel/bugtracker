import type { ObjectId } from 'mongodb';

export type Tracker = {
  name: string;
  author: ObjectId;
  bugs: ObjectId[];
};
