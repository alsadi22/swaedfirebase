'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Award, 
  Calendar, 
  Clock,
  Star,
  TrendingUp,
  BookOpen,
  Target,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { t } from '@/lib/i18n/translations';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  getMentorProfile,
  searchMentors,
  getUserMentorships,
  getMentorshipSessions,
  requestMentorship,
} from '@/lib/services/mentorship';
import type { MentorProfile, Mentorship, MentorshipSession } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

export default function MentorshipPage() {
  const { locale } = useLanguage();
  const { user } = useAuth();
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('find');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [
        profile,
        fetchedMentors,
        fetchedMentorships,
      ] = await Promise.all([
        getMentorProfile(user.uid).catch(() => null),
        searchMentors({}),
        getUserMentorships(user.uid),
      ]);

      setMentorProfile(profile);
      setMentors(fetchedMentors.slice(0, 10));
      setMentorships(fetchedMentorships);

      // Load sessions for active mentorships
      if (fetchedMentorships.length > 0) {
        const allSessions: MentorshipSession[] = [];
        for (const mentorship of fetchedMentorships) {
          const mentorshipSessions = await getMentorshipSessions(mentorship.id);
          allSessions.push(...mentorshipSessions);
        }
        setSessions(allSessions);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMentorship = async (mentorId: string) => {
    if (!user) return;

    try {
      await requestMentorship(
        user.uid,
        mentorId,
        'LEADERSHIP',
        'Looking to develop leadership skills in volunteer management',
        'Flexible, prefer weekday evenings'
      );
      alert(t(locale, 'common.success'));
      await loadData();
    } catch (error) {
      console.error('Error requesting mentorship:', error);
      alert('Failed to send request');
    }
  };

  const formatDate = (date: any) => {
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: locale === 'ar' ? ar : enUS,
    });
  };

  const getAreaLabel = (area: string) => {
    const map: Record<string, string> = {
      EVENT_MANAGEMENT: t(locale, 'mentorship.eventManagement'),
      VOLUNTEER_COORDINATION: t(locale, 'mentorship.volunteerCoordination'),
      FUNDRAISING: t(locale, 'mentorship.fundraising'),
      COMMUNITY_OUTREACH: t(locale, 'mentorship.communityOutreach'),
      LEADERSHIP: t(locale, 'mentorship.leadership'),
      SKILL_DEVELOPMENT: t(locale, 'mentorship.skillDevelopment'),
      NONPROFIT_OPERATIONS: t(locale, 'mentorship.nonprofitOperations'),
    };
    return map[area] || area;
  };

  if (!user) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <p className="text-center text-gray-600">Please sign in to view this page</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t(locale, 'mentorship.title')}
        </h1>
        <p className="mt-2 text-gray-600">
          Grow through guidance and share your expertise
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t(locale, 'mentorship.myMentorships')}</p>
                <p className="text-3xl font-bold text-[#D4AF37]">{mentorships.length}</p>
              </div>
              <Users className="h-10 w-10 text-[#D4AF37]/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t(locale, 'mentorship.sessions')}</p>
                <p className="text-3xl font-bold text-blue-600">{sessions.length}</p>
              </div>
              <Calendar className="h-10 w-10 text-blue-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t(locale, 'mentorship.hoursCompleted')}</p>
                <p className="text-3xl font-bold text-green-600">
                  {mentorships.reduce((sum, m) => sum + (m.progress?.totalHours || 0), 0)}
                </p>
              </div>
              <Clock className="h-10 w-10 text-green-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t(locale, 'mentorship.rating')}</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {mentorProfile?.rating.toFixed(1) || 'N/A'}
                </p>
              </div>
              <Star className="h-10 w-10 text-yellow-600/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="find">
            {t(locale, 'mentorship.findMentor')}
          </TabsTrigger>
          <TabsTrigger value="my-mentorships">
            {t(locale, 'mentorship.myMentorships')}
          </TabsTrigger>
          <TabsTrigger value="sessions">
            {t(locale, 'mentorship.sessions')}
          </TabsTrigger>
          {mentorProfile && (
            <TabsTrigger value="mentor-profile">
              {t(locale, 'mentorship.mentorProfile')}
            </TabsTrigger>
          )}
        </TabsList>

        {/* Find Mentors Tab */}
        <TabsContent value="find">
          <Card>
            <CardHeader>
              <CardTitle>{t(locale, 'mentorship.findMentor')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-gray-600">{t(locale, 'common.loading')}</p>
              ) : mentors.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No mentors available</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {mentors.map((mentor) => {
                    const bio = locale === 'ar' && mentor.bioAr ? mentor.bioAr : mentor.bio;
                    
                    return (
                      <Card key={mentor.userId} className="border">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                                <Award className="h-6 w-6 text-[#D4AF37]" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{mentor.displayName}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                  <span className="text-sm font-medium">{mentor.rating.toFixed(1)}</span>
                                  <span className="text-xs text-gray-500">({mentor.reviewCount})</span>
                                </div>
                              </div>
                            </div>
                            
                            {mentor.verified && (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                {t(locale, 'mentorship.verified')}
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{bio}</p>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <BookOpen className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                {mentor.yearsOfExperience} {t(locale, 'mentorship.yearsOfExperience')}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                {mentor.availableHoursPerMonth}h/month
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                {mentor.currentMentees}/{mentor.maxMentees} mentees
                              </span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-xs font-medium text-gray-700 mb-2">
                              {t(locale, 'mentorship.areasOfExpertise')}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {mentor.areasOfExpertise.slice(0, 3).map((area) => (
                                <Badge key={area} variant="secondary" className="text-xs">
                                  {getAreaLabel(area)}
                                </Badge>
                              ))}
                              {mentor.areasOfExpertise.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{mentor.areasOfExpertise.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <Button
                            onClick={() => handleRequestMentorship(mentor.userId)}
                            disabled={mentor.currentMentees >= mentor.maxMentees}
                            className="w-full bg-[#D4AF37] hover:bg-[#B8941F]"
                          >
                            {t(locale, 'mentorship.requestMentorship')}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Mentorships Tab */}
        <TabsContent value="my-mentorships">
          <Card>
            <CardHeader>
              <CardTitle>{t(locale, 'mentorship.myMentorships')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-gray-600">{t(locale, 'common.loading')}</p>
              ) : mentorships.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No active mentorships</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mentorships.map((mentorship) => (
                    <Card key={mentorship.id} className="border">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {getAreaLabel(mentorship.areaOfFocus)}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {formatDate(mentorship.startDate)}
                            </p>
                          </div>
                          <Badge
                            variant={mentorship.status === 'ACTIVE' ? 'default' : 'secondary'}
                          >
                            {mentorship.status}
                          </Badge>
                        </div>

                        {/* Progress */}
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">{t(locale, 'mentorship.progress')}</span>
                              <span className="font-medium">
                                {mentorship.progress.goalsAchieved}/{mentorship.goals.length} {t(locale, 'mentorship.goals')}
                              </span>
                            </div>
                            <Progress 
                              value={(mentorship.progress.goalsAchieved / mentorship.goals.length) * 100}
                              className="h-2"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">{t(locale, 'mentorship.sessions')}</p>
                              <p className="font-semibold text-gray-900">
                                {mentorship.progress.sessionsCompleted}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">{t(locale, 'mentorship.hoursCompleted')}</p>
                              <p className="font-semibold text-gray-900">
                                {mentorship.progress.totalHours}h
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button variant="outline" className="w-full mt-4">
                          {t(locale, 'common.viewDetails')}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>{t(locale, 'mentorship.sessions')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-gray-600">{t(locale, 'common.loading')}</p>
              ) : sessions.length === 0 ? (
                <div className="py-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No sessions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <Card key={session.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{session.topic}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {formatDate(session.scheduledDate)} • {session.duration} min
                            </p>
                            {session.notes && (
                              <p className="text-sm text-gray-500 mt-2">{session.notes}</p>
                            )}
                          </div>
                          <Badge
                            variant={session.status === 'COMPLETED' ? 'default' : 'secondary'}
                          >
                            {session.status}
                          </Badge>
                        </div>

                        {session.status === 'COMPLETED' && session.rating && (
                          <div className="mt-3 flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < session.rating!
                                      ? 'fill-yellow-500 text-yellow-500'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            {session.feedback && (
                              <p className="text-sm text-gray-600">{session.feedback}</p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mentor Profile Tab */}
        {mentorProfile && (
          <TabsContent value="mentor-profile">
            <Card>
              <CardHeader>
                <CardTitle>{t(locale, 'mentorship.mentorProfile')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Bio</h3>
                    <p className="text-gray-700">
                      {locale === 'ar' && mentorProfile.bioAr ? mentorProfile.bioAr : mentorProfile.bio}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {t(locale, 'mentorship.areasOfExpertise')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {mentorProfile.areasOfExpertise.map((area) => (
                          <Badge key={area} variant="secondary">
                            {getAreaLabel(area)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Stats</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-600">Total Hours:</span> {mentorProfile.totalMentorshipHours}h</p>
                        <p><span className="text-gray-600">Current Mentees:</span> {mentorProfile.currentMentees}/{mentorProfile.maxMentees}</p>
                        <p><span className="text-gray-600">Rating:</span> {mentorProfile.rating.toFixed(1)} ({mentorProfile.reviewCount} reviews)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
