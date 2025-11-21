import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { flowService, executionService } from '../services/api';
import { Plus, Play, Trash2, Copy, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useState } from 'react';

export default function FlowList() {
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: flows, isLoading } = useQuery({
    queryKey: ['flows'],
    queryFn: flowService.getFlows,
  });

  const deleteMutation = useMutation({
    mutationFn: flowService.deleteFlow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
    },
  });

  const cloneMutation = useMutation({
    mutationFn: flowService.cloneFlow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
    },
  });

  const runMutation = useMutation({
    mutationFn: ({ flowId, environmentId }: { flowId: string; environmentId?: string }) =>
      executionService.runFlow(flowId, environmentId),
    onSuccess: (data, variables) => {
      alert(`Flow execution started! Execution ID: ${data.executionId}`);
      queryClient.invalidateQueries({ queryKey: ['flows'] });
    },
  });

  const getStatusIcon = (flow: any) => {
    if (!flow.executions || flow.executions.length === 0) return null;

    const lastExecution = flow.executions[0];
    switch (lastExecution.status) {
      case 'passed':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'failed':
        return <XCircle className="text-red-600" size={16} />;
      case 'running':
        return <Clock className="text-blue-600" size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Flows</h1>
          <p className="text-gray-500 mt-1">Manage your API test flows</p>
        </div>
        <Link to="/flows/new" className="btn btn-primary flex items-center gap-2">
          <Plus size={18} />
          Create Flow
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : flows && flows.length > 0 ? (
        <div className="space-y-4">
          {flows.map((flow) => (
            <div key={flow.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      to={`/flows/${flow.id}`}
                      className="text-xl font-semibold text-gray-900 hover:text-primary-600"
                    >
                      {flow.name}
                    </Link>
                    {getStatusIcon(flow)}
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

                  {flow.description && (
                    <p className="text-gray-600 mb-3">{flow.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{flow.steps?.length || 0} steps</span>
                    {flow._count?.executions !== undefined && (
                      <span>{flow._count.executions} executions</span>
                    )}
                    <span>Updated {new Date(flow.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => runMutation.mutate({ flowId: flow.id })}
                    disabled={runMutation.isPending}
                    className="btn btn-primary flex items-center gap-2"
                    title="Run flow"
                  >
                    <Play size={16} />
                    Run
                  </button>

                  <button
                    onClick={() => cloneMutation.mutate(flow.id)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                    title="Clone flow"
                  >
                    <Copy size={18} />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this flow?')) {
                        deleteMutation.mutate(flow.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Delete flow"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Play className="mx-auto text-gray-300" size={48} />
          <p className="text-gray-500 mt-4">No flows yet</p>
          <Link to="/flows/new" className="btn btn-primary mt-4">
            Create your first flow
          </Link>
        </div>
      )}
    </div>
  );
}
