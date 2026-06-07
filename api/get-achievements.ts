import { MongoClient, ObjectId } from 'mongodb';
import jwt, { JwtPayload } from 'jsonwebtoken';
import cookie from 'cookie';
import { VercelRequest, VercelResponse } from '@vercel/node';

const uri = process.env.MONGODB_URI!;
const JWT_SECRET = process.env.JWT_SECRET!;
const client = new MongoClient(uri);

interface Session {
  sessionType: string;
  durationSeconds: number;
  score: number;
  completedAt: Date;
  completed?: boolean;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const { token } = cookie.parse(req.headers.cookie || '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'string' || !('id' in decoded)) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }
    const userId = (decoded as JwtPayload).id;

    await client.connect();
    const db = client.db('vision_therapy');
    const sessionsCollection = db.collection('therapy_sessions');
    const achievementsCollection = db.collection('user_achievements');

    // 1. Get existing earned achievements
    const earnedAchievements = await achievementsCollection.find({ 
      userId: ObjectId.createFromHexString(userId) 
    }).toArray();
    
    const earnedBadgeIds = new Set(earnedAchievements.map(a => a.badgeId));

    // 2. Get session history to check for new achievements
    const allSessions = await sessionsCollection.find({ 
      userId: ObjectId.createFromHexString(userId) 
    }).toArray() as unknown as Session[];

    // 3. Define Badge Definitions (Matching Frontend)
    const badgeDefinitions = [
      { id: 'p-7', requirement: 7, type: 'total_sessions', category: 'patching' },
      { id: 'p-30', requirement: 30, type: 'total_sessions', category: 'patching' },
      { id: 'g-500', requirement: 500, type: 'high_score', category: 'games' },
      { id: 'e-10', requirement: 10, type: 'total_sessions', category: 'exercises' },
      { id: 't-1000', requirement: 1000, type: 'total_time', category: 'patching' },
      { id: 's-7', requirement: 7, type: 'streak', category: 'patching' },
      { id: 'w-5', requirement: 5, type: 'weekly_challenge', category: 'exercises' },
    ];

    const patchingSessions = allSessions.filter(s => s.sessionType === 'patching');
    const exerciseSessions = allSessions.filter(s => 
      s.sessionType !== 'patching' &&
      (s.sessionType.includes('exercise') || 
      ['brock_string', 'near_far', 'saccade', 'character_hunt', 'dot_tracing', 'smooth_pursuit', 'anaglyph_bubble', 'anaglyph_maze', 'anaglyph_hidden', 'anaglyph_snake'].includes(s.sessionType))
    );
    const totalPatchingTime = patchingSessions.reduce((acc, s) => acc + (s.durationSeconds / 60), 0);
    const maxScore = allSessions.reduce((max, s) => Math.max(max, s.score || 0), 0);

    // Calculate Streak
    let currentStreak = 0;
    const patchingDates = patchingSessions
      .filter(s => s.completed !== false)
      .map(s => new Date(s.completedAt).toISOString().split('T')[0])
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (patchingDates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const lastSessionDate = patchingDates[0];
      const diffDays = Math.floor((new Date(today).getTime() - new Date(lastSessionDate).getTime()) / (1000 * 3600 * 24));
      
      if (diffDays <= 1) {
        currentStreak = 1;
        for (let i = 0; i < patchingDates.length - 1; i++) {
          const d1 = new Date(patchingDates[i]);
          const d2 = new Date(patchingDates[i+1]);
          const diff = (d1.getTime() - d2.getTime()) / (1000 * 3600 * 24);
          if (diff === 1) currentStreak++;
          else break;
        }
      }
    }

    // Weekly Challenge Calculation
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const weeklyExerciseTypes = new Set(
      allSessions
        .filter(s => {
          const completedDate = new Date(s.completedAt);
          return (
            s.sessionType !== 'patching' && 
            !isNaN(completedDate.getTime()) && 
            completedDate >= sevenDaysAgo
          );
        })
        .map(s => s.sessionType)
    );

    // 4. Check for new achievements to award
    const newAwards: any[] = [];
    const finalBadges = badgeDefinitions.map(badge => {
      let isEarnedNow = earnedBadgeIds.has(badge.id);
      
      if (!isEarnedNow) {
        switch(badge.type) {
          case 'total_sessions':
            if (badge.category === 'patching') isEarnedNow = patchingSessions.length >= badge.requirement;
            if (badge.category === 'exercises') isEarnedNow = exerciseSessions.length >= badge.requirement;
            break;
          case 'high_score':
            isEarnedNow = maxScore >= badge.requirement;
            break;
          case 'total_time':
            isEarnedNow = totalPatchingTime >= badge.requirement;
            break;
          case 'streak':
            isEarnedNow = currentStreak >= badge.requirement;
            break;
          case 'weekly_challenge':
            isEarnedNow = weeklyExerciseTypes.size >= badge.requirement;
            break;
        }

        if (isEarnedNow) {
          newAwards.push({
            userId: ObjectId.createFromHexString(userId),
            badgeId: badge.id,
            earnedAt: new Date()
          });
        }
      }
      return { id: badge.id, earned: isEarnedNow };
    });

    // 5. Save new awards to database
    if (newAwards.length > 0) {
      await achievementsCollection.insertMany(newAwards);
    }

    return res.status(200).json({
      badges: finalBadges,
      earnedCount: finalBadges.filter(b => b.earned).length,
      totalCount: finalBadges.length,
      weeklyChallenge: {
        count: weeklyExerciseTypes.size,
        total: 5,
        completed: weeklyExerciseTypes.size >= 5,
        types: Array.from(weeklyExerciseTypes)
      }
    });

  } catch (err) {
    console.error('Get achievements error:', err);
    return res.status(500).json({ message: 'Internal server error', status: 'error' });
  } finally {
    await client.close();
  }
}
