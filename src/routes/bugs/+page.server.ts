import type { PageServerLoad } from "./$types";
import type { BugResponseFullWithTracker } from "$lib/interfaces/dto/bug";

export const load = (async ({ fetch, depends }) => {
  const bugsResponse = await fetch("/api/user/bugs");
  const bugsAssignedToUser: BugResponseFullWithTracker[] = await bugsResponse.json();

  depends("assigned-bugs");

  return { bugsAssignedToUser };
}) satisfies PageServerLoad;
