'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  getAllBadges,
  getUserBadges,
  getAchievementStats,
  getUserRank,
} from '@/lib/services/achievements';
import type { Badge, UserBadge } from '@/types';
import { Award, Trophy, Star, Medal, Clock, Users, Target } from 'lucide-react';

export default function AchievementsPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [rank, setRank] = useState<number>(0);

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const [badgesData, userBadgesData, statsData, rankData] = await Promise.all([
        getAllBadges(),
        getUserBadges(user!.id),
        getAchievementStats(user!.id),
        getUserRank(user!.id),
      ]);
      
      setAllBadges(badgesData);
      setUserBadges(userBadgesData);
      setStats(statsData);
      setRank(rankData);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasBadge = (badgeId: string) => {
    return userBadges.some(ub => ub.badgeId === badgeId);
  };

  const getBadgeIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      clock: Clock,
      award: Award,
      trophy: Trophy,
      star: Star,
      medal: Medal,
      users: Users,
    };
    return icons[iconName] || Award;
  };

  const getRarityColor = (rarity: Badge['rarity']) => {
    const colors = {
      COMMON: 'text-gray-500 bg-gray-100',
      RARE: 'text-blue-500 bg-blue-100',
      EPIC: 'text-purple-500 bg-purple-100',
      LEGENDARY: 'text-yellow-500 bg-yellow-100',
    };
    return colors[rarity];
  };

  const getCategoryLabel = (category: Badge['category']) => {
    const labels = {
      HOURS: language === 'ar' ? 'الساعات' : 'Hours',
      EVENTS: language === 'ar' ? 'الفعاليات' : 'Events',
      CATEGORY: language === 'ar' ? 'الفئة' : 'Category',
      SPECIAL: language === 'ar' ? 'خاص' : 'Special',
    };
    return labels[category];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const badgesByCategory = allBadges.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {language === 'ar' ? 'الإنجازات والشارات' : 'Achievements & Badges'}
          </h1>
          <p className="mt-2 text-gray-600">
            {language === 'ar'
              ? 'اعرض إنجازاتك واكسب الشارات'
              : 'Showcase your achievements and earn badges'}
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">
                    {language === 'ar' ? 'الترتيب' : 'Rank'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">#{rank}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">
                    {language === 'ar' ? 'الشارات' : 'Badges'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalBadges}/{allBadges.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">
                    {language === 'ar' ? 'الأهداف المكتملة' : 'Goals Completed'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedGoals}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">
                    {language === 'ar' ? 'الأهداف النشطة' : 'Active Goals'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeGoals}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {language === 'ar' ? 'التقدم الإجمالي' : 'Overall Progress'}
            </h2>
            <span className="text-sm text-gray-600">
              {stats ? Math.round((stats.totalBadges / allBadges.length) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${stats ? (stats.totalBadges / allBadges.length) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Badges by Category */}
        {Object.entries(badgesByCategory).map(([category, badges]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {getCategoryLabel(category as Badge['category'])}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map(badge => {
                const earned = hasBadge(badge.id);
                const Icon = getBadgeIcon(badge.icon);
                const rarityColor = getRarityColor(badge.rarity);

                return (
                  <div
                    key={badge.id}
                    className={`bg-white rounded-lg shadow-md p-6 transition-all duration-200 ${
                      earned
                        ? 'border-2 border-blue-500 hover:shadow-lg'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`p-3 rounded-full ${rarityColor} ${
                          !earned && 'grayscale'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {language === 'ar' ? badge.nameAr : badge.name}
                          </h3>
                          {earned && (
                            <Trophy className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {language === 'ar'
                            ? badge.descriptionAr
                            : badge.description}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${rarityColor}`}
                          >
                            {badge.rarity}
                          </span>
                          {earned ? (
                            <span className="text-xs text-green-600 font-medium">
                              {language === 'ar' ? 'محرز' : 'Earned'}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">
                              {language === 'ar' ? 'مقفل' : 'Locked'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
