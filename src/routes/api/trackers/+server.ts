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

export const POST: RequestHandler = async ({ request, locals }) => {
	// const collection = db.collection<Tracker>('trackers');
	const session = await locals.getSession();

	console.log('form data:', JSON.stringify(request.formData));
	console.log('user info:', session?.user);

	return json({ _id: '<NOT_IMPLEMENTED>' });
};
