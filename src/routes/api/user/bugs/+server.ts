import db from "$lib/server/db";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { ObjectId } from "mongodb";
import type { Authorization } from "$lib/interfaces/db/authorization";

/**
 * Retrieves from db all the bugs that have been assigned to the current authenticated user.
 */
export const GET: RequestHandler = async ({ locals }) => {
  const session = await locals.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw error(403, { message: "You don't have access to this resource." });
  }

  const authorizations = db.collection<Authorization>("authorizations");
  const bugsAssignedToUser = await authorizations
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
      {
        $replaceRoot: { newRoot: { $mergeObjects: ["$tracker", { permissions: "$permissions" }] } }
      },
      {
        $lookup: {
          from: "bugs",
          localField: "bugs",
          foreignField: "_id",
          as: "bugs"
        }
      },
      { $unwind: "$bugs" },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                tracker: { _id: "$_id", name: "$name" },
                permissions: "$permissions"
              },
              "$bugs"
            ]
          }
        }
      },
      {
        $match: {
          $or: [{ "assignee._id": new ObjectId(userId) }, { "reviewer._id": new ObjectId(userId) }],
          archived: false
        }
      }
    ])
    .toArray();

  return json(bugsAssignedToUser);
};
