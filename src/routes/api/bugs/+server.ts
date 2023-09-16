import type { Bug, Tracker } from '$lib/interfaces/db';
import db, { clientInstance } from '$lib/server/db';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { parseBugFormData } from './utils.server';

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw error(403, { message: "You don't have access to this resource." });
  }

  const formData = await request.formData();
  const parsedBug = parseBugFormData(formData);
  const trackerId = String(formData.get('trackerId'));

  if (!trackerId) {
    throw error(400, { message: 'Bad Request: Malformed bug creation data.' });
  }

  const databaseClient = clientInstance();
  const databaseSession = databaseClient.startSession();

  try {
    await databaseSession.withTransaction(async () => {
      const bugCollection = db.collection<Bug>('bugs');
      const trackerCollection = db.collection<Tracker>('trackers');

      const insertedBug = await bugCollection.insertOne(parsedBug);

      await trackerCollection.updateOne(
        { _id: new ObjectId(trackerId) },
        { $push: { bugs: insertedBug.insertedId } }
      );
    });
  } finally {
    await databaseSession.endSession();
  }

  return json({ success: 'bug created' });
};

export const PUT: RequestHandler = async ({ request, locals }) => {
  const session = await locals.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw error(403, { message: "You don't have access to this resource." });
  }

  const formData = await request.formData();
  const parsedBug = parseBugFormData(formData);
  const bugId = String(formData.get('id'));

  if (!bugId) {
    throw error(400, { message: 'Bad Request: Malformed bug data.' });
  }

  const bugCollection = db.collection<Bug>('bugs');
  const upsertedBug = await bugCollection.updateOne(
    { _id: new ObjectId(bugId) },
    { $set: parsedBug }
  );

  return json({ success: 'bug updated', _id: upsertedBug.upsertedId });
};
