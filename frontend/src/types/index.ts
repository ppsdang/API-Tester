// Core types for the frontend

export interface ApiEndpoint {
  id: string;
  name: string;
  description?: string;
  method: string;
  path: string;
  headers?: any;
  queryParams?: any;
  pathParams?: any;
  requestBody?: any;
  responseSchema?: any;
  exampleRequest?: any;
  exampleResponse?: any;
  collectionId?: string;
  collection?: ApiCollection;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCollection {
  id: string;
  name: string;
  description?: string;
  source: 'swagger' | 'postman' | 'manual';
  sourceUrl?: string;
  rawData?: any;
  apis: ApiEndpoint[];
  createdAt: string;
  updatedAt: string;
}

export interface Flow {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  steps: FlowStep[];
  executions?: Execution[];
  createdAt: string;
  updatedAt: string;
}

export interface FlowStep {
  id: string;
  stepOrder: number;
  name?: string;
  description?: string;
  apiId?: string;
  api?: ApiEndpoint;
  method?: string;
  url?: string;
  headers?: any;
  queryParams?: any;
  pathParams?: any;
  requestBody?: any;
  extractVariables?: VariableExtraction[];
  assertions?: Assertion[];
  condition?: string;
  flowId: string;
  createdAt: string;
  updatedAt: string;
}

export interface VariableExtraction {
  name: string;
  jsonPath: string;
  defaultValue?: any;
}

export interface Assertion {
  type: 'status' | 'jsonPath' | 'responseTime' | 'header' | 'custom';
  expected: any;
  operator?: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'exists' | 'notExists';
  path?: string;
  message?: string;
}

export interface Execution {
  id: string;
  flowId: string;
  flow?: Flow;
  status: 'running' | 'passed' | 'failed' | 'error';
  startedAt: string;
  completedAt?: string;
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  errorMessage?: string;
  environmentId?: string;
  environment?: Environment;
  logs?: ExecutionLog[];
  variables?: ExecutionVariable[];
}

export interface ExecutionLog {
  id: string;
  stepOrder: number;
  stepName?: string;
  status: 'passed' | 'failed' | 'error' | 'skipped';
  requestMethod?: string;
  requestUrl?: string;
  requestHeaders?: any;
  requestBody?: any;
  responseStatus?: number;
  responseHeaders?: any;
  responseBody?: any;
  responseTime?: number;
  assertionResults?: AssertionResult[];
  errorMessage?: string;
  errorStack?: string;
  executedAt: string;
}

export interface AssertionResult {
  assertion: Assertion;
  passed: boolean;
  message: string;
  actual?: any;
  expected?: any;
}

export interface ExecutionVariable {
  id: string;
  name: string;
  value: string;
  executionId: string;
  createdAt: string;
}

export interface Environment {
  id: string;
  name: string;
  description?: string;
  baseUrl?: string;
  variables?: Record<string, any>;
  headers?: Record<string, any>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIFlowResponse {
  flow: {
    name: string;
    description: string;
    steps: Omit<FlowStep, 'id' | 'flowId' | 'createdAt' | 'updatedAt'>[];
  };
  reasoning: string;
}
