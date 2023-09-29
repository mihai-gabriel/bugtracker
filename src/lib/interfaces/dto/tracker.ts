import type { BugResponse } from "./bug";
import type { AuthorizationResponse } from "$lib/interfaces/dto/authorization";

export type TrackerRequest = {
  name: string;
  author: string;
};

export type TrackerResponse = {
  _id: string;
  name: string;
  author: string;
  bugs: BugResponse[];
  authorization: AuthorizationResponse;
};
