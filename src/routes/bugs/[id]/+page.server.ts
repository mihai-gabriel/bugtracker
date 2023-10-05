import type { PageServerLoad } from "./$types";
import type { BugResponseWithTracker } from "$lib/interfaces/dto/bug";
import type { Actions } from "@sveltejs/kit";
import { error, fail } from "@sveltejs/kit";
import { validateBugSchema } from "../../trackers/[id]/utils/validateBugSchema";
import type { UserResponse } from "$lib/interfaces/dto";

export const load = (async ({ params, fetch, depends, parent }) => {
  const { session } = await parent();
  const response = await fetch(`/api/bugs/${params.id}`);

  if (response.status >= 400 && response.status <= 500) {
    throw error(403, { message: "Forbidden" });
  }

  const bug: BugResponseWithTracker = await response.json();

  const trackerUsersResponse = await fetch(`/api/users?tracker=${bug.tracker._id}`);
  const trackerUsers: UserResponse[] = await trackerUsersResponse.json();

  const authorizationUrl = `/api/authorizations?user=${session?.user.id}&tracker=${bug.tracker._id}`;
  const authorizationResponse = await fetch(authorizationUrl);

  if (authorizationResponse.status >= 400 && authorizationResponse.status <= 500) {
    throw error(400, { message: "Bad Request: Malformed tracker / user data." });
  }

  const { permissions } = await authorizationResponse.json();

  depends("bug");

  return { bug, users: trackerUsers, currentUserPermissions: permissions };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ request, fetch }) => {
    const formData = await request.formData();
    const bugId = String(formData.get("id"));
    const data = Object.fromEntries(formData);

    const { errors } = validateBugSchema(formData);

    if (errors) {
      return fail(400, { data, errors });
    }

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
  }
};
