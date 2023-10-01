import { ObjectId } from "mongodb";
import { error, json } from "@sveltejs/kit";

import type { Tracker } from "$lib/interfaces/db";
import type { Authorization } from "$lib/interfaces/db/authorization";
import type { RequestHandler } from "./$types";

import db from "$lib/server/db";

export const GET: RequestHandler = async ({ locals }) => {
  const session = await locals.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw error(403, { message: "You don't have access to this resource." });
  }

  // If you're the author or have permission, you're able to fetch the trackers
  const authorizations = db.collection<Authorization>("authorizations");
  const currentUserTrackers = await authorizations
    .aggregate([
      { $match: { user: new ObjectId(userId), permissions: { $in: ["READ"] } } },
      {
        $lookup: {
          from: "trackers",
          localField: "tracker",
          foreignField: "_id",
          as: "tracker"
        }
      },
      { $unwind: "$tracker" },
      { $replaceRoot: { newRoot: "$tracker" } },
      {
        $lookup: {
          from: "bugs",
          localField: "bugs",
          foreignField: "_id",
          as: "bugs"
        }
      }
    ])
    .toArray();

  return json(currentUserTrackers);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.getSession();
  const formData = await request.formData();

  const name = String(formData.get("name"));
  const authorId = session?.user?.id;

  if (!authorId) {
    throw error(403, { message: "You don't have access to this resource." });
  }

  if (!name) {
    throw error(403, { message: "Invalid or malformed tracker name." });
  }

  const tracker: Tracker = {
    name,
    author: new ObjectId(authorId),
    bugs: []
  };
  const collection = db.collection<Tracker>("trackers");
  const result = await collection.insertOne(tracker);

  const authorizations = db.collection<Authorization>("authorizations");
  await authorizations.insertOne({
    user: new ObjectId(authorId),
    tracker: result.insertedId,
    permissions: ["READ", "EDIT", "DELETE"]
  });

  return json({ _id: result.insertedId });
};
