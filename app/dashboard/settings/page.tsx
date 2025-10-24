'use client';

export default function DashboardSettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Account Settings</h1>
        <div className="bg-white rounded-lg shadow-soft p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
            <label className="flex items-center mb-2">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span>Email notifications</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span>Push notifications</span>
            </label>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4">Privacy</h2>
            <label className="flex items-center mb-2">
              <input type="checkbox" className="mr-2" />
              <span>Show profile publicly</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Allow organizations to contact me</span>
            </label>
          </div>
          <button className="w-full px-6 py-3 bg-accent text-white rounded-lg">Save Settings</button>
        </div>
      </div>
    </div>
  );
}
