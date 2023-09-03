import type { TrackerResponse } from '$lib/types/dto/tracker';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ fetch }) => {
  const response = await fetch('/api/trackers');
  const trackers: TrackerResponse[] = await response.json();

  return { trackers };
}) satisfies LayoutServerLoad;
