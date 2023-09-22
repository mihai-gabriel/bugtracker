import type { PageServerLoad } from "./$types";
import type { BugResponseFull } from "$lib/interfaces/dto";

export const load = (async ({ params, fetch }) => {
  const response = await fetch(`/api/bugs/${params.id}`);
  const bug: BugResponseFull = await response.json();

  return { bug };
}) satisfies PageServerLoad;
