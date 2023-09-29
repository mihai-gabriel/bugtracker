import { error, fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { validateBugSchema } from "./utils/validateBugSchema";
import type { BugResponseFull, UserResponse } from "$lib/interfaces/dto";
import type { UserWithPermissionsResponse } from "$lib/interfaces/dto/user";

export const load = (async ({ parent, params, depends, fetch }) => {
  const { trackers } = await parent();
  const tracker = trackers.find(tracker_ => tracker_._id === params.id);

  if (!tracker) {
    throw error(403, { message: "Forbidden" });
  }

  const trackerUsersResponse = await fetch(`/api/users?tracker=${tracker._id}`);
  const trackerUsers: UserResponse[] = await trackerUsersResponse.json();

  if (!trackerUsers) {
    throw error(403, { message: "Malformed Data: Tracker has no users" });
  }

  // Concatenate the users info with their permissions for the current tracker.
  const usersWithPermissions: UserWithPermissionsResponse[] = await Promise.all(
    trackerUsers.map(async user => {
      const url = `/api/authorizations?user=${user._id}&tracker=${tracker._id}`;
      const authorizationResponse = await fetch(url);
      const { permissions } = await authorizationResponse.json();

      const userWithPermissions: UserWithPermissionsResponse = {
        ...user,
        permissions
      };

      return userWithPermissions;
    })
  );

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

  depends("bugs");

  return { tracker, bugs, trackerUsers: usersWithPermissions };
}) satisfies PageServerLoad;

export const actions: Actions = {
  /* Permission Required: EDIT */
  createBug: async ({ request, locals, fetch, params }) => {
    // Check the validity of the user
    const session = await locals.getSession();
    const userInfo = session?.user;

    // TODO: Implement role-based authorization
    if (!userInfo) {
      throw error(403, { message: "Authorization Error: You don't have access to this resource." });
    }

    // Check if trackerId is non-null
    const trackerId = params["id"];

    if (!trackerId) {
      throw error(403, { message: "URL Error: Invalid tracker ID" });
    }

    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Validate form values according to a schema
    const { errors } = validateBugSchema(formData);

    if (errors) {
      return fail(400, { data, errors });
    }

    // Attach trackerId to formData
    formData.append("trackerId", trackerId);

    // Create the entry in database
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
  /* Permission Required: EDIT */
  updateBug: async ({ request, locals, fetch, params }) => {
    // Check the validity of the user
    const session = await locals.getSession();
    const userInfo = session?.user;

    // TODO: Implement role-based authorization
    if (!userInfo) {
      throw error(403, { message: "Authorization Error: You don't have access to this resource." });
    }

    // Check if trackerId is non-null
    const trackerId = params["id"];

    if (!trackerId) {
      throw error(403, { message: "URL Error: Invalid tracker ID" });
    }

    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Validate form values according to a schema
    const { errors } = validateBugSchema(formData);

    if (errors) {
      return fail(400, { data, errors });
    }

    // Attach trackerId to formData
    formData.append("trackerId", trackerId);

    // Create the entry in database
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
  /* Permission Required: DELETE */
  deleteBug: async ({ request, locals, fetch, params }) => {
    // Check the validity of the user
    const session = await locals.getSession();
    const userInfo = session?.user;

    // TODO: Implement role-based authorization
    if (!userInfo) {
      throw error(403, { message: "Authorization Error: You don't have access to this resource." });
    }

    // Check if trackerId is non-null
    const trackerId = params["id"];

    if (!trackerId) {
      throw error(403, { message: "URL Error: Invalid tracker ID" });
    }

    const formData = await request.formData();

    // Attach trackerId to formData
    formData.append("trackerId", trackerId);

    // Create the entry in database
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
