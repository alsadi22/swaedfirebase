'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX,
  Search,
  Filter,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { t } from '@/lib/i18n/translations';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  getUserConnections,
  getPendingRequests,
  acceptConnectionRequest,
  removeConnection,
  getSuggestedConnections,
  sendConnectionRequest,
  getUserSocialActivity,
} from '@/lib/services/socialNetwork';
import type { VolunteerConnection, SocialActivity } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

export default function SocialNetworkPage() {
  const { locale } = useLanguage();
  const { user } = useAuth();
  const [connections, setConnections] = useState<VolunteerConnection[]>([]);
  const [requests, setRequests] = useState<VolunteerConnection[]>([]);
  const [suggestions, setSuggestions] = useState<VolunteerConnection[]>([]);
  const [activities, setActivities] = useState<SocialActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('connections');

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
        fetchedConnections,
        fetchedRequests,
        fetchedSuggestions,
        fetchedActivities,
      ] = await Promise.all([
        getUserConnections(user.uid, 'ACCEPTED'),
        getPendingRequests(user.uid),
        getSuggestedConnections(user.uid),
        getUserSocialActivity(user.uid, 'PUBLIC', 20),
      ]);

      setConnections(fetchedConnections);
      setRequests(fetchedRequests);
      setSuggestions(fetchedSuggestions);
      setActivities(fetchedActivities);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (connectionId: string) => {
    try {
      await acceptConnectionRequest(connectionId);
      await loadData();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDeclineRequest = async (connectionId: string) => {
    try {
      await removeConnection(connectionId);
      await loadData();
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const handleSendRequest = async (userId: string) => {
    if (!user) return;
    
    try {
      await sendConnectionRequest(user.uid, userId);
      await loadData();
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const formatDate = (date: any) => {
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: locale === 'ar' ? ar : enUS,
    });
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
          {t(locale, 'social.connections')}
        </h1>
        <p className="mt-2 text-gray-600">
          {t(locale, 'nav.network')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t(locale, 'social.connections')}</p>
                <p className="text-3xl font-bold text-[#D4AF37]">{connections.length}</p>
              </div>
              <UserCheck className="h-10 w-10 text-[#D4AF37]/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t(locale, 'social.requests')}</p>
                <p className="text-3xl font-bold text-blue-600">{requests.length}</p>
              </div>
              <UserPlus className="h-10 w-10 text-blue-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t(locale, 'social.suggestions')}</p>
                <p className="text-3xl font-bold text-green-600">{suggestions.length}</p>
              </div>
              <Users className="h-10 w-10 text-green-600/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="connections">
            {t(locale, 'social.connections')}
          </TabsTrigger>
          <TabsTrigger value="requests">
            {t(locale, 'social.requests')} {requests.length > 0 && `(${requests.length})`}
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            {t(locale, 'social.suggestions')}
          </TabsTrigger>
          <TabsTrigger value="activity">
            {t(locale, 'social.activityFeed')}
          </TabsTrigger>
        </TabsList>

        {/* Connections Tab */}
        <TabsContent value="connections">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t(locale, 'social.connections')}</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder={t(locale, 'common.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-gray-600">{t(locale, 'common.loading')}</p>
              ) : connections.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">{t(locale, 'social.noConnections')}</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {connections.map((connection) => {
                    const otherId = connection.userId1 === user.uid ? connection.userId2 : connection.userId1;
                    
                    return (
                      <Card key={connection.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-12 w-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                              <UserCheck className="h-6 w-6 text-[#D4AF37]" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Connection</p>
                              <p className="text-xs text-gray-600">
                                {formatDate(connection.connectedAt || connection.createdAt)}
                              </p>
                            </div>
                          </div>
                          
                          {connection.sharedEvents && connection.sharedEvents.length > 0 && (
                            <p className="text-sm text-gray-600 mb-3">
                              <Calendar className="inline h-4 w-4 mr-1" />
                              {connection.sharedEvents.length} {t(locale, 'social.sharedEvents')}
                            </p>
                          )}
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              {t(locale, 'social.profile')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDeclineRequest(connection.id)}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>{t(locale, 'social.requests')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-gray-600">{t(locale, 'common.loading')}</p>
              ) : requests.length === 0 ? (
                <div className="py-12 text-center">
                  <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">{t(locale, 'social.noRequests')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <Card key={request.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                              <UserPlus className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Connection Request</p>
                              <p className="text-sm text-gray-600">
                                {formatDate(request.createdAt)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptRequest(request.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {t(locale, 'social.accept')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeclineRequest(request.id)}
                            >
                              {t(locale, 'social.decline')}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions">
          <Card>
            <CardHeader>
              <CardTitle>{t(locale, 'social.suggestions')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-gray-600">{t(locale, 'common.loading')}</p>
              ) : suggestions.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No suggestions available</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {suggestions.map((suggestion) => {
                    const otherId = suggestion.userId1 === user.uid ? suggestion.userId2 : suggestion.userId1;
                    
                    return (
                      <Card key={suggestion.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                              <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Suggested</p>
                              <p className="text-xs text-gray-600">
                                {suggestion.sharedEvents?.length || 0} shared events
                              </p>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => handleSendRequest(otherId)}
                            className="w-full bg-[#D4AF37] hover:bg-[#B8941F]"
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            {t(locale, 'social.connect')}
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

        {/* Activity Feed Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>{t(locale, 'social.activityFeed')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-gray-600">{t(locale, 'common.loading')}</p>
              ) : activities.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-600">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => {
                    const title = locale === 'ar' && activity.titleAr ? activity.titleAr : activity.title;
                    const description = locale === 'ar' && activity.descriptionAr ? activity.descriptionAr : activity.description;
                    
                    return (
                      <Card key={activity.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{title}</p>
                              <p className="text-sm text-gray-600 mt-1">{description}</p>
                              <p className="text-xs text-gray-500 mt-2">{formatDate(activity.createdAt)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
