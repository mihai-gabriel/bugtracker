import type { Tracker } from '$lib/types/db';
import type { RequestHandler } from './$types';

import db from '$lib/server/db';
import { json } from '@sveltejs/kit';

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
