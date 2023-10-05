import type { OptionalAssignedUser, UserResponse } from "$lib/interfaces/dto/user";

export const unwrapUser = (user: OptionalAssignedUser, key: keyof UserResponse) => {
  if (user === "unassigned") {
    return "";
  }

  return user[key];
};
