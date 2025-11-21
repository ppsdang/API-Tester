import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIFlowRequest, AIFlowResponse, ApiEndpoint, FlowStepConfig } from '../types';

type AIProvider = 'anthropic' | 'openai' | 'gemini';

/**
 * AI Agent for flow generation and analysis
 * Supports multiple AI providers with latest models:
 * - OpenAI GPT-5
 * - Anthropic Claude Sonnet 4.5
 * - Google Gemini 3 Pro
 */
export class AIAgent {
  private provider: AIProvider;
  private anthropicClient?: Anthropic;
  private openaiClient?: OpenAI;
  private geminiClient?: GoogleGenerativeAI;

  constructor() {
    // Determine which provider to use based on environment
    this.provider = (process.env.AI_PROVIDER as AIProvider) || 'openai';

    // Initialize the appropriate client
    this.initializeClient();
  }

  private initializeClient() {
    switch (this.provider) {
      case 'anthropic':
        if (!process.env.ANTHROPIC_API_KEY) {
          throw new Error('ANTHROPIC_API_KEY is required when using Anthropic provider');
        }
        this.anthropicClient = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });
        console.log('✓ AI Agent initialized with Anthropic Claude');
        break;

      case 'openai':
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OPENAI_API_KEY is required when using OpenAI provider');
        }
        this.openaiClient = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        console.log('✓ AI Agent initialized with OpenAI GPT');
        break;

      case 'gemini':
        if (!process.env.GEMINI_API_KEY) {
          throw new Error('GEMINI_API_KEY is required when using Gemini provider');
        }
        this.geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        console.log('✓ AI Agent initialized with Google Gemini');
        break;

      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  /**
   * Generate a flow from natural language prompt
   */
  async generateFlow(
    request: AIFlowRequest,
    availableApis: ApiEndpoint[]
  ): Promise<AIFlowResponse> {
    const systemPrompt = this.buildSystemPrompt(availableApis);
    const userPrompt = this.buildFlowGenerationPrompt(request);

    try {
      const response = await this.callAI(systemPrompt, userPrompt);
      return this.parseFlowResponse(response);
    } catch (error: any) {
      throw new Error(`AI flow generation failed: ${error.message}`);
    }
  }

  /**
   * Analyze flow failure and suggest fixes
   */
  async analyzeFailure(
    flowName: string,
    executionLogs: any[],
    flowSteps: FlowStepConfig[]
  ): Promise<string> {
    const prompt = `
Analyze the following API flow execution that failed:

Flow Name: ${flowName}

Flow Steps:
${JSON.stringify(flowSteps, null, 2)}

Execution Logs:
${JSON.stringify(executionLogs, null, 2)}

Please analyze:
1. What went wrong and why
2. Which step(s) failed and the root cause
3. Specific recommendations to fix the issue
4. Any potential improvements to make the flow more robust

Provide a clear, actionable response.
`;

    try {
      return await this.callAI('You are an expert API testing assistant.', prompt);
    } catch (error: any) {
      throw new Error(`AI failure analysis failed: ${error.message}`);
    }
  }

  /**
   * Suggest assertions for a flow step
   */
  async suggestAssertions(
    step: FlowStepConfig,
    api?: ApiEndpoint
  ): Promise<any[]> {
    const prompt = `
Given the following API endpoint and flow step, suggest appropriate assertions to validate the response:

API: ${api ? JSON.stringify(api, null, 2) : 'Manual API'}

Flow Step:
${JSON.stringify(step, null, 2)}

Suggest assertions that would validate:
1. Response status code
2. Response structure and required fields
3. Data types and formats
4. Business logic validations
5. Response time if applicable

Return the assertions as a JSON array following this format:
[
  {
    "type": "status|jsonPath|responseTime|header",
    "expected": <expected value>,
    "operator": "equals|notEquals|contains|greaterThan|lessThan|exists|notExists",
    "path": "<jsonPath for jsonPath type>",
    "message": "<description of what this assertion validates>"
  }
]

Return ONLY the JSON array, no additional text.
`;

    try {
      const response = await this.callAI('You are an expert API testing assistant.', prompt);
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error: any) {
      console.error('AI assertion suggestion failed:', error);
      return [];
    }
  }

  /**
   * Generate test data for a request body
   */
  async generateTestData(
    api: ApiEndpoint,
    scenario: 'positive' | 'negative' | 'edge'
  ): Promise<any> {
    const prompt = `
Generate ${scenario} test data for the following API:

${JSON.stringify(api, null, 2)}

For ${scenario} scenario:
- positive: Valid data that should succeed
- negative: Invalid data that should fail validation
- edge: Boundary values and edge cases

Return ONLY the JSON test data, no additional text.
`;

    try {
      const response = await this.callAI('You are an expert API testing assistant.', prompt);
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch (error: any) {
      console.error('AI test data generation failed:', error);
      return null;
    }
  }

  /**
   * Call the appropriate AI provider
   */
  private async callAI(systemPrompt: string, userPrompt: string): Promise<string> {
    switch (this.provider) {
      case 'anthropic':
        return this.callAnthropic(systemPrompt, userPrompt);
      case 'openai':
        return this.callOpenAI(systemPrompt, userPrompt);
      case 'gemini':
        return this.callGemini(systemPrompt, userPrompt);
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  /**
   * Call Anthropic Claude API
   */
  private async callAnthropic(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.anthropicClient) {
      throw new Error('Anthropic client not initialized');
    }

    const response = await this.anthropicClient.messages.create({
      model: 'claude-sonnet-4.5-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Unexpected response format from Anthropic');
  }

  /**
   * Call OpenAI GPT API
   */
  private async callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await this.openaiClient.chat.completions.create({
      model: 'gpt-5',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      return content;
    }

    throw new Error('Unexpected response format from OpenAI');
  }

  /**
   * Call Google Gemini API
   */
  private async callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized');
    }

    const model = this.geminiClient.getGenerativeModel({ model: 'gemini-3-pro' });

    const prompt = `${systemPrompt}\n\n${userPrompt}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (text) {
      return text;
    }

    throw new Error('Unexpected response format from Gemini');
  }

  /**
   * Build system prompt with available APIs
   */
  private buildSystemPrompt(apis: ApiEndpoint[]): string {
    return `You are an expert API testing assistant. Your role is to help users create comprehensive API test flows.

Available APIs:
${JSON.stringify(apis, null, 2)}

When generating flows:
1. Analyze the user's request carefully
2. Select appropriate APIs from the available list
3. Create a logical sequence of steps
4. Configure variable extraction to pass data between steps
5. Add appropriate assertions for validation
6. Consider error cases and edge scenarios

Return responses in JSON format that matches the expected structure.`;
  }

  /**
   * Build flow generation prompt
   */
  private buildFlowGenerationPrompt(request: AIFlowRequest): string {
    return `
${request.context ? `Context: ${request.context}\n\n` : ''}

User Request: ${request.prompt}

Generate a complete API test flow that accomplishes the user's request.

Return a JSON object with this structure:
{
  "flow": {
    "name": "<descriptive flow name>",
    "description": "<what this flow tests>",
    "steps": [
      {
        "stepOrder": 1,
        "name": "<step name>",
        "description": "<what this step does>",
        "apiId": "<id of API to use, or null for manual>",
        "method": "GET|POST|PUT|DELETE|PATCH",
        "url": "<full URL or path>",
        "headers": {<headers object>},
        "queryParams": {<query params>},
        "pathParams": {<path params>},
        "requestBody": {<request body>},
        "extractVariables": [
          {
            "name": "<variable name>",
            "jsonPath": "<JSONPath expression>",
            "defaultValue": "<optional default>"
          }
        ],
        "assertions": [
          {
            "type": "status|jsonPath|responseTime|header",
            "expected": <expected value>,
            "operator": "equals|contains|exists|etc",
            "path": "<path if applicable>",
            "message": "<assertion description>"
          }
        ]
      }
    ]
  },
  "reasoning": "<explanation of why you designed the flow this way>"
}

Return ONLY the JSON object, no additional text.
`;
  }

  /**
   * Parse flow generation response
   */
  private parseFlowResponse(text: string): AIFlowResponse {
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (!parsed.flow || !parsed.flow.steps) {
        throw new Error('Invalid flow structure in AI response');
      }

      return parsed;
    } catch (error: any) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }
}
