'use client';

export default function LatestPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Latest Events</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(item => (
            <div key={item} className="bg-white rounded-lg shadow-soft p-6">
              <span className="text-xs text-green-600 font-medium">New</span>
              <h3 className="font-bold text-text-primary mt-2 mb-1">Latest Event {item}</h3>
              <p className="text-sm text-text-secondary mb-3">Posted 2 hours ago</p>
              <button className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm">View</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
