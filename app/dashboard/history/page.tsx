'use client';

export default function DashboardHistoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Activity History</h1>
        <div className="bg-white rounded-lg shadow-soft p-8">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(item => (
              <div key={item} className="flex items-start gap-4 pb-4 border-b border-gray-200">
                <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium">Completed event: Beach Cleanup</p>
                  <p className="text-sm text-text-secondary">5 hours logged • 2 days ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
