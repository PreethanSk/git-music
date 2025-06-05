import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FolderIcon, ClockIcon } from '@heroicons/react/24/outline';

interface DashboardStats {
  totalProjects: number;
  totalCommits: number;
  recentProjects: Project[];
  recentCommits: Commit[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastCommit?: {
    id: string;
    name: string;
    createdAt: string;
  };
}

interface Commit {
  id: string;
  name: string;
  createdAt: string;
  project: {
    name: string;
  };
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const [projectsRes, commitsRes] = await Promise.all([
        axios.get('/api/dashboardProjects'),
        axios.get('/api/dashboardCommits'),
      ]);
      
      return {
        totalProjects: projectsRes.data.projects.length,
        totalCommits: commitsRes.data.commits.length,
        recentProjects: projectsRes.data.projects.slice(0, 5),
        recentCommits: commitsRes.data.commits.slice(0, 5),
      };
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Projects</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{stats?.totalProjects || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/projects" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all projects
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Commits</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{stats?.totalCommits || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/commits" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all commits
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Projects</h3>
          </div>
          <div className="border-t border-gray-200">
            <ul role="list" className="divide-y divide-gray-200">
              {stats?.recentProjects.map((project) => (
                <li key={project.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <Link to={`/projects/${project.id}`} className="block">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">{project.name}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {project.description || 'No description'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Last updated:{' '}
                          {new Date(project.lastCommit?.createdAt || project.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Commits</h3>
          </div>
          <div className="border-t border-gray-200">
            <ul role="list" className="divide-y divide-gray-200">
              {stats?.recentCommits.map((commit) => (
                <li key={commit.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">{commit.name}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="text-sm text-gray-500">{commit.project.name}</p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>{new Date(commit.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}