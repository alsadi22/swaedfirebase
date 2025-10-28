'use client';

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-4">Join Our Team</h1>
          <p className="text-lg text-text-secondary">
            Help us build the future of volunteering in the UAE
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Platform Engineer', dept: 'Engineering', type: 'Full-time' },
            { title: 'Community Manager', dept: 'Operations', type: 'Full-time' },
            { title: 'UX Designer', dept: 'Design', type: 'Contract' },
            { title: 'Marketing Lead', dept: 'Marketing', type: 'Full-time' }
          ].map((job, index) => (
            <div key={index} className="bg-white rounded-lg shadow-soft p-6">
              <h3 className="text-xl font-bold text-text-primary mb-2">{job.title}</h3>
              <div className="flex gap-3 mb-4">
                <span className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full">
                  {job.dept}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  {job.type}
                </span>
              </div>
              <p className="text-text-secondary mb-4">
                We're looking for talented individuals to join our mission...
              </p>
              <button className="w-full px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
