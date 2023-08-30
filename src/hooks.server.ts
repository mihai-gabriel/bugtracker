import { run } from '$lib/server/db';

run().then(() => {
	console.info('[app] Database connection successful');
});
