import { MongoClient } from 'mongodb';
import cookie from 'cookie';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Some error occurred', status: 'error' }).end();

  try {
    // No DB interaction needed unless you're tracking sessions
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('token', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
      })
    );

    return res.status(200).json({ message: 'Logged out successfully', status: 'success' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Logout failed', status: 'error' });
  } finally {
    await client.close(); // Still good practice to close if opened
  }
}
