'use client';

import { useState, useEffect } from 'react';
import { 
  Handshake, 
  Building2, 
  Calendar, 
  FileText,
  Users,
  Target,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { t } from '@/lib/i18n/translations';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  getOrganizationPartnerships,
  getPartnershipInvitations,
  acceptPartnershipInvitation,
  declinePartnershipInvitation,
} from '@/lib/services/partnerships';
import type { Partnership, PartnershipInvitation } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

export default function PartnershipsPage() {
  const { locale } = useLanguage();
  const { user } = useAuth();
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [invitations, setInvitations] = useState<PartnershipInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    if (user?.organizationId) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.organizationId) return;

    try {
      setLoading(true);
      const [fetchedPartnerships, fetchedInvitations] = await Promise.all([
        getOrganizationPartnerships(user.organizationId),
        getPartnershipInvitations(user.organizationId, 'PENDING'),
      ]);

      setPartnerships(fetchedPartnerships);
      setInvitations(fetchedInvitations);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      await acceptPartnershipInvitation(invitationId);
      await loadData();
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      await declinePartnershipInvitation(invitationId);
      await loadData();
    } catch (error) {
      console.error('Error declining invitation:', error);
    }
  };

  const formatDate = (date: any) => {
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: locale === 'ar' ? ar : enUS,
    });
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      COLLABORATION: t(locale, 'partnerships.collaboration'),
      RESOURCE_SHARING: t(locale, 'partnerships.resourceSharing'),
      EVENT_COHOST: t(locale, 'partnerships.eventCohost'),
      FUNDING: t(locale, 'partnerships.funding'),
    };
    return map[type] || type;
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      SUSPENDED: 'bg-orange-100 text-orange-700',
      TERMINATED: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  if (!user?.organizationId) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <p className="text-center text-gray-600">
          This page is only available for organizations
        </p>
      </div>
    );
  }

  const activePartnerships = partnerships.filter(p => p.status === 'ACTIVE');
  const pendingPartnerships = partnerships.filter(p => p.status === 'PENDING');

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t(locale, 'partnerships.title')}
        </h1>
        <p className="mt-2 text-gray-600">
          Build strategic partnerships to amplify your impact
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t(locale, 'partnerships.active')}</p>
                <p className="text-3xl font-bold text-green-600">{activePartnerships.length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t(locale, 'partnerships.pending')}</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingPartnerships.length}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t(locale, 'partnerships.invitations')}</p>
                <p className="text-3xl font-bold text-blue-600">{invitations.length}</p>
              </div>
              <Handshake className="h-10 w-10 text-blue-600/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t(locale, 'partnerships.jointEvents')}</p>
                <p className="text-3xl font-bold text-[#D4AF37]">
                  {partnerships.reduce((sum, p) => sum + p.jointEvents.length, 0)}
                </p>
              </div>
              <Target className="h-10 w-10 text-[#D4AF37]/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="active">
            {t(locale, 'partnerships.active')} ({activePartnerships.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            {t(locale, 'partnerships.pending')} ({pendingPartnerships.length})
          </TabsTrigger>
          <TabsTrigger value="invitations">
            {t(locale, 'partnerships.invitations')} ({invitations.length})
          </TabsTrigger>
        </TabsList>

        {/* Active Partnerships Tab */}
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>{t(locale, 'partnerships.active')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-gray-600">{t(locale, 'common.loading')}</p>
              ) : activePartnerships.length === 0 ? (
                <div className="py-12 text-center">
                  <Handshake className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">{t(locale, 'partnerships.noPartnerships')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activePartnerships.map((partnership) => {
                    const title = locale === 'ar' && partnership.titleAr ? partnership.titleAr : partnership.title;
                    const description = locale === 'ar' && partnership.descriptionAr ? partnership.descriptionAr : partnership.description;
                    const partnerName = partnership.organizationId1 === user.organizationId
                      ? partnership.organization2Name
                      : partnership.organization1Name;

                    return (
                      <Card key={partnership.id} className="border">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-green-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{partnerName}</p>
                                <p className="text-sm text-gray-600">{getTypeLabel(partnership.type)}</p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(partnership.status)}>
                              {partnership.status}
                            </Badge>
                          </div>

                          <div className="mb-4">
                            <p className="font-medium text-gray-900 mb-1">{title}</p>
                            <p className="text-sm text-gray-600">{description}</p>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                              <p className="text-gray-600 mb-1">{t(locale, 'partnerships.startDate')}</p>
                              <p className="font-medium">{formatDate(partnership.startDate)}</p>
                            </div>
                            {partnership.endDate && (
                              <div>
                                <p className="text-gray-600 mb-1">{t(locale, 'partnerships.endDate')}</p>
                                <p className="font-medium">{formatDate(partnership.endDate)}</p>
                              </div>
                            )}
                          </div>

                          {partnership.sharedResources && partnership.sharedResources.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                {t(locale, 'partnerships.sharedResources')}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {partnership.sharedResources.map((resource, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {resource.type}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {partnership.jointEvents.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                {t(locale, 'partnerships.jointEvents')}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>{partnership.jointEvents.length} events</span>
                              </div>
                            </div>
                          )}

                          <Button variant="outline" className="w-full">
                            {t(locale, 'partnerships.viewDetails')}
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

        {/* Pending Partnerships Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>{t(locale, 'partnerships.pending')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-gray-600">{t(locale, 'common.loading')}</p>
              ) : pendingPartnerships.length === 0 ? (
                <div className="py-12 text-center">
                  <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No pending partnerships</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPartnerships.map((partnership) => {
                    const title = locale === 'ar' && partnership.titleAr ? partnership.titleAr : partnership.title;
                    const partnerName = partnership.organizationId1 === user.organizationId
                      ? partnership.organization2Name
                      : partnership.organization1Name;

                    return (
                      <Card key={partnership.id} className="border">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-yellow-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{partnerName}</p>
                                <p className="text-sm text-gray-600">{title}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDate(partnership.createdAt)}
                                </p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(partnership.status)}>
                              {partnership.status}
                            </Badge>
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

        {/* Invitations Tab */}
        <TabsContent value="invitations">
          <Card>
            <CardHeader>
              <CardTitle>{t(locale, 'partnerships.invitations')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-gray-600">{t(locale, 'common.loading')}</p>
              ) : invitations.length === 0 ? (
                <div className="py-12 text-center">
                  <Handshake className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No pending invitations</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <Card key={invitation.id} className="border">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                              <Handshake className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Partnership Invitation</p>
                              <p className="text-sm text-gray-600">
                                {getTypeLabel(invitation.proposedType)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(invitation.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {invitation.message && (
                          <p className="text-sm text-gray-700 mb-4 p-3 bg-gray-50 rounded">
                            {invitation.message}
                          </p>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAcceptInvitation(invitation.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {t(locale, 'partnerships.acceptInvitation')}
                          </Button>
                          <Button
                            onClick={() => handleDeclineInvitation(invitation.id)}
                            variant="outline"
                            className="flex-1"
                          >
                            <X className="mr-2 h-4 w-4" />
                            {t(locale, 'partnerships.declineInvitation')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
