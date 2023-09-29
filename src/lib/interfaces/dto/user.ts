import type { Permission } from "$lib/interfaces/shared";

export type UserResponse = {
  _id: string;
  name?: string | null;
  email: string;
  image?: string | null;
};

export type UserWithPermissionsResponse = UserResponse & {
  permissions: Permission[];
};
