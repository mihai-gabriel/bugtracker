import { zfd } from "zod-form-data";
import { z } from "zod";
import { Priority, Status } from "$lib/interfaces/shared";
import { ObjectId } from "mongodb";

export function validateBugSchema(formData: FormData) {
  const bugSchema = zfd.formData({
    title: zfd.text(z.string().min(3)),
    description: zfd.text(z.string().min(3)),
    assignee: zfd.text(z.string().refine(value => ObjectId.isValid(value))),
    reviewer: zfd.text(z.string().refine(value => ObjectId.isValid(value))),
    priority: zfd.text(z.nativeEnum(Priority)),
    status: zfd.text(z.nativeEnum(Status))
  });

  const result = bugSchema.safeParse(formData);

  let errors = undefined;

  if (!result.success) {
    errors = result.error.flatten().fieldErrors as Record<string, unknown>;
    console.log(errors);
  }

  return { errors };
}
