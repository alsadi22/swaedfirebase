'use client';

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Community Impact Stories</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(story => (
            <div key={story} className="bg-white rounded-lg shadow-soft overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600"></div>
              <div className="p-6">
                <h3 className="font-bold text-text-primary mb-2">Impact Story {story}</h3>
                <p className="text-text-secondary text-sm mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  Volunteers made a significant difference in the community.
                </p>
                <button className="text-accent hover:text-accent-hover font-medium">
                  Read More →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
