'use client';

export default function OrganizationTeamPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Team Management</h1>
          <button className="px-4 py-2 bg-accent text-white rounded-lg">Invite Member</button>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-8">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map(member => (
                <tr key={member} className="border-t border-gray-200">
                  <td className="px-6 py-4">Team Member {member}</td>
                  <td className="px-6 py-4">Admin</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span></td>
                  <td className="px-6 py-4"><button className="text-accent">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
