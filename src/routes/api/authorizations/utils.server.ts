import type { UpdateFilter } from "mongodb";
import type { Authorization } from "$lib/interfaces/db/authorization";
import type { Permission, PermissionAction } from "$lib/interfaces/shared";

export const updateByAction = (
  action: PermissionAction,
  permission: Permission
): UpdateFilter<Authorization> => {
  switch (action) {
    case "GRANT":
      return { $addToSet: { permissions: permission } };

    case "REMOVE":
      return { $pull: { permissions: permission } };
  }
};
