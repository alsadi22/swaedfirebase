'use client';

export default function SavedEventsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Saved Events</h1>

        <div className="text-center py-12 bg-white rounded-lg shadow-soft">
          <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <p className="text-text-secondary mb-4">No saved events yet</p>
          <p className="text-sm text-text-secondary mb-6">
            Save events you are interested in to view them later
          </p>
        </div>
      </div>
    </div>
  );
}
