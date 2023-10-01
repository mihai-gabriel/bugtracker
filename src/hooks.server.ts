import { type Handle, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

import { SvelteKitAuth } from "@auth/sveltekit";
import GitHub from "@auth/core/providers/github";
import { GITHUB_ID, GITHUB_SECRET } from "$env/static/private";

import db, { run } from "$lib/server/db";
import type { User } from "$lib/interfaces/db";

run().then(() => {
  console.info("[app] Database connection successful");
});

export const authorization: Handle = async ({ event, resolve }) => {
  const allowedGuestPaths = ["/", "/auth"];

  if (!allowedGuestPaths.includes(event.url.pathname)) {
    const session = await event.locals.getSession();

    if (!session) {
      throw redirect(303, "/auth");
    }
  }

  return resolve(event);
};

export const oauthEntryPoint: Handle = SvelteKitAuth({
  trustHost: true,
  providers: [
    GitHub({
      clientId: GITHUB_ID,
      clientSecret: GITHUB_SECRET
    })
  ],
  callbacks: {
    session: async ({ session }) => {
      if (session.user?.email) {
        const users = db.collection<User>("users");
        const existingUser = await users.findOne({ email: session.user.email });

        if (existingUser) {
          session.user.id = existingUser._id.toString();
          return session;
        }

        const insertedUser = await users.insertOne({
          email: session.user.email,
          name: session.user.name,
          image: session.user.image
        });

        session.user.id = insertedUser.insertedId.toString();
      }

      return session;
    }
  }
});

export const handle = sequence(oauthEntryPoint, authorization);
