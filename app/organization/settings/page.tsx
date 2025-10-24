'use client';

export default function OrganizationSettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Organization Settings</h1>

        <div className="bg-white rounded-lg shadow-soft p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Organization Name</label>
            <input type="text" className="w-full px-4 py-2 border rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea rows={4} className="w-full px-4 py-2 border rounded-lg"></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input type="email" className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input type="tel" className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>

          <button className="w-full px-6 py-3 bg-accent text-white rounded-lg">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
