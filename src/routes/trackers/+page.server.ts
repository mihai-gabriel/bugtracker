import { error, fail, type Actions } from '@sveltejs/kit';
import { validate } from './utils';

export const actions: Actions = {
  createTracker: async ({ request, locals, fetch }) => {
    // Check the validity of the user
    const session = await locals.getSession();
    const userInfo = session?.user;

    // TODO: Implement role-based authorization
    if (!userInfo) {
      return error(403, { message: "You don't have access to this resource." });
    }

    const formData = await request.formData();

    // TODO: (Optional) Provide a type for errors
    // Validate form values according to a schema
    const { data, errors } = validate(formData);

    if (errors) {
      return fail(400, { data, errors });
    }

    // Create the entry in database
    const response = await fetch('/api/trackers', {
      method: 'POST',
      body: formData
    });

    const responseData = await response.json();

    if (response.status !== 200 && responseData?.message) {
      const errors = { serverError: responseData.message };

      return fail(400, { data, errors });
    }

    return { success: 'tracker created', _id: responseData._id };
  }
};
