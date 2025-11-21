import { Collection, Item, Request, Response } from 'postman-collection';
import { ApiEndpoint, ParsedApiCollection } from '../types';
import axios from 'axios';

/**
 * Parse Postman collection and extract API endpoints
 */
export class PostmanApiParser {
  /**
   * Parse from URL
   */
  static async parseFromUrl(url: string): Promise<ParsedApiCollection> {
    try {
      const response = await axios.get(url);
      return this.parseFromJson(response.data);
    } catch (error: any) {
      throw new Error(`Failed to fetch Postman collection from URL: ${error.message}`);
    }
  }

  /**
   * Parse from JSON object
   */
  static parseFromJson(json: any): ParsedApiCollection {
    try {
      const collection = new Collection(json);
      return this.extractEndpoints(collection);
    } catch (error: any) {
      throw new Error(`Failed to parse Postman collection: ${error.message}`);
    }
  }

  /**
   * Extract endpoints from Postman collection
   */
  private static extractEndpoints(collection: Collection): ParsedApiCollection {
    const endpoints: ApiEndpoint[] = [];

    const collectionName = collection.name || 'Unnamed Collection';
    const collectionDescription = collection.description?.toString();

    // Recursively extract items
    const extractItems = (items: any[]) => {
      for (const item of items) {
        if (item.items && item.items.length > 0) {
          // It's a folder, recurse into it
          extractItems(item.items.all());
        } else if (item.request) {
          // It's a request item
          const endpoint = this.extractEndpoint(item);
          if (endpoint) {
            endpoints.push(endpoint);
          }
        }
      }
    };

    extractItems(collection.items.all());

    return {
      name: collectionName,
      description: collectionDescription,
      endpoints,
    };
  }

  /**
   * Extract single endpoint from Postman item
   */
  private static extractEndpoint(item: Item): ApiEndpoint | null {
    const request = item.request;
    if (!request) return null;

    const name = item.name || 'Unnamed Request';
    const description = item.request.description?.toString();
    const method = request.method || 'GET';
    const url = request.url?.toString() || '';

    // Extract headers
    const headers: Record<string, any> = {};
    if (request.headers) {
      request.headers.all().forEach((header: any) => {
        if (!header.disabled) {
          headers[header.key] = {
            value: header.value,
            description: header.description,
          };
        }
      });
    }

    // Extract query parameters
    const queryParams: Record<string, any> = {};
    if (request.url?.query) {
      request.url.query.all().forEach((param: any) => {
        if (!param.disabled) {
          queryParams[param.key] = {
            value: param.value,
            description: param.description,
          };
        }
      });
    }

    // Extract path parameters
    const pathParams: Record<string, any> = {};
    if (request.url?.variables) {
      request.url.variables.all().forEach((variable: any) => {
        pathParams[variable.key] = {
          value: variable.value,
          description: variable.description,
        };
      });
    }

    // Extract request body
    let requestBody: any = null;
    let exampleRequest: any = null;

    if (request.body) {
      const body = request.body;

      if (body.mode === 'raw') {
        try {
          exampleRequest = JSON.parse(body.raw || '{}');
          requestBody = { type: 'json', schema: exampleRequest };
        } catch {
          exampleRequest = body.raw;
          requestBody = { type: 'raw', content: body.raw };
        }
      } else if (body.mode === 'formdata') {
        const formData: any = {};
        body.formdata?.all().forEach((param: any) => {
          if (!param.disabled) {
            formData[param.key] = param.value;
          }
        });
        exampleRequest = formData;
        requestBody = { type: 'formdata', schema: formData };
      } else if (body.mode === 'urlencoded') {
        const urlEncoded: any = {};
        body.urlencoded?.all().forEach((param: any) => {
          if (!param.disabled) {
            urlEncoded[param.key] = param.value;
          }
        });
        exampleRequest = urlEncoded;
        requestBody = { type: 'urlencoded', schema: urlEncoded };
      }
    }

    // Extract example response if available
    let exampleResponse: any = null;
    if (item.responses && item.responses.count() > 0) {
      const firstResponse = item.responses.all()[0];
      if (firstResponse.body) {
        try {
          exampleResponse = JSON.parse(firstResponse.body);
        } catch {
          exampleResponse = firstResponse.body;
        }
      }
    }

    return {
      name,
      description,
      method,
      path: url,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      pathParams: Object.keys(pathParams).length > 0 ? pathParams : undefined,
      requestBody,
      exampleRequest,
      exampleResponse,
    };
  }
}
