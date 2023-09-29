import type { Permission, PermissionAction } from "$lib/interfaces/shared";

// `user` and `tracker` represent the ID of the user, and tracker respectively
export type AuthorizationResponse = {
  _id: string;
  user: string;
  tracker: string;
  permissions: Permission[];
};

export type AuthorizationRequest = {
  user: string;
  tracker: string;
  permission: Permission;
  permissionAction: PermissionAction;
};
