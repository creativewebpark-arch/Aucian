// POST /api/notify   body: { title, body, topic }
// Sends a push notification (with sound) to every device subscribed to the
// given FCM topic. Called by the app whenever a new post/comment is made.
//
// Needs the FIREBASE_SERVICE_ACCOUNT environment variable set in Vercel
// (the full JSON key of a Firebase service account, as one line). See
// SETUP_GUIDE.md for how to get this.

import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { title, body, topic } = req.body || {};
  if (!title || !body) {
    return res.status(400).json({ error: 'title and body are required' });
  }

  try {
    await admin.messaging().send({
      topic: topic || 'all_aucian_users',
      notification: { title, body },
      android: {
        priority: 'high',
        notification: { sound: 'default', channelId: 'aucian_default' },
      },
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('notify error:', err);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
}
