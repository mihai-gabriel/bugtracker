import type { UserResponse } from '$lib/interfaces/dto';
import type { TrackerResponse } from '$lib/interfaces/dto/tracker';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ fetch }) => {
  const trackerResponse = await fetch('/api/trackers');
  const trackers: TrackerResponse[] = await trackerResponse.json();

  const usersResponse = await fetch('/api/users');
  const users: UserResponse[] = await usersResponse.json();

  return { trackers, users };
}) satisfies LayoutServerLoad;
