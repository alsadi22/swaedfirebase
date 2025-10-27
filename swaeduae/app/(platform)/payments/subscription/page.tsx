'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  getOrganizationSubscription,
  createSubscription,
  cancelSubscription,
  upgradeSubscription,
} from '@/lib/services/payments';
import type { Subscription, SubscriptionTier } from '@/types';
import { Check, X, Crown, Zap, Star, Building } from 'lucide-react';

const SUBSCRIPTION_PLANS = [
  {
    tier: 'FREE' as SubscriptionTier,
    name: 'Free',
    nameAr: 'مجاني',
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Star,
    features: [
      { text: 'Create up to 5 events per month', textAr: 'إنشاء ما يصل إلى 5 فعاليات شهرياً', included: true },
      { text: 'Basic analytics', textAr: 'تحليلات أساسية', included: true },
      { text: 'Email support', textAr: 'دعم البريد الإلكتروني', included: true },
      { text: 'Advanced analytics', textAr: 'تحليلات متقدمة', included: false },
      { text: 'Volunteer matching', textAr: 'مطابقة المتطوعين', included: false },
      { text: 'Team collaboration', textAr: 'التعاون الجماعي', included: false },
    ],
  },
  {
    tier: 'BASIC' as SubscriptionTier,
    name: 'Basic',
    nameAr: 'أساسي',
    monthlyPrice: 99,
    yearlyPrice: 990,
    icon: Zap,
    features: [
      { text: 'Create up to 20 events per month', textAr: 'إنشاء ما يصل إلى 20 فعالية شهرياً', included: true },
      { text: 'Advanced analytics', textAr: 'تحليلات متقدمة', included: true },
      { text: 'Priority listing', textAr: 'قائمة أولوية', included: true },
      { text: 'Email support', textAr: 'دعم البريد الإلكتروني', included: true },
      { text: 'Volunteer matching suggestions', textAr: 'اقتراحات مطابقة المتطوعين', included: true },
      { text: 'AI-powered matching', textAr: 'مطابقة مدعومة بالذكاء الاصطناعي', included: false },
    ],
    popular: false,
  },
  {
    tier: 'PRO' as SubscriptionTier,
    name: 'Pro',
    nameAr: 'احترافي',
    monthlyPrice: 249,
    yearlyPrice: 2490,
    icon: Crown,
    features: [
      { text: 'Unlimited events', textAr: 'فعاليات غير محدودة', included: true },
      { text: 'Advanced analytics with exports', textAr: 'تحليلات متقدمة مع التصدير', included: true },
      { text: 'Top priority listing', textAr: 'قائمة أولوية عليا', included: true },
      { text: 'Phone + email support', textAr: 'دعم الهاتف والبريد الإلكتروني', included: true },
      { text: 'AI-powered volunteer matching', textAr: 'مطابقة المتطوعين بالذكاء الاصطناعي', included: true },
      { text: 'Team collaboration tools', textAr: 'أدوات التعاون الجماعي', included: true },
      { text: 'Custom reports', textAr: 'تقارير مخصصة', included: true },
    ],
    popular: true,
  },
  {
    tier: 'ENTERPRISE' as SubscriptionTier,
    name: 'Enterprise',
    nameAr: 'مؤسسي',
    monthlyPrice: 499,
    yearlyPrice: 4990,
    icon: Building,
    features: [
      { text: 'Everything in Pro', textAr: 'كل ما في الاحترافي', included: true },
      { text: 'Dedicated account manager', textAr: 'مدير حساب مخصص', included: true },
      { text: 'Custom integrations', textAr: 'تكاملات مخصصة', included: true },
      { text: 'White-label options', textAr: 'خيارات العلامة البيضاء', included: true },
      { text: 'API access', textAr: 'الوصول إلى واجهة برمجة التطبيقات', included: true },
      { text: 'Advanced security features', textAr: 'ميزات أمان متقدمة', included: true },
    ],
    popular: false,
  },
];

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      if (user?.organizationId) {
        const sub = await getOrganizationSubscription(user.organizationId);
        setCurrentSubscription(sub);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (!user?.organizationId) return;
    
    if (tier === 'FREE') {
      alert(language === 'ar' ? 'أنت بالفعل في الخطة المجانية' : 'You are already on the free plan');
      return;
    }

    try {
      setProcessing(true);
      const { clientSecret } = await createSubscription(
        user.organizationId,
        tier,
        billingCycle
      );
      
      // Here you would integrate Stripe Elements to process payment
      // For now, just show success message
      alert(
        language === 'ar'
          ? `تمت الترقية إلى ${SUBSCRIPTION_PLANS.find(p => p.tier === tier)?.nameAr}`
          : `Upgraded to ${SUBSCRIPTION_PLANS.find(p => p.tier === tier)?.name}`
      );
      
      await loadSubscription();
    } catch (error) {
      console.error('Error subscribing:', error);
      alert(language === 'ar' ? 'فشل الاشتراك' : 'Subscription failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;
    
    const confirmed = window.confirm(
      language === 'ar'
        ? 'هل أنت متأكد من إلغاء اشتراكك؟'
        : 'Are you sure you want to cancel your subscription?'
    );
    
    if (!confirmed) return;

    try {
      setProcessing(true);
      await cancelSubscription(currentSubscription.id);
      alert(
        language === 'ar'
          ? 'سيتم إلغاء اشتراكك في نهاية الفترة الحالية'
          : 'Your subscription will be cancelled at the end of the current period'
      );
      await loadSubscription();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert(language === 'ar' ? 'فشل الإلغاء' : 'Cancellation failed');
    } finally {
      setProcessing(false);
    }
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            {language === 'ar' ? 'خطط الاشتراك' : 'Subscription Plans'}
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            {language === 'ar'
              ? 'اختر الخطة المثالية لمنظمتك'
              : 'Choose the perfect plan for your organization'}
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 flex justify-center items-center space-x-4">
            <span className={`text-sm ${billingCycle === 'MONTHLY' ? 'font-semibold' : 'text-gray-600'}`}>
              {language === 'ar' ? 'شهري' : 'Monthly'}
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingCycle === 'YEARLY' ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'YEARLY' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${billingCycle === 'YEARLY' ? 'font-semibold' : 'text-gray-600'}`}>
              {language === 'ar' ? 'سنوي' : 'Yearly'}
            </span>
            {billingCycle === 'YEARLY' && (
              <span className="text-sm text-green-600 font-medium">
                {language === 'ar' ? 'وفر 17%' : 'Save 17%'}
              </span>
            )}
          </div>
        </div>

        {/* Current Subscription Banner */}
        {currentSubscription && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800">
                  {language === 'ar' ? 'خطتك الحالية' : 'Your Current Plan'}
                </p>
                <p className="text-lg font-semibold text-blue-900">
                  {SUBSCRIPTION_PLANS.find(p => p.tier === currentSubscription.tier)?.name}
                </p>
              </div>
              {currentSubscription.cancelAtPeriodEnd && (
                <span className="text-sm text-orange-600">
                  {language === 'ar' ? 'ينتهي في نهاية الفترة' : 'Ends at period end'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SUBSCRIPTION_PLANS.map(plan => {
            const Icon = plan.icon;
            const price = billingCycle === 'MONTHLY' ? plan.monthlyPrice : plan.yearlyPrice;
            const isCurrentPlan = currentSubscription?.tier === plan.tier;

            return (
              <div
                key={plan.tier}
                className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                  plan.popular ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                    {language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <Icon className="h-12 w-12 text-blue-600" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-center text-gray-900">
                    {language === 'ar' ? plan.nameAr : plan.name}
                  </h3>
                  
                  <div className="mt-4 text-center">
                    <span className="text-4xl font-bold text-gray-900">{price}</span>
                    <span className="text-gray-600"> AED</span>
                    <p className="text-sm text-gray-600 mt-1">
                      {billingCycle === 'MONTHLY'
                        ? language === 'ar' ? 'شهرياً' : 'per month'
                        : language === 'ar' ? 'سنوياً' : 'per year'}
                    </p>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        )}
                        <span className={`ml-3 text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                          {language === 'ar' ? feature.textAr : feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.tier)}
                    disabled={processing || isCurrentPlan || plan.tier === 'FREE'}
                    className={`mt-8 w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                      isCurrentPlan
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-800 text-white hover:bg-gray-900'
                    }`}
                  >
                    {isCurrentPlan
                      ? language === 'ar' ? 'الخطة الحالية' : 'Current Plan'
                      : plan.tier === 'FREE'
                      ? language === 'ar' ? 'مجاني' : 'Free'
                      : language === 'ar' ? 'اشتراك' : 'Subscribe'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cancel Subscription */}
        {currentSubscription && currentSubscription.tier !== 'FREE' && !currentSubscription.cancelAtPeriodEnd && (
          <div className="mt-12 text-center">
            <button
              onClick={handleCancelSubscription}
              disabled={processing}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              {language === 'ar' ? 'إلغاء الاشتراك' : 'Cancel Subscription'}
            </button>
          </div>
        )}

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            {language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <details className="bg-white rounded-lg shadow p-6">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                {language === 'ar' ? 'هل يمكنني تغيير خطتي لاحقاً؟' : 'Can I change my plan later?'}
              </summary>
              <p className="mt-2 text-gray-600">
                {language === 'ar'
                  ? 'نعم، يمكنك الترقية أو الإلغاء في أي وقت. ستظل الترقيات سارية على الفور.'
                  : 'Yes, you can upgrade or cancel at any time. Upgrades take effect immediately.'}
              </p>
            </details>
            
            <details className="bg-white rounded-lg shadow p-6">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                {language === 'ar' ? 'ما هي طرق الدفع المقبولة؟' : 'What payment methods are accepted?'}
              </summary>
              <p className="mt-2 text-gray-600">
                {language === 'ar'
                  ? 'نقبل جميع بطاقات الائتمان والخصم الرئيسية من خلال Stripe.'
                  : 'We accept all major credit and debit cards through Stripe.'}
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
