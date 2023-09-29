import type { ObjectId } from "mongodb";
import type { Permission } from "$lib/interfaces/shared";

export type Authorization = {
  user: ObjectId;
  tracker: ObjectId;
  permissions: Permission[];
};
