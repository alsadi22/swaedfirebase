'use client';

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Volunteer Leaderboard</h1>
        
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold">Top Volunteers This Month</h2>
          <p className="mt-2 opacity-90">Recognize our community heroes</p>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-8">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(rank => (
              <div key={rank} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                    rank === 1 ? 'bg-yellow-500' :
                    rank === 2 ? 'bg-gray-400' :
                    rank === 3 ? 'bg-amber-600' : 'bg-gray-300'
                  }`}>
                    {rank}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">Volunteer {rank}</p>
                    <p className="text-sm text-text-secondary">{rank * 12} hours this month</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent">{rank * 5} badges</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
