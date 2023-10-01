import { error, fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { validateBugSchema } from "./utils/validateBugSchema";
import type { BugResponseFull, UserResponse } from "$lib/interfaces/dto";

export const load = (async ({ parent, params, depends, fetch }) => {
  const { trackers, session } = await parent();
  const tracker = trackers.find(tracker_ => tracker_._id === params.id);

  if (!tracker) {
    throw error(403, { message: "Forbidden" });
  }

  const trackerUsersResponse = await fetch(`/api/users?tracker=${tracker._id}`);
  const trackerUsers: UserResponse[] = await trackerUsersResponse.json();

  if (!trackerUsers) {
    throw error(403, { message: "Malformed Data: Tracker has no users" });
  }

  const bugs: BugResponseFull[] = tracker.bugs.map(bug => {
    const fullAssignee = trackerUsers.find(user => user._id === bug.assignee);
    const fullReviewer = trackerUsers.find(user => user._id === bug.reviewer);

    if (!(fullAssignee && fullReviewer)) {
      throw error(500, {
        message: "We couldn't retrieve the information for the users assigned to this tracker"
      });
    }

    return { ...bug, assignee: fullAssignee, reviewer: fullReviewer };
  });

  const authorizationUrl = `/api/authorizations?user=${session?.user.id}&tracker=${tracker._id}`;
  const authorizationResponse = await fetch(authorizationUrl);

  if (authorizationResponse.status >= 400 && authorizationResponse.status <= 500) {
    throw error(400, { message: "Bad Request: Malformed tracker / user data." });
  }

  const { permissions } = await authorizationResponse.json();

  depends("bugs");

  return { tracker, bugs, trackerUsers, currentUserPermissions: permissions };
}) satisfies PageServerLoad;

export const actions: Actions = {
  createBug: async ({ request, fetch, params }) => {
    const trackerId = params["id"];

    if (!trackerId) {
      throw error(403, { message: "URL Error: Invalid tracker ID" });
    }

    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const { errors } = validateBugSchema(formData);

    if (errors) {
      return fail(400, { data, errors });
    }

    formData.append("trackerId", trackerId);

    const response = await fetch("/api/bugs", {
      method: "POST",
      body: formData
    });

    const responseData = await response.json();

    if (response.status !== 200 && responseData?.message) {
      const errors = { serverError: responseData.message };

      return fail(400, { data, errors });
    }

    return { success: "bug created" };
  },
  updateBug: async ({ request, fetch, params }) => {
    const trackerId = params["id"];

    if (!trackerId) {
      throw error(403, { message: "URL Error: Invalid tracker ID" });
    }

    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const { errors } = validateBugSchema(formData);

    if (errors) {
      return fail(400, { data, errors });
    }

    formData.append("trackerId", trackerId);

    const response = await fetch("/api/bugs", {
      method: "PUT",
      body: formData
    });

    const responseData = await response.json();

    if (response.status !== 200 && responseData?.message) {
      const errors = { serverError: responseData.message };

      return fail(400, { data, errors });
    }

    return { success: "bug updated" };
  },
  deleteBug: async ({ request, fetch, params }) => {
    const trackerId = params["id"];

    if (!trackerId) {
      throw error(403, { message: "URL Error: Invalid tracker ID" });
    }

    const formData = await request.formData();
    formData.append("trackerId", trackerId);

    const response = await fetch("/api/bugs", {
      method: "DELETE",
      body: formData
    });

    const responseData = await response.json();

    if (response.status !== 200 && responseData?.message) {
      const errors = { serverError: responseData.message };

      return fail(400, { errors });
    }

    return { success: "bug deleted" };
  }
};
