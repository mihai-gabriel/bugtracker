import type { RequestHandler } from "@sveltejs/kit";
import { error, json } from "@sveltejs/kit";
import db from "$lib/server/db";
import type { Bug } from "$lib/interfaces/db";
import { ObjectId } from "mongodb";
import type { Authorization } from "$lib/interfaces/db/authorization";

export const GET: RequestHandler = async ({ locals, params }) => {
  const session = await locals.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw error(403, { message: "You don't have access to this resource." });
  }

  const bugId = params["id"];

  if (!bugId || !ObjectId.isValid(bugId)) {
    throw error(400, { message: "Bad Request: Invalid Bug ID" });
  }

  const bugCollection = db.collection<Bug>("bugs");
  const bug = await bugCollection
    .aggregate([
      { $match: { _id: new ObjectId(bugId) } },
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
      { $unwind: "$assignee" },
      {
        $lookup: {
          from: "trackers",
          localField: "_id",
          foreignField: "bugs",
          as: "tracker"
        }
      },
      { $unwind: "$tracker" },
      { $project: { tracker: { bugs: false, author: false } } }
    ])
    .next();

  if (!bug) {
    throw error(404, { message: "Not found" });
  }

  const authorizations = db.collection<Authorization>("authorizations");
  const authorized = await authorizations.findOne({
    user: new ObjectId(userId),
    tracker: new ObjectId(bug.tracker._id)
  });

  if (!authorized) {
    throw error(403, { message: "User not authorized to view specified Tracker" });
  }

  return json(bug);
};
