'use client';

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Volunteer Resources</h1>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Training Materials</h2>
            <ul className="space-y-2 text-text-secondary">
              <li>• Volunteer Orientation Guide (PDF)</li>
              <li>• Safety Protocols</li>
              <li>• Communication Best Practices</li>
              <li>• Emergency Procedures</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Templates & Forms</h2>
            <ul className="space-y-2 text-text-secondary">
              <li>• Volunteer Application Form</li>
              <li>• Hours Log Template</li>
              <li>• Event Feedback Survey</li>
              <li>• Guardian Consent Form</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Video Tutorials</h2>
            <ul className="space-y-2 text-text-secondary">
              <li>• How to Use the Platform</li>
              <li>• QR Check-in Tutorial</li>
              <li>• Earning Badges Guide</li>
              <li>• Creating Your Profile</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
