'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Settings {
  site_name: string;
  contact_email: string;
  support_phone: string;
  min_volunteer_age: number;
  max_event_capacity: number;
  hours_per_credit: number;
  qr_check_in_enabled: boolean;
  email_notifications_enabled: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Partial<Settings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert(settings);

      if (error) throw error;
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">System Settings</h1>

        <div className="bg-white rounded-lg shadow-soft p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Site Name
            </label>
            <input
              type="text"
              value={settings.site_name || ''}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.contact_email || ''}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Support Phone
              </label>
              <input
                type="tel"
                value={settings.support_phone || ''}
                onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Min Volunteer Age
              </label>
              <input
                type="number"
                value={settings.min_volunteer_age || 12}
                onChange={(e) => setSettings({ ...settings, min_volunteer_age: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Max Event Capacity
              </label>
              <input
                type="number"
                value={settings.max_event_capacity || 1000}
                onChange={(e) => setSettings({ ...settings, max_event_capacity: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Hours per Academic Credit
              </label>
              <input
                type="number"
                value={settings.hours_per_credit || 10}
                onChange={(e) => setSettings({ ...settings, hours_per_credit: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.qr_check_in_enabled || false}
                onChange={(e) => setSettings({ ...settings, qr_check_in_enabled: e.target.checked })}
                className="mr-2"
              />
              <span className="text-text-primary">Enable QR Check-in</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.email_notifications_enabled || false}
                onChange={(e) => setSettings({ ...settings, email_notifications_enabled: e.target.checked })}
                className="mr-2"
              />
              <span className="text-text-primary">Enable Email Notifications</span>
            </label>
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
