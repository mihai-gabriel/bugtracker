import { MongoClient, ServerApiVersion } from 'mongodb';
import { DATABASE_URI, DATABASE_KEY } from '$env/static/private';

const client = new MongoClient(DATABASE_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

export async function run() {
  return client.connect();
}

export default client.db(DATABASE_KEY);
