import type { PageServerLoad } from "./$types";
import type { AssignedIssuesResponse } from "$lib/interfaces/dto/bug";

export const load = (async ({ fetch, depends }) => {
  const bugsResponse = await fetch("/api/user/bugs");
  const bugsAssignedToUser: AssignedIssuesResponse[] = await bugsResponse.json();

  depends("assigned-bugs");

  return { bugsAssignedToUser };
}) satisfies PageServerLoad;
