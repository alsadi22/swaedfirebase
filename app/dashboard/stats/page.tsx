'use client';

export default function DashboardStatsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">My Statistics</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h3 className="text-lg font-semibold mb-4">This Month</h3>
            <p className="text-4xl font-bold text-accent">24h</p>
            <p className="text-sm text-text-secondary mt-2">Volunteer hours</p>
          </div>
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h3 className="text-lg font-semibold mb-4">This Year</h3>
            <p className="text-4xl font-bold text-green-600">156h</p>
            <p className="text-sm text-text-secondary mt-2">Total hours</p>
          </div>
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h3 className="text-lg font-semibold mb-4">All Time</h3>
            <p className="text-4xl font-bold text-blue-600">320h</p>
            <p className="text-sm text-text-secondary mt-2">Lifetime hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}
