import type { BugResponse } from "./bug";

export type TrackerRequest = {
  name: string;
  author: string;
};

export type TrackerResponse = {
  _id: string;
  name: string;
  author: string;
  bugs: BugResponse[];
};
