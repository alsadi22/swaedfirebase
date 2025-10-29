'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/database';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  earned: boolean;
  earned_date?: string;
  progress?: number;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user, error, isLoading } = useUser();

  useEffect(() => {
    fetchAchievements();
  }, [user]);

  async function fetchAchievements() {
    try {
      // Check if user is authenticated
      if (isLoading) return;
      
      if (error || !user) {
        console.error('User not authenticated:', error);
        return;
      }

      // Get all achievements
      const allAchievementsResult = await db.query(
        'SELECT * FROM achievements ORDER BY requirement_value ASC'
      );

      // Get user's earned achievements
      const userAchievementsResult = await db.query(
        'SELECT achievement_id, earned_date FROM user_achievements WHERE user_id = $1',
        [user.sub]
      );

      // Get user stats for progress calculation
      const hoursResult = await db.query(
        'SELECT hours_logged FROM volunteer_hours WHERE user_id = $1 AND status = $2',
        [user.sub, 'approved']
      );

      const totalHours = hoursResult.rows?.reduce((sum: number, h: any) => sum + (h.hours_logged || 0), 0) || 0;

      const earnedIds = userAchievementsResult.rows?.map((ua: any) => ua.achievement_id) || [];

      const achievementsWithProgress = allAchievementsResult.rows?.map((achievement: any) => ({
        ...achievement,
        earned: earnedIds.includes(achievement.id),
        earned_date: userAchievementsResult.rows?.find((ua: any) => ua.achievement_id === achievement.id)?.earned_date,
        progress: achievement.requirement_type === 'hours_logged' 
          ? Math.min(100, (totalHours / achievement.requirement_value) * 100)
          : 0,
      })) || [];

      setAchievements(achievementsWithProgress);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredAchievements = achievements.filter(a => {
    if (filter === 'earned') return a.earned;
    if (filter === 'locked') return !a.earned;
    return true;
  });

  const earnedCount = achievements.filter(a => a.earned).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Achievements</h1>
          <p className="text-text-secondary mt-1">
            Unlock achievements by completing volunteer activities
          </p>
        </div>

        {/* Progress Banner */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-soft p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Progress</h2>
              <p className="text-white/90">
                {earnedCount} of {achievements.length} achievements unlocked
              </p>
            </div>
            <div className="text-6xl font-bold">
              {Math.round((earnedCount / achievements.length) * 100)}%
            </div>
          </div>
          <div className="mt-4 bg-white/20 rounded-full h-3">
            <div 
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${(earnedCount / achievements.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-soft mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-6 py-4 text-sm font-medium ${
                filter === 'all'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              All ({achievements.length})
            </button>
            <button
              onClick={() => setFilter('earned')}
              className={`flex-1 px-6 py-4 text-sm font-medium ${
                filter === 'earned'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Earned ({earnedCount})
            </button>
            <button
              onClick={() => setFilter('locked')}
              className={`flex-1 px-6 py-4 text-sm font-medium ${
                filter === 'locked'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Locked ({achievements.length - earnedCount})
            </button>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`bg-white rounded-lg shadow-soft overflow-hidden transition ${
                achievement.earned ? 'border-2 border-accent' : 'opacity-75'
              }`}
            >
              <div className={`p-6 ${
                achievement.earned 
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50' 
                  : 'bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                    achievement.earned ? 'bg-accent text-white' : 'bg-gray-300 text-gray-500'
                  }`}>
                    {achievement.icon || '🏆'}
                  </div>
                  {achievement.earned && (
                    <svg className="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                <h3 className="font-bold text-text-primary mb-2">{achievement.name}</h3>
                <p className="text-sm text-text-secondary mb-3">{achievement.description}</p>

                {!achievement.earned && achievement.progress !== undefined && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                      <span>Progress</span>
                      <span>{Math.round(achievement.progress)}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-accent rounded-full h-2 transition-all duration-500"
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {achievement.earned && achievement.earned_date && (
                  <p className="text-xs text-accent mt-3">
                    Earned on {new Date(achievement.earned_date).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">Requirement:</span>
                  <span className="font-semibold text-text-primary">
                    {achievement.requirement_value} {achievement.requirement_type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-soft">
            <p className="text-text-secondary">No achievements found</p>
          </div>
        )}
      </div>
    </div>
  );
}
