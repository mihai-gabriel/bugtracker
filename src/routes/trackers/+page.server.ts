import type { TrackerResponse } from '$lib/types/dto';
import { error, fail, type Actions } from '@sveltejs/kit';
import { validate } from './utils';

export const actions: Actions = {
	createTracker: async ({ request, locals, fetch }) => {
		const session = await locals.getSession();
		const userInfo = session?.user;

		// TODO: Implement role-based authorization
		if (!userInfo) {
			return error(403, { message: "You don't have access to this resource." });
		}

		// TODO: (Optional) Provide a type for errors
		const formData = await request.formData();
		const { data, errors } = validate(formData);

		if (errors) {
			console.log('reached');
			return fail(400, { data, errors });
		}

		const response = await fetch('/api/trackers', {
			method: 'POST',
			body: formData
		});

		// TODO: Obviously, refactor this condition
		if (response.status >= 400) {
			const errors = { serverError: 'Your request is invalid or malformed.' };

			return fail(400, { data, errors });
		}

		const tracker: TrackerResponse = await response.json();

		return { success: 'tracker created', tracker };
	}
};
