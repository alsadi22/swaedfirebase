'use client';

export default function FeaturedPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Featured Events</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(item => (
            <div key={item} className="bg-white rounded-lg shadow-soft overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-accent to-orange-500"></div>
              <div className="p-6">
                <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">Featured</span>
                <h3 className="font-bold text-text-primary mt-3 mb-2">Featured Event {item}</h3>
                <p className="text-sm text-text-secondary mb-4">High-impact community event</p>
                <button className="w-full px-4 py-2 bg-accent text-white rounded-lg">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
