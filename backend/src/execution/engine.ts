import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { JSONPath } from 'jsonpath-plus';
import {
  FlowStepConfig,
  ExecutionContext,
  ExecutionResult,
  Assertion,
  AssertionResult,
  VariableExtraction,
} from '../types';

/**
 * Flow Execution Engine
 * Executes API flow steps with variable extraction and assertions
 */
export class FlowExecutionEngine {
  /**
   * Execute a single flow step
   */
  static async executeStep(
    step: FlowStepConfig,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      // Check if step should be skipped based on condition
      if (step.condition && !this.evaluateCondition(step.condition, context)) {
        return {
          stepOrder: step.stepOrder,
          stepName: step.name,
          status: 'skipped',
          request: {
            method: step.method || 'GET',
            url: step.url || '',
          },
        };
      }

      // Prepare request
      const request = this.prepareRequest(step, context);

      // Execute HTTP request
      let response: AxiosResponse;
      try {
        response = await axios(request);
      } catch (error: any) {
        if (error.response) {
          // Server responded with error status
          response = error.response;
        } else {
          // Network error or timeout
          throw error;
        }
      }

      const responseTime = Date.now() - startTime;

      // Extract variables from response
      const extractedVariables = this.extractVariables(
        step.extractVariables || [],
        response,
        context
      );

      // Update context with extracted variables
      Object.assign(context.variables, extractedVariables);

      // Validate assertions
      const assertionResults = this.validateAssertions(
        step.assertions || [],
        response,
        responseTime,
        context
      );

      // Determine step status
      const allAssertionsPassed = assertionResults.every((result) => result.passed);
      const status = allAssertionsPassed ? 'passed' : 'failed';

      return {
        stepOrder: step.stepOrder,
        stepName: step.name,
        status,
        request: {
          method: request.method || 'GET',
          url: request.url || '',
          headers: request.headers,
          body: request.data,
        },
        response: {
          status: response.status,
          headers: response.headers,
          body: response.data,
          time: responseTime,
        },
        assertionResults,
        extractedVariables,
      };
    } catch (error: any) {
      return {
        stepOrder: step.stepOrder,
        stepName: step.name,
        status: 'error',
        request: {
          method: step.method || 'GET',
          url: step.url || '',
        },
        error: {
          message: error.message,
          stack: error.stack,
        },
      };
    }
  }

  /**
   * Prepare HTTP request configuration
   */
  private static prepareRequest(
    step: FlowStepConfig,
    context: ExecutionContext
  ): AxiosRequestConfig {
    // Build URL
    let url = step.url || '';

    // Apply environment base URL if relative path
    if (context.environment?.baseUrl && !url.startsWith('http')) {
      url = context.environment.baseUrl + url;
    }

    // Replace path parameters
    if (step.pathParams) {
      for (const [key, value] of Object.entries(step.pathParams)) {
        const resolvedValue = this.resolveValue(value, context);
        url = url.replace(`{${key}}`, resolvedValue).replace(`:${key}`, resolvedValue);
      }
    }

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...context.environment?.headers,
      ...step.headers,
    };

    // Resolve header values
    for (const [key, value] of Object.entries(headers)) {
      headers[key] = this.resolveValue(value, context);
    }

    // Prepare query parameters
    const params: Record<string, any> = {};
    if (step.queryParams) {
      for (const [key, value] of Object.entries(step.queryParams)) {
        params[key] = this.resolveValue(value, context);
      }
    }

    // Prepare request body
    let data = step.requestBody;
    if (data && typeof data === 'object') {
      data = this.resolveObject(data, context);
    }

    return {
      method: step.method || 'GET',
      url,
      headers,
      params,
      data,
      timeout: 30000, // 30 seconds
      validateStatus: () => true, // Don't throw on any status code
    };
  }

  /**
   * Resolve value with variable substitution
   */
  private static resolveValue(value: any, context: ExecutionContext): any {
    if (typeof value !== 'string') return value;

    // Replace {{variable}} patterns
    return value.replace(/\{\{(.+?)\}\}/g, (match, varName) => {
      const trimmedName = varName.trim();

      // Check in context variables
      if (context.variables.hasOwnProperty(trimmedName)) {
        return context.variables[trimmedName];
      }

      // Check in environment variables
      if (context.environment?.variables?.hasOwnProperty(trimmedName)) {
        return context.environment.variables[trimmedName];
      }

      // Return original if not found
      return match;
    });
  }

  /**
   * Resolve object with variable substitution
   */
  private static resolveObject(obj: any, context: ExecutionContext): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.resolveObject(item, context));
    }

    if (obj && typeof obj === 'object') {
      const resolved: any = {};
      for (const [key, value] of Object.entries(obj)) {
        resolved[key] = this.resolveObject(value, context);
      }
      return resolved;
    }

    return this.resolveValue(obj, context);
  }

  /**
   * Extract variables from response
   */
  private static extractVariables(
    extractions: VariableExtraction[],
    response: AxiosResponse,
    context: ExecutionContext
  ): Record<string, any> {
    const extracted: Record<string, any> = {};

    for (const extraction of extractions) {
      try {
        const result = JSONPath({
          path: extraction.jsonPath,
          json: response.data,
          wrap: false,
        });

        extracted[extraction.name] = result !== undefined ? result : extraction.defaultValue;
      } catch (error) {
        extracted[extraction.name] = extraction.defaultValue;
      }
    }

    return extracted;
  }

  /**
   * Validate assertions
   */
  private static validateAssertions(
    assertions: Assertion[],
    response: AxiosResponse,
    responseTime: number,
    context: ExecutionContext
  ): AssertionResult[] {
    return assertions.map((assertion) => this.validateAssertion(assertion, response, responseTime, context));
  }

  /**
   * Validate single assertion
   */
  private static validateAssertion(
    assertion: Assertion,
    response: AxiosResponse,
    responseTime: number,
    context: ExecutionContext
  ): AssertionResult {
    try {
      switch (assertion.type) {
        case 'status':
          return this.validateStatusAssertion(assertion, response);

        case 'jsonPath':
          return this.validateJsonPathAssertion(assertion, response);

        case 'responseTime':
          return this.validateResponseTimeAssertion(assertion, responseTime);

        case 'header':
          return this.validateHeaderAssertion(assertion, response);

        default:
          return {
            assertion,
            passed: false,
            message: `Unknown assertion type: ${assertion.type}`,
          };
      }
    } catch (error: any) {
      return {
        assertion,
        passed: false,
        message: `Assertion error: ${error.message}`,
      };
    }
  }

  /**
   * Validate status code assertion
   */
  private static validateStatusAssertion(
    assertion: Assertion,
    response: AxiosResponse
  ): AssertionResult {
    const actual = response.status;
    const expected = assertion.expected;
    const passed = actual === expected;

    return {
      assertion,
      passed,
      message: passed
        ? `Status code is ${expected}`
        : `Expected status ${expected}, got ${actual}`,
      actual,
      expected,
    };
  }

  /**
   * Validate JSON path assertion
   */
  private static validateJsonPathAssertion(
    assertion: Assertion,
    response: AxiosResponse
  ): AssertionResult {
    const actual = JSONPath({
      path: assertion.path || '$',
      json: response.data,
      wrap: false,
    });

    const expected = assertion.expected;
    const operator = assertion.operator || 'equals';

    let passed = false;
    let message = '';

    switch (operator) {
      case 'equals':
        passed = JSON.stringify(actual) === JSON.stringify(expected);
        message = passed ? 'Values match' : `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
        break;

      case 'notEquals':
        passed = JSON.stringify(actual) !== JSON.stringify(expected);
        message = passed ? 'Values differ' : `Expected value to differ from ${JSON.stringify(expected)}`;
        break;

      case 'contains':
        passed = JSON.stringify(actual).includes(JSON.stringify(expected));
        message = passed ? 'Value contains expected' : `Value does not contain ${JSON.stringify(expected)}`;
        break;

      case 'exists':
        passed = actual !== undefined && actual !== null;
        message = passed ? 'Value exists' : 'Value does not exist';
        break;

      case 'notExists':
        passed = actual === undefined || actual === null;
        message = passed ? 'Value does not exist' : 'Value exists';
        break;

      case 'greaterThan':
        passed = actual > expected;
        message = passed ? `${actual} > ${expected}` : `${actual} is not greater than ${expected}`;
        break;

      case 'lessThan':
        passed = actual < expected;
        message = passed ? `${actual} < ${expected}` : `${actual} is not less than ${expected}`;
        break;
    }

    return {
      assertion,
      passed,
      message,
      actual,
      expected,
    };
  }

  /**
   * Validate response time assertion
   */
  private static validateResponseTimeAssertion(
    assertion: Assertion,
    responseTime: number
  ): AssertionResult {
    const expected = assertion.expected;
    const operator = assertion.operator || 'lessThan';
    let passed = false;

    if (operator === 'lessThan') {
      passed = responseTime < expected;
    } else if (operator === 'greaterThan') {
      passed = responseTime > expected;
    }

    return {
      assertion,
      passed,
      message: passed
        ? `Response time ${responseTime}ms ${operator} ${expected}ms`
        : `Response time ${responseTime}ms is not ${operator} ${expected}ms`,
      actual: responseTime,
      expected,
    };
  }

  /**
   * Validate header assertion
   */
  private static validateHeaderAssertion(
    assertion: Assertion,
    response: AxiosResponse
  ): AssertionResult {
    const headerName = assertion.path || '';
    const actual = response.headers[headerName.toLowerCase()];
    const expected = assertion.expected;
    const operator = assertion.operator || 'equals';

    let passed = false;
    let message = '';

    switch (operator) {
      case 'equals':
        passed = actual === expected;
        message = passed ? 'Header matches' : `Expected ${expected}, got ${actual}`;
        break;

      case 'contains':
        passed = actual?.includes(expected);
        message = passed ? 'Header contains expected value' : `Header does not contain ${expected}`;
        break;

      case 'exists':
        passed = actual !== undefined;
        message = passed ? 'Header exists' : 'Header does not exist';
        break;
    }

    return {
      assertion,
      passed,
      message,
      actual,
      expected,
    };
  }

  /**
   * Evaluate condition expression
   */
  private static evaluateCondition(condition: string, context: ExecutionContext): boolean {
    try {
      // Simple condition evaluation (can be enhanced)
      const resolvedCondition = this.resolveValue(condition, context);

      // Basic evaluation
      if (resolvedCondition === 'true' || resolvedCondition === true) return true;
      if (resolvedCondition === 'false' || resolvedCondition === false) return false;

      // Try to evaluate as expression
      return !!resolvedCondition;
    } catch {
      return false;
    }
  }
}
