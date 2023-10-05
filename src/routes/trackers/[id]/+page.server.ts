import { error, fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { validateBugSchema } from "./utils/validateBugSchema";
import type { UserResponse } from "$lib/interfaces/dto";
import type { BugResponseWithTracker } from "$lib/interfaces/dto/bug";

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

  const authorizationUrl = `/api/authorizations?user=${session?.user.id}&tracker=${tracker._id}`;
  const authorizationResponse = await fetch(authorizationUrl);

  if (authorizationResponse.status >= 400 && authorizationResponse.status <= 500) {
    throw error(400, { message: "Bad Request: Malformed tracker / user data." });
  }

  const { permissions } = await authorizationResponse.json();

  depends("bugs");

  return { tracker, trackerUsers, currentUserPermissions: permissions };
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
    const assigneeId = String(formData.get("assignee"));
    const reviewerId = String(formData.get("reviewer"));

    const userResponse = await fetch("/api/users");
    const users: UserResponse[] = await userResponse.json();

    const assignee = users.find(user => user._id === assigneeId) ?? "unassigned";
    const reviewer = users.find(user => user._id === reviewerId) ?? "unassigned";

    formData.set("assignee", JSON.stringify(assignee));
    formData.set("reviewer", JSON.stringify(reviewer));

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
    const bugId = String(formData.get("id"));
    const data = Object.fromEntries(formData);

    const { errors } = validateBugSchema(formData);

    if (errors) {
      return fail(400, { data, errors });
    }

    formData.append("trackerId", trackerId);

    // These two can either be a user._id or "unassigned".
    const assigneeField = String(formData.get("assignee"));
    const reviewerField = String(formData.get("reviewer"));

    const userResponse = await fetch("/api/users");
    const users: UserResponse[] = await userResponse.json();

    const bugResponse = await fetch(`/api/bugs/${bugId}`);
    const bug: BugResponseWithTracker = await bugResponse.json();

    /* Explanation: If the user is `unassigned` we send it further to the API
     * Otherwise, we search for the user in the database.
     * If the user is not found in the database, we retrieve the data from the bug entry.
     */
    if (assigneeField === "unassigned") {
      formData.set("assignee", JSON.stringify("unassigned"));
    } else {
      const assignee = users.find(user => user._id === assigneeField) ?? bug.assignee;

      formData.set("assignee", JSON.stringify(assignee));
    }

    if (reviewerField === "unassigned") {
      formData.set("reviewer", JSON.stringify("unassigned"));
    } else {
      const reviewer = users.find(user => user._id === reviewerField) ?? bug.reviewer;

      formData.set("reviewer", JSON.stringify(reviewer));
    }

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
