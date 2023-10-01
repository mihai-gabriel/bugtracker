import { type Actions, fail } from "@sveltejs/kit";
import { validateTrackerSchema } from "./utils/validateTrackerSchema";

export const actions: Actions = {
  createTracker: async ({ request, fetch }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const { errors } = validateTrackerSchema(formData);

    if (errors) {
      return fail(400, { data, errors });
    }

    const response = await fetch("/api/trackers", {
      method: "POST",
      body: formData
    });

    const responseData = await response.json();

    if (response.status !== 200 && responseData?.message) {
      const errors = { serverError: responseData.message };

      return fail(400, { data, errors });
    }

    return { success: "tracker created", _id: responseData._id };
  }
};
