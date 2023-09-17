import { type Actions, error, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { validateBugSchema } from './utils/validateBugSchema';
import type { BugResponseFull } from '$lib/interfaces/dto';

export const load = (async ({ parent, params, depends }) => {
  const { trackers, users } = await parent();
  const tracker = trackers.find(tracker_ => tracker_._id === params.id);

  if (!tracker) {
    throw error(400, '/');
  }

  const bugs: BugResponseFull[] = tracker.bugs.map(bug => {
    const fullAssignee = users.find(user => user._id === bug.assignee);
    const fullReviewer = users.find(user => user._id === bug.reviewer);

    if (!(fullAssignee && fullReviewer)) {
      throw error(400, '/');
    }

    return { ...bug, assignee: fullAssignee, reviewer: fullReviewer };
  });

  depends('bugs');

  return { tracker, bugs };
}) satisfies PageServerLoad;

export const actions: Actions = {
  createBug: async ({ request, locals, fetch, params }) => {
    // Check the validity of the user
    const session = await locals.getSession();
    const userInfo = session?.user;

    // TODO: Implement role-based authorization
    if (!userInfo) {
      throw error(403, { message: "Authorization Error: You don't have access to this resource." });
    }

    // Check if trackerId is non-null
    const trackerId = params['id'];

    if (!trackerId) {
      throw error(403, { message: 'URL Error: Invalid tracker ID' });
    }

    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Validate form values according to a schema
    const { errors } = validateBugSchema(formData);

    if (errors) {
      return fail(400, { data, errors });
    }

    // Attach trackerId to formData
    formData.append('trackerId', trackerId);

    // Create the entry in database
    const response = await fetch('/api/bugs', {
      method: 'POST',
      body: formData
    });

    const responseData = await response.json();

    if (response.status !== 200 && responseData?.message) {
      const errors = { serverError: responseData.message };

      return fail(400, { data, errors });
    }

    return { success: 'bug created' };
  },
  updateBug: async ({ request, locals, fetch, params }) => {
    // Check the validity of the user
    const session = await locals.getSession();
    const userInfo = session?.user;

    // TODO: Implement role-based authorization
    if (!userInfo) {
      throw error(403, { message: "Authorization Error: You don't have access to this resource." });
    }

    // Check if trackerId is non-null
    const trackerId = params['id'];

    if (!trackerId) {
      throw error(403, { message: 'URL Error: Invalid tracker ID' });
    }

    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Validate form values according to a schema
    const { errors } = validateBugSchema(formData);

    if (errors) {
      return fail(400, { data, errors });
    }

    // Attach trackerId to formData
    formData.append('trackerId', trackerId);

    // Create the entry in database
    const response = await fetch('/api/bugs', {
      method: 'PUT',
      body: formData
    });

    const responseData = await response.json();

    if (response.status !== 200 && responseData?.message) {
      const errors = { serverError: responseData.message };

      return fail(400, { data, errors });
    }

    return { success: 'bug updated' };
  },
  deleteBug: async ({ request, locals, fetch, params }) => {
    // Check the validity of the user
    const session = await locals.getSession();
    const userInfo = session?.user;

    // TODO: Implement role-based authorization
    if (!userInfo) {
      throw error(403, { message: "Authorization Error: You don't have access to this resource." });
    }

    // Check if trackerId is non-null
    const trackerId = params['id'];

    if (!trackerId) {
      throw error(403, { message: 'URL Error: Invalid tracker ID' });
    }

    const formData = await request.formData();

    // Attach trackerId to formData
    formData.append('trackerId', trackerId);

    // Create the entry in database
    const response = await fetch('/api/bugs', {
      method: 'DELETE',
      body: formData
    });

    const responseData = await response.json();

    if (response.status !== 200 && responseData?.message) {
      const errors = { serverError: responseData.message };

      return fail(400, { errors });
    }

    return { success: 'bug deleted' };
  }
};
