'use client';

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">News & Updates</h1>
        
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map(news => (
            <div key={news} className="bg-white rounded-lg shadow-soft p-6 flex gap-6">
              <div className="w-48 h-32 bg-accent rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <span className="text-xs text-accent font-medium">October 25, 2025</span>
                <h2 className="text-xl font-bold text-text-primary mt-2 mb-3">
                  Breaking News: UAE Volunteer Initiative Reaches Milestone
                </h2>
                <p className="text-text-secondary mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
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
