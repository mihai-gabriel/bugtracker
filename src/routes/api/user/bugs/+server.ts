import type { Bug } from '$lib/interfaces/db';
import db from '$lib/server/db';
import { error, json } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import type { RequestHandler } from './$types';

/**
 * Retrieves from db all the bugs that have been assigned to the current authenticated user.
 *
 * @returns list of bugs where the user is 'asignee' or 'reviewer'. Later on, (TODO:) bugs will be separated.
 */
export const GET: RequestHandler = async ({ locals }) => {
  const session = await locals.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw error(403, { message: "You don't have access to this resource." });
  }

  const collection = db.collection<Bug>('bugs');
  const bugsAssignedToUser = await collection
    .find({
      $or: [{ assignee: new ObjectId(userId) }, { reviewer: new ObjectId(userId) }]
    })
    .toArray();

  return json(bugsAssignedToUser);
};
