'use client';

export default function AdminNotificationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Send Notifications</h1>
        </div>
        <div className="bg-white rounded-lg shadow-soft p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Recipient Type</label>
              <select className="w-full px-4 py-2 border rounded-lg">
                <option>All Users</option>
                <option>Volunteers Only</option>
                <option>Organizations Only</option>
                <option>Students Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input type="text" className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea rows={5} className="w-full px-4 py-2 border rounded-lg"></textarea>
            </div>
            <button className="w-full px-6 py-3 bg-accent text-white rounded-lg">Send Notification</button>
          </div>
        </div>
      </div>
    </div>
  );
}
