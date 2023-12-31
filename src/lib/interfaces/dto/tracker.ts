import type { AuthorizationResponse } from "$lib/interfaces/dto/authorization";
import type { BugResponse } from "$lib/interfaces/dto/bug";

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
