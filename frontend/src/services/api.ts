import axios from 'axios';
import type {
  ApiCollection,
  ApiEndpoint,
  Flow,
  Execution,
  Environment,
  AIFlowResponse,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Collections & Endpoints
export const apiService = {
  // Import APIs
  importSwagger: (data: { url?: string; json?: any }) =>
    api.post<ApiCollection>('/apis/import/swagger', data).then((res) => res.data),

  importPostman: (data: { url?: string; json?: any }) =>
    api.post<ApiCollection>('/apis/import/postman', data).then((res) => res.data),

  // CRUD for APIs
  getCollections: () =>
    api.get<ApiCollection[]>('/apis/collections').then((res) => res.data),

  getApis: () =>
    api.get<ApiEndpoint[]>('/apis').then((res) => res.data),

  getApi: (id: string) =>
    api.get<ApiEndpoint>(`/apis/${id}`).then((res) => res.data),

  createApi: (data: Partial<ApiEndpoint>) =>
    api.post<ApiEndpoint>('/apis', data).then((res) => res.data),

  updateApi: (id: string, data: Partial<ApiEndpoint>) =>
    api.put<ApiEndpoint>(`/apis/${id}`, data).then((res) => res.data),

  deleteApi: (id: string) =>
    api.delete(`/apis/${id}`).then((res) => res.data),

  deleteCollection: (id: string) =>
    api.delete(`/apis/collections/${id}`).then((res) => res.data),
};

// Flows
export const flowService = {
  getFlows: () =>
    api.get<Flow[]>('/flows').then((res) => res.data),

  getFlow: (id: string) =>
    api.get<Flow>(`/flows/${id}`).then((res) => res.data),

  createFlow: (data: Partial<Flow>) =>
    api.post<Flow>('/flows', data).then((res) => res.data),

  updateFlow: (id: string, data: Partial<Flow>) =>
    api.put<Flow>(`/flows/${id}`, data).then((res) => res.data),

  deleteFlow: (id: string) =>
    api.delete(`/flows/${id}`).then((res) => res.data),

  cloneFlow: (id: string) =>
    api.post<Flow>(`/flows/${id}/clone`).then((res) => res.data),
};

// Executions
export const executionService = {
  runFlow: (flowId: string, environmentId?: string) =>
    api.post<{ executionId: string; status: string }>(`/executions/run/${flowId}`, {
      environmentId,
    }).then((res) => res.data),

  getExecution: (id: string) =>
    api.get<Execution>(`/executions/${id}`).then((res) => res.data),

  getFlowExecutions: (flowId: string) =>
    api.get<Execution[]>(`/executions/flow/${flowId}`).then((res) => res.data),

  getExecutionLogs: (id: string) =>
    api.get(`/executions/${id}/logs`).then((res) => res.data),

  deleteExecution: (id: string) =>
    api.delete(`/executions/${id}`).then((res) => res.data),
};

// Environments
export const environmentService = {
  getEnvironments: () =>
    api.get<Environment[]>('/environments').then((res) => res.data),

  getEnvironment: (id: string) =>
    api.get<Environment>(`/environments/${id}`).then((res) => res.data),

  createEnvironment: (data: Partial<Environment>) =>
    api.post<Environment>('/environments', data).then((res) => res.data),

  updateEnvironment: (id: string, data: Partial<Environment>) =>
    api.put<Environment>(`/environments/${id}`, data).then((res) => res.data),

  deleteEnvironment: (id: string) =>
    api.delete(`/environments/${id}`).then((res) => res.data),
};

// AI Assistant
export const aiService = {
  generateFlow: (data: {
    prompt: string;
    apiCollectionIds?: string[];
    context?: string;
  }) =>
    api.post<AIFlowResponse>('/ai/generate-flow', data).then((res) => res.data),

  analyzeFailure: (executionId: string) =>
    api.post<{ analysis: string }>('/ai/analyze-failure', { executionId }).then((res) => res.data),

  suggestAssertions: (data: { stepConfig: any; apiId?: string }) =>
    api.post<{ assertions: any[] }>('/ai/suggest-assertions', data).then((res) => res.data),

  generateTestData: (apiId: string, scenario: 'positive' | 'negative' | 'edge') =>
    api.post<{ testData: any }>('/ai/generate-test-data', { apiId, scenario }).then((res) => res.data),
};

export default api;
