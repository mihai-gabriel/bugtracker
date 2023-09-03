import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/core/providers/github';
import { GITHUB_ID, GITHUB_SECRET } from '$env/static/private';

import { run } from '$lib/server/db';

run().then(() => {
  console.info('[app] Database connection successful');
});

export const authorization: Handle = async ({ event, resolve }) => {
  const allowedGuestPaths = ['/', '/auth'];

  if (!allowedGuestPaths.includes(event.url.pathname)) {
    const session = await event.locals.getSession();

    if (!session) {
      throw redirect(303, '/auth');
    }
  }

  return resolve(event);
};

export const oauthEntryPoint: Handle = SvelteKitAuth({
  providers: [
    GitHub({
      clientId: GITHUB_ID,
      clientSecret: GITHUB_SECRET
    })
  ]
});

export const handle = sequence(oauthEntryPoint, authorization);
