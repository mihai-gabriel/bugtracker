import type { RequestHandler } from "@sveltejs/kit";
import { error, json } from "@sveltejs/kit";
import type { Authorization } from "$lib/interfaces/db/authorization";
import db from "$lib/server/db";
import { ObjectId } from "mongodb";
import type { Tracker } from "$lib/interfaces/db";
import type { Permission, PermissionAction } from "$lib/interfaces/shared";
import { updateByAction } from "./utils.server";

export const GET: RequestHandler = async ({ locals, url }) => {
  const session = await locals.getSession();
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    throw error(403, { message: "You don't have access to this resource." });
  }

  const userId = url.searchParams.get("user");
  const trackerId = url.searchParams.get("tracker");

  if (!userId || !trackerId) {
    throw error(400, { message: "Bad Request: User or Tracker missing" });
  }

  const bothIdsAreValid = ObjectId.isValid(userId) && ObjectId.isValid(trackerId);

  if (!bothIdsAreValid) {
    throw error(400, { message: "Bad Request: User or Tracker ID are invalid" });
  }

  const authorizations = db.collection<Authorization>("authorizations");
  const result = await authorizations.findOne({
    user: new ObjectId(userId),
    tracker: new ObjectId(trackerId)
  });

  if (!result) {
    return json({ permissions: [] });
  }

  return json({ permissions: result.permissions });
};

export const PUT: RequestHandler = async ({ request, locals }) => {
  const session = await locals.getSession();
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    throw error(403, { message: "You don't have access to this resource." });
  }

  const formData = await request.formData();
  const trackerId = String(formData.get("tracker"));
  const userId = String(formData.get("user"));
  const permission = String(formData.get("permission")) as Permission;
  const permissionAction = String(formData.get("permissionAction")) as PermissionAction;

  const collection = db.collection<Tracker>("trackers");
  const tracker = await collection.findOne({ _id: new ObjectId(trackerId) });

  if (!tracker) {
    throw error(404, { message: "Tracker not found." });
  }

  if (!tracker.author.equals(currentUserId)) {
    throw error(403, { message: "Forbidden: Only the author of the tracker can modify it." });
  }

  const authorizations = db.collection<Authorization>("authorizations");
  const upsertedResult = await authorizations.findOneAndUpdate(
    { tracker: new ObjectId(trackerId), user: new ObjectId(userId) },
    updateByAction(permissionAction, permission),
    { returnDocument: "after", upsert: true }
  );

  return json({ permissions: upsertedResult?.permissions });
};
