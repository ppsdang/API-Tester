# API Reference

Backend API endpoints documentation.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently using mock authentication. In production, implement proper JWT authentication.

## API Endpoints

### APIs & Collections

#### Import Swagger/OpenAPI

```http
POST /api/apis/import/swagger
Content-Type: application/json

{
  "url": "https://api.example.com/swagger.json",
  // OR
  "json": { /* OpenAPI JSON object */ }
}
```

**Response**: `ApiCollection` object with imported APIs

#### Import Postman Collection

```http
POST /api/apis/import/postman
Content-Type: application/json

{
  "url": "https://api.example.com/collection.json",
  // OR
  "json": { /* Postman collection JSON */ }
}
```

**Response**: `ApiCollection` object with imported APIs

#### Get All Collections

```http
GET /api/apis/collections
```

**Response**: Array of `ApiCollection` objects

#### Get All APIs

```http
GET /api/apis
```

**Response**: Array of `Api` objects

#### Get Single API

```http
GET /api/apis/:id
```

**Response**: `Api` object

#### Create API

```http
POST /api/apis
Content-Type: application/json

{
  "name": "Get User",
  "method": "GET",
  "path": "/users/:id",
  "description": "Fetch user by ID",
  "headers": {},
  "queryParams": {},
  "requestBody": null
}
```

**Response**: Created `Api` object

#### Update API

```http
PUT /api/apis/:id
Content-Type: application/json

{
  "name": "Updated name",
  ...
}
```

**Response**: Updated `Api` object

#### Delete API

```http
DELETE /api/apis/:id
```

**Response**: `{ message: "API deleted successfully" }`

#### Delete Collection

```http
DELETE /api/apis/collections/:id
```

**Response**: `{ message: "Collection deleted successfully" }`

---

### Flows

#### Get All Flows

```http
GET /api/flows
```

**Response**: Array of `Flow` objects with steps

#### Get Single Flow

```http
GET /api/flows/:id
```

**Response**: `Flow` object with steps and recent executions

#### Create Flow

```http
POST /api/flows
Content-Type: application/json

{
  "name": "User Registration Flow",
  "description": "Tests user registration process",
  "steps": [
    {
      "stepOrder": 0,
      "name": "Register User",
      "method": "POST",
      "url": "/api/auth/register",
      "requestBody": {
        "email": "test@example.com",
        "password": "secret"
      },
      "extractVariables": [
        {
          "name": "userId",
          "jsonPath": "$.user.id"
        }
      ],
      "assertions": [
        {
          "type": "status",
          "expected": 201
        }
      ]
    }
  ]
}
```

**Response**: Created `Flow` object

#### Update Flow

```http
PUT /api/flows/:id
Content-Type: application/json

{
  "name": "Updated Flow Name",
  "description": "Updated description",
  "isActive": true,
  "steps": [ /* updated steps */ ]
}
```

**Response**: Updated `Flow` object

#### Delete Flow

```http
DELETE /api/flows/:id
```

**Response**: `{ message: "Flow deleted successfully" }`

#### Clone Flow

```http
POST /api/flows/:id/clone
```

**Response**: Cloned `Flow` object

---

### Executions

#### Run Flow

```http
POST /api/executions/run/:flowId
Content-Type: application/json

{
  "environmentId": "optional-environment-id"
}
```

**Response**:
```json
{
  "executionId": "uuid",
  "status": "running",
  "message": "Flow execution started"
}
```

#### Get Execution

```http
GET /api/executions/:id
```

**Response**: `Execution` object with logs and variables

#### Get Flow Executions

```http
GET /api/executions/flow/:flowId
```

**Response**: Array of `Execution` objects for the flow

#### Get Execution Logs

```http
GET /api/executions/:id/logs
```

**Response**: Array of `ExecutionLog` objects

#### Delete Execution

```http
DELETE /api/executions/:id
```

**Response**: `{ message: "Execution deleted successfully" }`

---

### Environments

#### Get All Environments

```http
GET /api/environments
```

**Response**: Array of `Environment` objects

#### Get Single Environment

```http
GET /api/environments/:id
```

**Response**: `Environment` object

#### Create Environment

```http
POST /api/environments
Content-Type: application/json

{
  "name": "Development",
  "description": "Local development environment",
  "baseUrl": "http://localhost:8000",
  "variables": {
    "apiKey": "dev-key-123"
  },
  "headers": {
    "X-Environment": "dev"
  },
  "isDefault": true
}
```

**Response**: Created `Environment` object

#### Update Environment

```http
PUT /api/environments/:id
Content-Type: application/json

{
  "name": "Updated name",
  ...
}
```

**Response**: Updated `Environment` object

#### Delete Environment

```http
DELETE /api/environments/:id
```

**Response**: `{ message: "Environment deleted successfully" }`

---

### AI Assistant

#### Generate Flow

```http
POST /api/ai/generate-flow
Content-Type: application/json

{
  "prompt": "Create a flow that logs in, gets user profile, and updates email",
  "apiCollectionIds": ["collection-id-1", "collection-id-2"],
  "context": "Additional context for AI"
}
```

**Response**:
```json
{
  "flow": {
    "name": "Generated flow name",
    "description": "What this flow does",
    "steps": [ /* array of flow steps */ ]
  },
  "reasoning": "AI's explanation of the generated flow"
}
```

#### Analyze Failure

```http
POST /api/ai/analyze-failure
Content-Type: application/json

{
  "executionId": "execution-uuid"
}
```

**Response**:
```json
{
  "analysis": "Detailed analysis of what went wrong and how to fix it"
}
```

#### Suggest Assertions

```http
POST /api/ai/suggest-assertions
Content-Type: application/json

{
  "stepConfig": {
    "method": "GET",
    "url": "/api/users/:id"
  },
  "apiId": "optional-api-id"
}
```

**Response**:
```json
{
  "assertions": [
    {
      "type": "status",
      "expected": 200,
      "message": "Should return 200 OK"
    },
    {
      "type": "jsonPath",
      "path": "$.id",
      "operator": "exists",
      "message": "User ID should exist"
    }
  ]
}
```

#### Generate Test Data

```http
POST /api/ai/generate-test-data
Content-Type: application/json

{
  "apiId": "api-uuid",
  "scenario": "positive" // or "negative" or "edge"
}
```

**Response**:
```json
{
  "testData": {
    "email": "test@example.com",
    "password": "ValidPass123!",
    "name": "Test User"
  }
}
```

---

## Data Models

### ApiCollection

```typescript
{
  id: string;
  name: string;
  description?: string;
  source: 'swagger' | 'postman' | 'manual';
  sourceUrl?: string;
  rawData?: any;
  apis: Api[];
  createdAt: string;
  updatedAt: string;
}
```

### Api

```typescript
{
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
  createdAt: string;
  updatedAt: string;
}
```

### Flow

```typescript
{
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  steps: FlowStep[];
  createdAt: string;
  updatedAt: string;
}
```

### FlowStep

```typescript
{
  id: string;
  stepOrder: number;
  name?: string;
  description?: string;
  apiId?: string;
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
}
```

### Execution

```typescript
{
  id: string;
  flowId: string;
  status: 'running' | 'passed' | 'failed' | 'error';
  startedAt: string;
  completedAt?: string;
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  errorMessage?: string;
  environmentId?: string;
  logs?: ExecutionLog[];
  variables?: ExecutionVariable[];
}
```

### Environment

```typescript
{
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
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message describing what went wrong",
  "stack": "Stack trace (only in development)"
}
```

**HTTP Status Codes**:
- `400` - Bad Request (invalid input)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. In production, implement rate limiting to prevent abuse.

## Webhooks

Future feature: Webhook notifications for flow execution completion.
