'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Search Results</h1>

        <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search events, organizations, volunteers..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
          />
          <div className="flex gap-2 mt-4">
            {['all', 'events', 'organizations', 'volunteers'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  filter === f ? 'bg-accent text-white' : 'bg-gray-200 text-text-primary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center py-12">
          <p className="text-text-secondary">Enter a search term to find results</p>
        </div>
      </div>
    </div>
  );
}
