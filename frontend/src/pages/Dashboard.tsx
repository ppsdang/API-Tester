import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiService, flowService, executionService } from '../services/api';
import {
  Globe,
  Workflow,
  Play,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

export default function Dashboard() {
  const { data: collections } = useQuery({
    queryKey: ['collections'],
    queryFn: apiService.getCollections,
  });

  const { data: flows } = useQuery({
    queryKey: ['flows'],
    queryFn: flowService.getFlows,
  });

  // Calculate stats
  const totalApis = collections?.reduce((sum, col) => sum + col.apis.length, 0) || 0;
  const totalFlows = flows?.length || 0;
  const activeFlows = flows?.filter((f) => f.isActive).length || 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your API testing workspace</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total APIs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalApis}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Globe className="text-blue-600" size={24} />
            </div>
          </div>
          <Link
            to="/apis"
            className="text-sm text-primary-600 hover:text-primary-700 mt-4 inline-block"
          >
            View all APIs →
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Flows</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalFlows}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Workflow className="text-purple-600" size={24} />
            </div>
          </div>
          <Link
            to="/flows"
            className="text-sm text-primary-600 hover:text-primary-700 mt-4 inline-block"
          >
            View all flows →
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Flows</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{activeFlows}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Play className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Flows */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Flows</h2>
          <Link to="/flows/new" className="btn btn-primary text-sm">
            Create Flow
          </Link>
        </div>

        {flows && flows.length > 0 ? (
          <div className="space-y-3">
            {flows.slice(0, 5).map((flow) => (
              <Link
                key={flow.id}
                to={`/flows/${flow.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{flow.name}</h3>
                    {flow.description && (
                      <p className="text-sm text-gray-500 mt-1">{flow.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {flow.steps?.length || 0} steps
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {flow.isActive ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Workflow className="mx-auto text-gray-300" size={48} />
            <p className="text-gray-500 mt-4">No flows yet</p>
            <Link to="/flows/new" className="btn btn-primary mt-4">
              Create your first flow
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
