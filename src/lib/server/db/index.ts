import { MongoClient, ServerApiVersion } from 'mongodb';

const client = new MongoClient(import.meta.env.VITE_DATABASE_URI, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true
	}
});

export async function run() {
	return client.connect();
}

export default client.db(import.meta.env.VITE_DATABASE_KEY);
