'use client';

export default function AdminBadgesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Badge Management</h1>
          <button className="px-4 py-2 bg-accent text-white rounded-lg">Create Badge</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(badge => (
            <div key={badge} className="bg-white rounded-lg shadow-soft p-6 text-center">
              <div className="w-20 h-20 bg-accent rounded-full mx-auto mb-3 text-3xl flex items-center justify-center text-white">🏆</div>
              <h3 className="font-bold">Badge {badge}</h3>
              <p className="text-sm text-text-secondary mt-1">50 hours required</p>
              <button className="mt-4 px-4 py-2 bg-gray-100 rounded-lg w-full">Edit</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
