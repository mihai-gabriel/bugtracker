import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import db from "$lib/server/db";
import type { User } from "$lib/interfaces/db";
import { ObjectId } from "mongodb";

export const GET: RequestHandler = async ({ url }) => {
  const collection = db.collection<User>("users");

  const trackerId = url.searchParams.get("tracker");

  if (trackerId) {
    if (!ObjectId.isValid(trackerId)) {
      throw error(400, { message: "Bad Request: Invalid Tracker ID" });
    }

    const trackerUsers = await collection
      .aggregate([
        {
          $lookup: {
            from: "authorizations",
            localField: "_id",
            foreignField: "user",
            as: "authorization"
          }
        },
        { $unwind: "$authorization" },
        {
          $match: {
            "authorization.tracker": new ObjectId(trackerId),
            "authorization.permissions": { $in: ["READ"] }
          }
        },
        { $unset: "authorization" }
      ])
      .toArray();

    return json(trackerUsers);
  }

  const users = await collection.find({}).toArray();

  return json(users);
};
