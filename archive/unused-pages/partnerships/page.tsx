'use client';

export default function PartnershipsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-4">Our Partners</h1>
        <p className="text-text-secondary mb-8">
          Working together to build a stronger volunteer community in the UAE
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(partner => (
            <div key={partner} className="bg-white rounded-lg shadow-soft p-6 flex items-center justify-center">
              <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>

        <div className="bg-accent/10 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Become a Partner</h2>
          <p className="text-text-secondary mb-6">
            Join our network of organizations making a difference in the UAE
          </p>
          <button className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
}
