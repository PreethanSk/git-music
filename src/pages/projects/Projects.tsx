import React from 'react';

function Projects() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Projects</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Project cards will be mapped here */}
            <div className="bg-white border rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-2">Loading projects...</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Projects;