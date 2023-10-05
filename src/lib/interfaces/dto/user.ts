import type { Permission } from "$lib/interfaces/shared";

export type Unassigned = "unassigned";

export type UserResponse = {
  _id: string;
  name?: string | null;
  email: string;
  image?: string | null;
};

export type UserWithPermissionsResponse = UserResponse & {
  permissions: Permission[];
};

export type OptionalAssignedUser = UserResponse | Unassigned;

/**
 * This type is used when we are saving a user entry independent of the table 'users'.
 * This is made in order to ensure that we're still having user information for a bug
 * even when it's archived or the user does not exist anymore.
 */
export type BugUserRequest = {
  name?: string | null;
  email: string;
  image?: string | null;
};
