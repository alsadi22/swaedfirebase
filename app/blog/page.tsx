'use client';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Blog</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(post => (
            <div key={post} className="bg-white rounded-lg shadow-soft overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500"></div>
              <div className="p-6">
                <span className="text-xs text-purple-600 font-medium">Volunteer Tips</span>
                <h3 className="font-bold text-text-primary mt-2 mb-2">
                  Blog Post Title {post}
                </h3>
                <p className="text-sm text-text-secondary mb-4">
                  Tips and advice for effective volunteering...
                </p>
                <button className="text-accent hover:text-accent-hover font-medium text-sm">
                  Read Article →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
