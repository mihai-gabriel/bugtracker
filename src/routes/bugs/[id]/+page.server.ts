import type { PageServerLoad } from "./$types";
import type { BugResponseFullWithTracker } from "$lib/interfaces/dto/bug";

export const load = (async ({ params, fetch, depends }) => {
  const response = await fetch(`/api/bugs/${params.id}`);
  const bug: BugResponseFullWithTracker = await response.json();

  depends("bug");

  return { bug };
}) satisfies PageServerLoad;
