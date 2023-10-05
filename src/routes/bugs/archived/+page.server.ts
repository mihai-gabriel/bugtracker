import type { PageServerLoad } from "./$types";
import type { BugResponseWithTracker } from "$lib/interfaces/dto/bug";

export const load = (async ({ fetch, depends }) => {
  const bugsResponse = await fetch("/api/user/bugs/archived");
  const archivedBugsAssignedToUser: BugResponseWithTracker[] = await bugsResponse.json();

  depends("assigned-bugs");

  return { archivedBugsAssignedToUser };
}) satisfies PageServerLoad;
