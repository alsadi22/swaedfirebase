'use client';

export default function TrendingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Trending Events</h1>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(item => (
            <div key={item} className="bg-white rounded-lg shadow-soft p-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-text-primary">Trending Event {item}</h3>
                <p className="text-sm text-text-secondary mt-1">500+ volunteers registered</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-accent">#{item}</p>
                <p className="text-xs text-text-secondary">Trending</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
