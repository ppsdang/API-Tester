# User Guide

Complete guide to using the API Flow Testing Application.

## Table of Contents

1. [Overview](#overview)
2. [Importing APIs](#importing-apis)
3. [Creating Flows](#creating-flows)
4. [Using the AI Assistant](#using-the-ai-assistant)
5. [Running Flows](#running-flows)
6. [Managing Environments](#managing-environments)
7. [Best Practices](#best-practices)

## Overview

The API Flow Testing Application allows you to:

- Import API definitions from Swagger/OpenAPI or Postman
- Create complex test flows with multiple steps
- Extract data from responses and use it in subsequent steps
- Validate responses with assertions
- Use AI to generate flows from natural language
- Manage multiple environments (Dev, QA, Prod)

## Importing APIs

### From Swagger/OpenAPI

1. Navigate to the **APIs** page
2. Click **Import APIs**
3. Select **Swagger/OpenAPI**
4. Choose your source:
   - **URL**: Enter the URL to your swagger.json or openapi.json
   - **JSON Content**: Paste your OpenAPI JSON directly
5. Click **Import**

The system will parse the specification and create API endpoints for all operations.

### From Postman Collection

1. Navigate to the **APIs** page
2. Click **Import APIs**
3. Select **Postman Collection**
4. Choose your source:
   - **URL**: Enter the URL to your collection
   - **JSON Content**: Export your Postman collection and paste the JSON
5. Click **Import**

### Manual API Definition

To create individual API endpoints manually:

1. Navigate to the **APIs** page
2. Click **Create API**
3. Fill in the details:
   - Name
   - HTTP Method
   - URL/Path
   - Headers
   - Query Parameters
   - Request Body
4. Click **Save**

## Creating Flows

### Basic Flow Creation

1. Navigate to the **Flows** page
2. Click **Create Flow**
3. Enter flow details:
   - **Name**: Descriptive name for the flow
   - **Description**: What the flow tests
4. Add steps:
   - Click **Add Step**
   - Select an API or configure manually
   - Configure request details
   - Add assertions
5. Click **Save Flow**

### Step Configuration

Each step can include:

#### Request Configuration

- **Method**: HTTP method (GET, POST, PUT, DELETE, etc.)
- **URL**: Full URL or path (can include variables)
- **Headers**: Custom headers for this step
- **Query Parameters**: URL query parameters
- **Path Parameters**: Path variables (e.g., `/users/:id`)
- **Request Body**: JSON body for POST/PUT requests

#### Variable Extraction

Extract data from responses to use in later steps:

```json
{
  "extractVariables": [
    {
      "name": "userId",
      "jsonPath": "$.data.id",
      "defaultValue": null
    },
    {
      "name": "authToken",
      "jsonPath": "$.token"
    }
  ]
}
```

Use extracted variables in subsequent steps with `{{variableName}}`:

```
URL: /users/{{userId}}/profile
Header: Authorization: Bearer {{authToken}}
```

#### Assertions

Validate responses with assertions:

**Status Code**:
```json
{
  "type": "status",
  "expected": 200,
  "message": "Should return 200 OK"
}
```

**JSON Path**:
```json
{
  "type": "jsonPath",
  "path": "$.data.email",
  "operator": "exists",
  "message": "Email should exist"
}
```

**Response Time**:
```json
{
  "type": "responseTime",
  "operator": "lessThan",
  "expected": 1000,
  "message": "Response should be under 1 second"
}
```

**Header**:
```json
{
  "type": "header",
  "path": "content-type",
  "operator": "contains",
  "expected": "application/json"
}
```

### Example Flow: User Registration and Profile Update

```
Step 1: Register User
- Method: POST
- URL: /api/auth/register
- Body: {"email": "test@example.com", "password": "secret123"}
- Extract: token from $.token, userId from $.user.id
- Assert: Status = 201, token exists

Step 2: Get User Profile
- Method: GET
- URL: /api/users/{{userId}}
- Headers: {"Authorization": "Bearer {{token}}"}
- Assert: Status = 200, $.email = "test@example.com"

Step 3: Update Profile
- Method: PUT
- URL: /api/users/{{userId}}
- Headers: {"Authorization": "Bearer {{token}}"}
- Body: {"name": "John Doe"}
- Assert: Status = 200, $.name = "John Doe"
```

## Using the AI Assistant

The AI Assistant can help you create flows, suggest assertions, and analyze failures.

### Generate Flow from Prompt

1. In the Flow Builder, click **AI Assistant**
2. Describe what you want to test:

```
Create a flow that:
1. Logs in as a user
2. Fetches the user's task list
3. Updates the first task to "completed" status
```

3. Click **Generate Flow**
4. Review the generated flow and make adjustments if needed
5. Save the flow

### Suggest Assertions

When configuring a step:

1. Click **Suggest Assertions** (AI feature)
2. The AI will analyze the API and suggest appropriate validations
3. Review and accept the suggestions

### Analyze Failures

When a flow execution fails:

1. View the execution results
2. Click **AI Analysis**
3. The AI will analyze the logs and suggest:
   - What went wrong
   - Why it failed
   - How to fix it

## Running Flows

### Execute a Flow

1. Navigate to the **Flows** page
2. Find your flow
3. Click the **Run** button
4. (Optional) Select an environment
5. The flow will execute in the background

### View Execution Results

1. Click on a completed execution
2. View the summary:
   - Total steps
   - Passed/Failed steps
   - Execution duration
3. Examine step-by-step logs:
   - Request details
   - Response data
   - Assertion results
   - Any errors

### Execution Status

- **Running**: Flow is currently executing
- **Passed**: All assertions passed
- **Failed**: One or more assertions failed
- **Error**: Execution error occurred

## Managing Environments

### Create an Environment

1. Navigate to the **Environments** page
2. Click **Add Environment**
3. Fill in details:
   - **Name**: e.g., "Development", "QA", "Production"
   - **Description**: Optional description
   - **Base URL**: Base URL for all APIs in this environment
   - **Variables**: Environment-specific variables
   - **Headers**: Common headers (e.g., API keys)
   - **Is Default**: Set as default environment
4. Click **Create**

### Use Environments in Flows

When running a flow:

1. Select the environment from the dropdown
2. The flow will use:
   - Base URL from the environment
   - Environment variables
   - Common headers

### Example Environments

**Development**:
- Base URL: `http://localhost:8000`
- Variables: `{"debugMode": true}`

**QA**:
- Base URL: `https://qa.api.example.com`
- Headers: `{"X-Environment": "qa"}`

**Production**:
- Base URL: `https://api.example.com`
- Headers: `{"X-API-Key": "prod-key-123"}`

## Best Practices

### Organizing APIs

- Group related APIs in collections
- Use descriptive names
- Keep API definitions up to date

### Designing Flows

- **Single Responsibility**: Each flow should test one business scenario
- **Meaningful Names**: Use descriptive names like "User Registration Happy Path"
- **Extract Variables**: Always extract IDs and tokens for reuse
- **Add Assertions**: Validate status codes, required fields, and business logic
- **Handle Errors**: Test both success and failure cases

### Variable Naming

Use clear, descriptive variable names:

```
Good: userId, authToken, orderId
Bad: id, token, x
```

### Assertions

Add multiple assertions per step:

1. Status code
2. Response structure
3. Required fields exist
4. Field values are correct
5. Response time is acceptable

### Environments

- Always use environments instead of hardcoding URLs
- Keep sensitive data (API keys) in environment variables
- Test flows in all environments before production

### Flow Organization

Create separate flows for:

- **Happy Path**: Normal, successful scenarios
- **Error Cases**: Invalid inputs, missing data
- **Edge Cases**: Boundary values, special conditions
- **Performance**: Response time validation

### Example Flow Structure

```
Collection: User Management
├── Flow: User Registration Happy Path
├── Flow: User Registration with Invalid Email
├── Flow: User Registration with Duplicate Email
├── Flow: User Login Success
├── Flow: User Login with Wrong Password
└── Flow: User Profile CRUD Operations
```

## Tips and Tricks

### Debugging Failures

1. Check the execution logs for each step
2. Verify variable extraction worked correctly
3. Look at actual vs expected values in assertions
4. Use the AI Analysis feature for insights

### Reusing Flows

- Clone existing flows to create variations
- Use the AI Assistant to generate negative test cases

### Performance Testing

Add response time assertions to monitor performance:

```json
{
  "type": "responseTime",
  "operator": "lessThan",
  "expected": 500,
  "message": "API should respond in under 500ms"
}
```

### Dynamic Data

Use variables for dynamic data:

```
Body: {
  "email": "user_{{timestamp}}@example.com",
  "name": "Test User {{userId}}"
}
```

## Support

For issues or questions:

- Check the [Setup Guide](./SETUP.md)
- Review [API Documentation](./API.md)
- Submit issues on GitHub

Happy Testing! 🚀
