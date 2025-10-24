'use client';

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Event Calendar</h1>
        <div className="bg-white rounded-lg shadow-soft p-8">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-text-secondary p-2">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, i) => (
              <div key={i} className="aspect-square border border-gray-200 rounded-lg p-2 hover:bg-gray-50">
                <div className="text-sm">{(i % 31) + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
