import { zfd } from 'zod-form-data';
import { z } from 'zod';

export function validate(formData: FormData) {
	const trackerSchema = zfd.formData({
		name: zfd.text(z.string().min(3))
	});

	const result = trackerSchema.safeParse(formData);

	if (!result.success) {
		return {
			data: Object.fromEntries(formData),
			errors: result.error.flatten().fieldErrors
		};
	}

	return { data: Object.fromEntries(formData), errors: undefined };
}
