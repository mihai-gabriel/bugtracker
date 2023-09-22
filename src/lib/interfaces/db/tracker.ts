import type { ObjectId } from 'mongodb';

export type Tracker = {
  name: string;
  author: ObjectId;
  bugs: ObjectId[];
  // DRAFT:
  // authorizations: [{ user: ObjectId; permissions: Permission[] }];
};
