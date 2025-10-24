'use client';

export default function OrganizationVolunteersPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Our Volunteers</h1>

        <div className="bg-white rounded-lg shadow-soft p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(vol => (
              <div key={vol} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-accent rounded-full"></div>
                  <div>
                    <p className="font-semibold">Volunteer {vol}</p>
                    <p className="text-sm text-text-secondary">{vol * 15} hours</p>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm">View Profile</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
