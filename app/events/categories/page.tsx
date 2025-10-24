'use client';

import Link from 'next/link';

const categories = [
  'Environment', 'Education', 'Health', 'Community', 
  'Elderly Care', 'Animal Welfare', 'Disaster Relief', 'Sports'
];

export default function EventCategoriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Event Categories</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(cat => (
            <Link key={cat} href={`/events?category=${cat.toLowerCase()}`} 
              className="bg-white rounded-lg shadow-soft p-6 hover:shadow-md transition text-center">
              <div className="w-16 h-16 bg-accent rounded-lg mx-auto mb-3"></div>
              <h3 className="font-semibold text-text-primary">{cat}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
