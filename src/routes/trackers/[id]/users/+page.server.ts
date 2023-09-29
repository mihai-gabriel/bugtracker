import type { PageServerLoad } from "./$types";
import { type Actions, error } from "@sveltejs/kit";
import type { UserWithPermissionsResponse } from "$lib/interfaces/dto/user";
import { loadFormDataFromObject } from "$lib/utils/formDataInit";
import type { Permission, PermissionAction } from "$lib/interfaces/shared";
import type { AuthorizationRequest } from "$lib/interfaces/dto/authorization";

export const load = (async ({ parent, params, fetch }) => {
  const { session, users, trackers } = await parent();
  const tracker = trackers.find(tracker_ => tracker_._id === params.id);

  if (!tracker) {
    throw error(404, { message: "Tracker Not Found" });
  }

  if (tracker.author !== session?.user.id) {
    throw error(403, { message: "You don't have the permission to edit this tracker" });
  }

  // Concatenate the users info with their permissions for the current tracker.
  const usersWithPermissions: UserWithPermissionsResponse[] = await Promise.all(
    users.map(async user => {
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

  return { usersWithPermissions, tracker };
}) satisfies PageServerLoad;

export const actions: Actions = {
  updatePermissions: async ({ request, locals, params, fetch }) => {
    // Check the validity of the user
    const session = await locals.getSession();
    const currentUserInfo = session?.user;

    if (!currentUserInfo) {
      throw error(403, { message: "Authorization Error: You don't have access to this resource." });
    }

    const trackerId = params["id"];

    if (!trackerId) {
      throw error(403, { message: "URL Error: Invalid tracker ID" });
    }

    const isAuthorFormData = loadFormDataFromObject({
      tracker: trackerId,
      author: currentUserInfo.id
    });
    const checkAuthorResponse = await fetch("/api/user/author", {
      method: "POST",
      body: isAuthorFormData
    });
    const checkAuthorData = await checkAuthorResponse.json();

    if (!checkAuthorData.isUserTheAuthor) {
      throw error(403, { message: "Forbidden: Only the author of the tracker can modify it." });
    }

    // Update the permission for the specified user.
    const permissions: Permission[] = ["READ", "EDIT", "DELETE"];
    const actions: PermissionAction[] = ["GRANT", "REMOVE"];

    const formData = await request.formData();
    const userId = String(formData.get("user"));
    const permission = String(formData.get("permission")) as Permission;
    const action = String(formData.get("action")) as "GRANT" | "REMOVE";

    if (!permissions.includes(permission)) {
      throw error(400, { message: "Bad Request: Permission data malformed." });
    }

    if (!actions.includes(action)) {
      throw error(400, { message: "Bad Request: Permission Action data malformed." });
    }

    const authorizationRequestData: AuthorizationRequest = {
      user: userId,
      tracker: trackerId,
      permission: permission,
      permissionAction: action
    };
    const authorizationResponse = await fetch("/api/authorizations", {
      method: "PUT",
      body: loadFormDataFromObject(authorizationRequestData)
    });
    const authorization = await authorizationResponse.json();

    if (authorization?.message) {
      throw error(400, { message: authorization.message });
    }

    return { permissions: authorization.permissions };
  }
};
