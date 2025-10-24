'use client';

export default function DashboardRewardsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Rewards & Recognition</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(reward => (
            <div key={reward} className="bg-white rounded-lg shadow-soft p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-accent rounded-full"></div>
                <div>
                  <h3 className="font-bold">Reward {reward}</h3>
                  <p className="text-sm text-text-secondary">Earned 3 days ago</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
