import type { Bug } from "$lib/interfaces/db";
import type { Priority, Status } from "$lib/interfaces/shared";
import { ObjectId } from "mongodb";
import type { OptionalAssignedUser } from "$lib/interfaces/dto/user";
import type { OptionalAssignedUserDb } from "$lib/interfaces/db/user";

/**
 * Converts a user with `_id: string` to a user with `_id: ObjectId`.
 *
 * @param userRequest - a user object or unassigned
 * @returns converted object having a ObjectId or unassigned.
 */
const convertUserToDbFormat = (userRequest: OptionalAssignedUser): OptionalAssignedUserDb => {
  if (typeof userRequest === "object") {
    return { ...userRequest, _id: new ObjectId(userRequest._id) };
  }

  return userRequest;
};

export const parseBugFormData = (formData: FormData): Bug => {
  const title = String(formData.get("title"));
  const description = String(formData.get("description"));
  const priority = String(formData.get("priority")) as Priority;
  const status = String(formData.get("status")) as Status;
  const archived = String(formData.get("archived")) === "true";

  const assigneeRequest = JSON.parse(String(formData.get("assignee")));
  const reviewerRequest = JSON.parse(String(formData.get("reviewer")));

  const assignee = convertUserToDbFormat(assigneeRequest);
  const reviewer = convertUserToDbFormat(reviewerRequest);

  return {
    title,
    description,
    assignee,
    reviewer,
    priority,
    status,
    archived
  };
};
