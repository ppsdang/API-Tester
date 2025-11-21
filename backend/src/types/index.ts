// Core types for the application

export interface ApiEndpoint {
  id?: string;
  name: string;
  description?: string;
  method: string;
  path: string;
  headers?: Record<string, any>;
  queryParams?: Record<string, any>;
  pathParams?: Record<string, any>;
  requestBody?: any;
  responseSchema?: any;
  exampleRequest?: any;
  exampleResponse?: any;
}

export interface FlowStepConfig {
  id?: string;
  stepOrder: number;
  name?: string;
  description?: string;
  apiId?: string;
  method?: string;
  url?: string;
  headers?: Record<string, any>;
  queryParams?: Record<string, any>;
  pathParams?: Record<string, any>;
  requestBody?: any;
  extractVariables?: VariableExtraction[];
  assertions?: Assertion[];
  condition?: string;
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

export interface ExecutionContext {
  variables: Record<string, any>;
  environment?: {
    baseUrl?: string;
    variables?: Record<string, any>;
    headers?: Record<string, any>;
  };
}

export interface ExecutionResult {
  stepOrder: number;
  stepName?: string;
  status: 'passed' | 'failed' | 'error' | 'skipped';
  request: {
    method: string;
    url: string;
    headers?: Record<string, any>;
    body?: any;
  };
  response?: {
    status: number;
    headers?: Record<string, any>;
    body?: any;
    time: number;
  };
  assertionResults?: AssertionResult[];
  extractedVariables?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
  };
}

export interface AssertionResult {
  assertion: Assertion;
  passed: boolean;
  message: string;
  actual?: any;
  expected?: any;
}

export interface FlowExecutionSummary {
  executionId: string;
  flowId: string;
  status: 'running' | 'passed' | 'failed' | 'error';
  startedAt: Date;
  completedAt?: Date;
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  results: ExecutionResult[];
}

export interface ParsedApiCollection {
  name: string;
  description?: string;
  endpoints: ApiEndpoint[];
}

export interface AIFlowRequest {
  prompt: string;
  apiCollections?: string[];
  context?: string;
}

export interface AIFlowResponse {
  flow: {
    name: string;
    description: string;
    steps: FlowStepConfig[];
  };
  reasoning: string;
}
