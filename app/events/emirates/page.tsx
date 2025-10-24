'use client';

import Link from 'next/link';

const emirates = [
  'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman',
  'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'
];

export default function EventEmiratesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Events by Emirate</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {emirates.map(emirate => (
            <Link key={emirate} href={`/events?emirate=${emirate}`}
              className="bg-white rounded-lg shadow-soft p-8 hover:shadow-md transition">
              <h3 className="text-xl font-bold text-text-primary mb-2">{emirate}</h3>
              <p className="text-text-secondary">View events in {emirate}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
