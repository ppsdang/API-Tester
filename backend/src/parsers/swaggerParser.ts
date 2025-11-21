import SwaggerParser from '@apidevtools/swagger-parser';
import { OpenAPIV3 } from 'openapi-types';
import { ApiEndpoint, ParsedApiCollection } from '../types';

/**
 * Parse Swagger/OpenAPI definition and extract API endpoints
 */
export class SwaggerApiParser {
  /**
   * Parse from URL
   */
  static async parseFromUrl(url: string): Promise<ParsedApiCollection> {
    try {
      const api = await SwaggerParser.validate(url) as OpenAPIV3.Document;
      return this.extractEndpoints(api);
    } catch (error: any) {
      throw new Error(`Failed to parse Swagger from URL: ${error.message}`);
    }
  }

  /**
   * Parse from JSON object
   */
  static async parseFromJson(json: any): Promise<ParsedApiCollection> {
    try {
      const api = await SwaggerParser.validate(json) as OpenAPIV3.Document;
      return this.extractEndpoints(api);
    } catch (error: any) {
      throw new Error(`Failed to parse Swagger from JSON: ${error.message}`);
    }
  }

  /**
   * Extract endpoints from OpenAPI document
   */
  private static extractEndpoints(api: OpenAPIV3.Document): ParsedApiCollection {
    const endpoints: ApiEndpoint[] = [];

    // Get base information
    const collectionName = api.info.title || 'Unnamed API';
    const collectionDescription = api.info.description;

    // Extract server URLs
    const servers = api.servers || [];
    const baseUrl = servers.length > 0 ? servers[0].url : '';

    // Iterate through paths
    for (const [path, pathItem] of Object.entries(api.paths)) {
      if (!pathItem) continue;

      // Handle each HTTP method
      const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'] as const;

      for (const method of methods) {
        const operation = pathItem[method] as OpenAPIV3.OperationObject | undefined;
        if (!operation) continue;

        const endpoint = this.extractEndpoint(
          method.toUpperCase(),
          path,
          operation,
          baseUrl
        );

        endpoints.push(endpoint);
      }
    }

    return {
      name: collectionName,
      description: collectionDescription,
      endpoints,
    };
  }

  /**
   * Extract single endpoint from operation
   */
  private static extractEndpoint(
    method: string,
    path: string,
    operation: OpenAPIV3.OperationObject,
    baseUrl: string
  ): ApiEndpoint {
    const name = operation.operationId || operation.summary || `${method} ${path}`;
    const description = operation.description || operation.summary;

    // Extract parameters
    const queryParams: Record<string, any> = {};
    const pathParams: Record<string, any> = {};
    const headers: Record<string, any> = {};

    if (operation.parameters) {
      for (const param of operation.parameters) {
        const parameter = param as OpenAPIV3.ParameterObject;

        const paramDef = {
          type: parameter.schema ? this.getSchemaType(parameter.schema as OpenAPIV3.SchemaObject) : 'string',
          required: parameter.required || false,
          description: parameter.description,
          example: parameter.example,
        };

        if (parameter.in === 'query') {
          queryParams[parameter.name] = paramDef;
        } else if (parameter.in === 'path') {
          pathParams[parameter.name] = paramDef;
        } else if (parameter.in === 'header') {
          headers[parameter.name] = paramDef;
        }
      }
    }

    // Extract request body
    let requestBody: any = null;
    let exampleRequest: any = null;

    if (operation.requestBody) {
      const reqBody = operation.requestBody as OpenAPIV3.RequestBodyObject;
      const content = reqBody.content?.['application/json'];

      if (content) {
        requestBody = content.schema;
        exampleRequest = content.example || this.generateExample(content.schema as OpenAPIV3.SchemaObject);
      }
    }

    // Extract response schema
    let responseSchema: any = null;
    let exampleResponse: any = null;

    if (operation.responses) {
      // Get the first successful response (200, 201, etc.)
      const successResponse = operation.responses['200'] || operation.responses['201'] || operation.responses['default'];

      if (successResponse) {
        const response = successResponse as OpenAPIV3.ResponseObject;
        const content = response.content?.['application/json'];

        if (content) {
          responseSchema = content.schema;
          exampleResponse = content.example || this.generateExample(content.schema as OpenAPIV3.SchemaObject);
        }
      }
    }

    return {
      name,
      description,
      method,
      path: baseUrl + path,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      pathParams: Object.keys(pathParams).length > 0 ? pathParams : undefined,
      requestBody,
      responseSchema,
      exampleRequest,
      exampleResponse,
    };
  }

  /**
   * Get schema type
   */
  private static getSchemaType(schema: OpenAPIV3.SchemaObject): string {
    if (schema.type) return schema.type;
    if (schema.allOf || schema.oneOf || schema.anyOf) return 'object';
    return 'any';
  }

  /**
   * Generate example from schema
   */
  private static generateExample(schema: any): any {
    if (!schema) return null;

    if (schema.example) return schema.example;

    switch (schema.type) {
      case 'string':
        return schema.enum ? schema.enum[0] : 'string';
      case 'number':
      case 'integer':
        return 0;
      case 'boolean':
        return true;
      case 'array':
        return schema.items ? [this.generateExample(schema.items)] : [];
      case 'object':
        if (schema.properties) {
          const obj: any = {};
          for (const [key, value] of Object.entries(schema.properties)) {
            obj[key] = this.generateExample(value);
          }
          return obj;
        }
        return {};
      default:
        return null;
    }
  }
}
