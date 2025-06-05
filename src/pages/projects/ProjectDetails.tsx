import React from 'react';
import { useParams } from 'react-router-dom';

const ProjectDetails = () => {
  const { projectId } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">Project Details</h1>
        
        <div className="grid gap-6">
          {/* Project Info Section */}
          <section className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Project Information</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Project ID</label>
                <p className="mt-1 text-gray-900">{projectId}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">
                  <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Statistics Section */}
          <section className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Commits</p>
                <p className="text-2xl font-semibold">0</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Active Branches</p>
                <p className="text-2xl font-semibold">0</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Contributors</p>
                <p className="text-2xl font-semibold">0</p>
              </div>
            </div>
          </section>

          {/* Recent Activity Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <p className="text-gray-600 italic">No recent activity</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;