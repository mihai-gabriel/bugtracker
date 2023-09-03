import type { Tracker } from '$lib/types/db';
import type { RequestHandler } from './$types';

import db from '$lib/server/db';
import { error, json } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  const collection = db.collection<Tracker>('trackers');
  const trackers = await collection
    .aggregate([
      {
        $lookup: {
          from: 'bugs',
          localField: 'bugs',
          foreignField: '_id',
          as: 'bugs'
        }
      }
    ])
    .toArray();

  return json(trackers);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.getSession();
  const formData = await request.formData();

  const name = String(formData.get('name'));
  const author = session?.user?.email;

  if (!author) {
    throw error(403, { message: "You don't have access to this resource." });
  }

  if (!name) {
    throw error(403, { message: 'Invalid or malformed tracker name.' });
  }

  const tracker: Tracker = { name, author, bugs: [] };
  const collection = db.collection<Tracker>('trackers');
  const result = await collection.insertOne(tracker);

  return json({ _id: result.insertedId });
};
