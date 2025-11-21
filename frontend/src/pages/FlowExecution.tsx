import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { executionService } from '../services/api';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function FlowExecution() {
  const { executionId } = useParams();

  const { data: execution, isLoading } = useQuery({
    queryKey: ['execution', executionId],
    queryFn: () => executionService.getExecution(executionId!),
    enabled: !!executionId,
    refetchInterval: (data) => (data?.status === 'running' ? 2000 : false),
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">Loading execution...</div>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-red-500">Execution not found</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'running':
        return 'text-blue-600 bg-blue-50';
      case 'error':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Execution Details</h1>
        <p className="text-gray-500 mt-1">{execution.flow?.name}</p>
      </div>

      {/* Summary */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Execution Summary</h2>
          <span
            className={`px-3 py-1 rounded-full font-medium capitalize ${getStatusColor(
              execution.status
            )}`}
          >
            {execution.status}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Steps</p>
            <p className="text-2xl font-bold text-gray-900">{execution.totalSteps}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Passed</p>
            <p className="text-2xl font-bold text-green-600">{execution.passedSteps}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Failed</p>
            <p className="text-2xl font-bold text-red-600">{execution.failedSteps}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="text-2xl font-bold text-gray-900">
              {execution.completedAt
                ? `${Math.round(
                    (new Date(execution.completedAt).getTime() -
                      new Date(execution.startedAt).getTime()) /
                      1000
                  )}s`
                : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Step Logs</h2>

        {execution.logs && execution.logs.length > 0 ? (
          <div className="space-y-4">
            {execution.logs.map((log) => (
              <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold">
                      {log.stepOrder + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{log.stepName || 'Unnamed Step'}</h3>
                      <p className="text-sm text-gray-500">
                        {log.requestMethod} {log.requestUrl}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.status === 'passed' && <CheckCircle className="text-green-600" size={20} />}
                    {log.status === 'failed' && <XCircle className="text-red-600" size={20} />}
                    {log.status === 'error' && <AlertCircle className="text-orange-600" size={20} />}
                    <span
                      className={`px-2 py-1 text-xs rounded capitalize ${getStatusColor(
                        log.status
                      )}`}
                    >
                      {log.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Request</p>
                    <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(
                        {
                          headers: log.requestHeaders,
                          body: log.requestBody,
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">
                      Response {log.responseStatus && `(${log.responseStatus})`} - {log.responseTime}ms
                    </p>
                    <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(log.responseBody, null, 2)}
                    </pre>
                  </div>
                </div>

                {log.errorMessage && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800 font-medium">Error:</p>
                    <p className="text-sm text-red-700 mt-1">{log.errorMessage}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No logs available</p>
        )}
      </div>
    </div>
  );
}
