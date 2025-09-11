// api/pingMongo.ts
import { MongoClient, ServerApiVersion } from 'mongodb';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    res.status(200).json({ message: 'Connected to MongoDB Atlas!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Connection failed' });
  } finally {
    await client.close();
  }
}
