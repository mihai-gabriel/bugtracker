import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/server/db';
import type { User } from '$lib/interfaces/db';

export const GET: RequestHandler = async () => {
  const collection = db.collection<User>('users');
  const users = await collection.find({}).toArray();

  return json(users);
};
