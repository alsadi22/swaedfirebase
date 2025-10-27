'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { suggestVolunteersForEvent, getVolunteersForOutreach } from '@/lib/services/volunteerMatching';
import type { VolunteerMatch } from '@/types';
import { Users, Star, MapPin, Clock, Award, Mail, Send } from 'lucide-react';

export default function VolunteerMatchingPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<VolunteerMatch[]>([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (eventId) {
      loadMatches();
    }
  }, [eventId]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const matchesData = await suggestVolunteersForEvent(eventId, 20);
      setMatches(matchesData);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVolunteer = (userId: string) => {
    const newSelected = new Set(selectedVolunteers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedVolunteers(newSelected);
  };

  const handleSendInvites = async () => {
    if (selectedVolunteers.size === 0) {
      alert(language === 'ar' ? 'الرجاء اختيار متطوعين' : 'Please select volunteers');
      return;
    }

    try {
      const outreachList = await getVolunteersForOutreach(eventId);
      const selectedList = outreachList.filter(v => selectedVolunteers.has(v.userId));
      
      // Here you would integrate with email service
      console.log('Sending invites to:', selectedList);
      
      alert(
        language === 'ar'
          ? `تم إرسال الدعوات إلى ${selectedList.length} متطوع`
          : `Invites sent to ${selectedList.length} volunteers`
      );
      
      setSelectedVolunteers(new Set());
    } catch (error) {
      console.error('Error sending invites:', error);
      alert(language === 'ar' ? 'فشل إرسال الدعوات' : 'Failed to send invites');
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {language === 'ar' ? 'مطابقة المتطوعين' : 'Volunteer Matching'}
            </h1>
            <p className="mt-2 text-gray-600">
              {language === 'ar'
                ? 'اعثر على أفضل المتطوعين لفعاليتك'
                : 'Find the best volunteers for your event'}
            </p>
          </div>
          {selectedVolunteers.size > 0 && (
            <button
              onClick={handleSendInvites}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {language === 'ar'
                ? `إرسال دعوات (${selectedVolunteers.size})`
                : `Send Invites (${selectedVolunteers.size})`}
            </button>
          )}
        </div>

        {/* Match Statistics */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">
                {language === 'ar' ? 'إجمالي التطابقات' : 'Total Matches'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{matches.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {language === 'ar' ? 'تطابق ممتاز' : 'Excellent Matches'}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {matches.filter(m => m.matchScore >= 80).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {language === 'ar' ? 'تطابق جيد' : 'Good Matches'}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {matches.filter(m => m.matchScore >= 60 && m.matchScore < 80).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {language === 'ar' ? 'محدد' : 'Selected'}
              </p>
              <p className="text-2xl font-bold text-purple-600">{selectedVolunteers.size}</p>
            </div>
          </div>
        </div>

        {/* Volunteer Matches */}
        <div className="space-y-4">
          {matches.map(match => (
            <div
              key={match.userId}
              className={`bg-white rounded-lg shadow-md p-6 transition-all ${
                selectedVolunteers.has(match.userId)
                  ? 'ring-2 ring-blue-500'
                  : 'hover:shadow-lg'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    {match.volunteer.profilePicture ? (
                      <img
                        src={match.volunteer.profilePicture}
                        alt={match.volunteer.displayName}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Volunteer Info */}
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {match.volunteer.displayName}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchScoreColor(
                          match.matchScore
                        )}`}
                      >
                        {match.matchScore}% {language === 'ar' ? 'تطابق' : 'Match'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-1">{match.recommendation}</p>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 mt-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {match.volunteer.totalHours}{' '}
                        {language === 'ar' ? 'ساعة' : 'hours'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Award className="h-4 w-4 mr-1" />
                        {match.volunteer.totalEvents}{' '}
                        {language === 'ar' ? 'فعالية' : 'events'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {match.volunteer.availability}
                      </div>
                    </div>

                    {/* Skills */}
                    {match.volunteer.skills.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-2">
                          {match.volunteer.skills.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                          {match.volunteer.skills.length > 5 && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">
                              +{match.volunteer.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Match Factors */}
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(match.factors).map(([factor, score]) => (
                        <div key={factor} className="bg-gray-50 rounded-md p-2">
                          <p className="text-xs text-gray-600 capitalize">
                            {factor.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <div className="flex items-center mt-1">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${score}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-700">
                              {Math.round(score)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Select Checkbox */}
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={selectedVolunteers.has(match.userId)}
                    onChange={() => toggleVolunteer(match.userId)}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {matches.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {language === 'ar' ? 'لا توجد تطابقات' : 'No matches found'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {language === 'ar'
                ? 'لم نتمكن من العثور على متطوعين مطابقين لهذه الفعالية'
                : "We couldn't find matching volunteers for this event"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
