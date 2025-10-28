'use client';

export default function VolunteerOpportunitiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Volunteer Opportunities</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(opp => (
            <div key={opp} className="bg-white rounded-lg shadow-soft p-6">
              <h3 className="font-bold text-text-primary mb-2">Opportunity {opp}</h3>
              <p className="text-sm text-text-secondary mb-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-accent font-medium">Dubai</span>
                <span className="text-text-secondary">5-10 hours</span>
              </div>
              <button className="mt-4 w-full px-4 py-2 bg-accent text-white rounded-lg">Learn More</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
