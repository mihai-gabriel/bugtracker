import type { BugResponse } from '$lib/interfaces/dto';
import type { PageServerLoad } from './$types';

export const load = (async ({ fetch }) => {
  const bugsResponse = await fetch('/api/user/bugs');
  const bugsAssignedToUser: BugResponse[] = await bugsResponse.json();

  return { bugsAssignedToUser };
}) satisfies PageServerLoad;
