# API Flow Testing Web Application with AI Assistant

A comprehensive web application for testing APIs and API flows with an intelligent AI assistant.

## Features

- **API Import**: Import APIs from Swagger/OpenAPI, Postman collections, or define manually
- **Flow Builder**: Create complex API test flows with variable extraction and reuse
- **Execution Engine**: Execute flows and validate results with detailed logging
- **Environment Management**: Support for multiple environments (Dev, QA, Staging, Prod)
- **AI Assistant**: Intelligent agent powered by AI (OpenAI, Anthropic Claude, or Google Gemini) that helps design, validate, and analyze flows

## Project Structure

```
/API-Tester
├── backend/          # Node.js + Express backend
├── frontend/         # React + TypeScript frontend
└── docs/            # Documentation
```

## Tech Stack

### Backend
- Node.js with Express and TypeScript
- PostgreSQL database with Prisma ORM
- Swagger Parser for OpenAPI definitions
- Postman Collection SDK
- Multiple AI Provider Support (OpenAI GPT, Anthropic Claude, Google Gemini)

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- React Flow for visual flow builder
- Zustand for state management

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- AI Provider API key (choose one: OpenAI, Anthropic, or Gemini)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd API-Tester
```

2. Set up backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database and AI provider credentials
# Set AI_PROVIDER to 'openai', 'anthropic', or 'gemini'
# Set the corresponding API key
npx prisma migrate dev
npm run dev
```

3. Set up frontend
```bash
cd frontend
npm install
npm run dev
```

4. Access the application at `http://localhost:5173`

## Architecture

### Core Components

1. **API Parser Module**: Parses Swagger/OpenAPI and Postman collections
2. **Flow Builder**: Visual interface for creating test flows
3. **Execution Engine**: Executes flows with variable extraction and assertions
4. **AI Agent**: Claude-powered assistant for flow generation and analysis
5. **Environment Manager**: Manages different environment configurations

### Database Schema

- **apis**: Stores imported and manually defined APIs
- **flows**: Stores test flow definitions
- **flow_steps**: Individual steps in a flow
- **executions**: Flow execution history
- **execution_logs**: Detailed logs for each step
- **environments**: Environment configurations
- **variables**: Extracted variables from executions

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT
