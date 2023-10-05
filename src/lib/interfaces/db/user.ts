import type { Unassigned } from "$lib/interfaces/dto/user";
import type { WithId } from "mongodb";

export type User = {
  name?: string | null;
  email: string;
  image?: string | null;
};

export type OptionalAssignedUserDb = WithId<User> | Unassigned;
