import type { Tracker } from "$lib/interfaces/db";
import db from "$lib/server/db";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { ObjectId } from "mongodb";

/**
 * Check if a user is the author of a specified tracker.
 * @returns boolean indicating whether the provided user is the author of the provided tracker
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw error(403, { message: "You don't have access to this resource." });
  }

  const formData = await request.formData();
  const authorId = String(formData.get("author"));
  const trackerId = String(formData.get("tracker"));

  const collection = db.collection<Tracker>("trackers");
  const tracker = await collection.findOne({ _id: new ObjectId(trackerId) });

  if (!tracker) {
    throw error(404, { message: "Tracker not found." });
  }

  return json({ isUserTheAuthor: tracker.author.equals(authorId) });
};
