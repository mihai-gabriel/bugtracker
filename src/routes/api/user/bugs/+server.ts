import type { Bug } from "$lib/interfaces/db";
import db from "$lib/server/db";
import { error, json } from "@sveltejs/kit";
import { ObjectId } from "mongodb";
import type { RequestHandler } from "./$types";

/**
 * Retrieves from db all the bugs that have been assigned to the current authenticated user.
 *
 * @returns list of bugs where the user is 'assignee' or 'reviewer'.
 */
export const GET: RequestHandler = async ({ locals }) => {
  const session = await locals.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw error(403, { message: "You don't have access to this resource." });
  }

  const collection = db.collection<Bug>("bugs");
  const bugsAssignedToUser = await collection
    .aggregate([
      {
        $lookup: {
          from: "trackers",
          localField: "_id",
          foreignField: "bugs",
          as: "tracker"
        }
      },
      { $unwind: "$tracker" },
      { $project: { tracker: { bugs: false, author: false } } },
      {
        $lookup: {
          from: "authorizations",
          localField: "tracker._id",
          foreignField: "tracker",
          as: "authorization"
        }
      },
      {
        $match: {
          $or: [{ assignee: new ObjectId(userId) }, { reviewer: new ObjectId(userId) }],
          "authorization.user": new ObjectId(userId)
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "reviewer",
          foreignField: "_id",
          as: "reviewer"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "assignee",
          foreignField: "_id",
          as: "assignee"
        }
      },
      { $unwind: "$reviewer" },
      { $unwind: "$assignee" }
    ])
    .toArray();

  return json(bugsAssignedToUser);
};
