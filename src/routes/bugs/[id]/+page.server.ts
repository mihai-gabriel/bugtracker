import type { PageServerLoad } from "./$types";
import type { BugResponseFullWithTracker } from "$lib/interfaces/dto/bug";
import type { Actions } from "@sveltejs/kit";
import { error, fail } from "@sveltejs/kit";
import { validateBugSchema } from "../../trackers/[id]/utils/validateBugSchema";
import type { UserResponse } from "$lib/interfaces/dto";
import type { UserWithPermissionsResponse } from "$lib/interfaces/dto/user";

export const load = (async ({ params, fetch, depends }) => {
  const response = await fetch(`/api/bugs/${params.id}`);

  if (response.status >= 400 && response.status <= 500) {
    throw error(403, { message: "Forbidden" });
  }

  const bug: BugResponseFullWithTracker = await response.json();

  depends("bug");

  const trackerUsersResponse = await fetch(`/api/users?tracker=${bug.tracker._id}`);
  const trackerUsers: UserResponse[] = await trackerUsersResponse.json();

  // Concatenate the users info with their permissions for the current tracker.
  const usersWithPermissions: UserWithPermissionsResponse[] = await Promise.all(
    trackerUsers.map(async user => {
      const url = `/api/authorizations?user=${user._id}&tracker=${bug.tracker._id}`;
      const authorizationResponse = await fetch(url);
      const { permissions } = await authorizationResponse.json();

      const userWithPermissions: UserWithPermissionsResponse = {
        ...user,
        permissions
      };

      return userWithPermissions;
    })
  );

  return { bug, users: usersWithPermissions };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ request, locals, fetch }) => {
    // Check the validity of the user
    const session = await locals.getSession();
    const userInfo = session?.user;

    // TODO: Implement role-based authorization
    if (!userInfo) {
      throw error(403, { message: "Authorization Error: You don't have access to this resource." });
    }

    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Validate form values according to a schema
    const { errors } = validateBugSchema(formData);

    if (errors) {
      return fail(400, { data, errors });
    }

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
  }
};
