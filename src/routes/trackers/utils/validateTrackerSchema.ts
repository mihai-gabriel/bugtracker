import { zfd } from 'zod-form-data';
import { z } from 'zod';

export function validateTrackerSchema(formData: FormData) {
  const trackerSchema = zfd.formData({
    name: zfd.text(z.string().min(3))
  });

  const result = trackerSchema.safeParse(formData);

  let errors = undefined;

  if (!result.success) {
    errors = result.error.flatten().fieldErrors;
  }

  return { errors };
}
