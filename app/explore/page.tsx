'use client';

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Explore</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-soft p-6 text-center">
            <h3 className="font-bold mb-2">Trending Events</h3>
            <p className="text-3xl text-accent">42</p>
          </div>
          <div className="bg-white rounded-lg shadow-soft p-6 text-center">
            <h3 className="font-bold mb-2">New Organizations</h3>
            <p className="text-3xl text-green-600">12</p>
          </div>
          <div className="bg-white rounded-lg shadow-soft p-6 text-center">
            <h3 className="font-bold mb-2">Featured</h3>
            <p className="text-3xl text-blue-600">8</p>
          </div>
          <div className="bg-white rounded-lg shadow-soft p-6 text-center">
            <h3 className="font-bold mb-2">Latest</h3>
            <p className="text-3xl text-purple-600">23</p>
          </div>
        </div>
      </div>
    </div>
  );
}
