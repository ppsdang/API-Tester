# Setup Guide

This guide will help you set up and run the API Flow Testing Application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm
- **PostgreSQL** 14+
- **Anthropic API Key** (for AI features)

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd API-Tester
```

## Step 2: Set Up the Backend

### Install Dependencies

```bash
cd backend
npm install
```

### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/api_flow_tester?schema=public"

# Server
PORT=3000
NODE_ENV=development

# AI Agent
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Security
JWT_SECRET=your_jwt_secret_here

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Set Up the Database

1. Create a PostgreSQL database:

```bash
createdb api_flow_tester
```

2. Run Prisma migrations:

```bash
npx prisma migrate dev
```

3. (Optional) Open Prisma Studio to view your database:

```bash
npx prisma studio
```

### Start the Backend Server

```bash
npm run dev
```

The backend should now be running on `http://localhost:3000`.

## Step 3: Set Up the Frontend

### Install Dependencies

Open a new terminal window:

```bash
cd frontend
npm install
```

### Start the Frontend Development Server

```bash
npm run dev
```

The frontend should now be running on `http://localhost:5173`.

## Step 4: Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

You should see the API Flow Tester dashboard!

## Step 5: Test the Setup

### 1. Import API Collection

- Click on "APIs" in the sidebar
- Click "Import APIs"
- Try importing a sample Swagger API:
  - Select "Swagger/OpenAPI"
  - Select "URL"
  - Enter: `https://petstore.swagger.io/v2/swagger.json`
  - Click "Import"

### 2. Create a Simple Flow

- Click on "Flows" in the sidebar
- Click "Create Flow"
- Fill in the flow details:
  - Name: "Test Pet Store"
  - Description: "Simple test of Pet Store API"
- Add a step:
  - Select an API from the dropdown
  - Or manually configure:
    - Method: GET
    - URL: `https://petstore.swagger.io/v2/pet/findByStatus?status=available`
- Click "Save Flow"

### 3. Run the Flow

- From the Flows list, click the "Run" button
- Watch the execution complete
- Click on the execution to view detailed logs

## Step 6: Set Up Environments (Optional)

- Click on "Environments" in the sidebar
- Click "Add Environment"
- Create environments for different stages:
  - **Development**: `http://localhost:8000`
  - **QA**: `https://qa.api.example.com`
  - **Production**: `https://api.example.com`

## Troubleshooting

### Backend won't start

- Check that PostgreSQL is running
- Verify your `DATABASE_URL` in `.env`
- Ensure port 3000 is not in use

### Frontend won't start

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Ensure port 5173 is not in use

### Database connection errors

- Verify PostgreSQL is running: `pg_isready`
- Check database credentials in `.env`
- Ensure the database exists: `psql -l`

### AI features not working

- Verify your `ANTHROPIC_API_KEY` is set correctly in `.env`
- Check API key has sufficient credits

## Next Steps

Now that you have the application running:

1. Import your own API collections (Swagger or Postman)
2. Create comprehensive test flows
3. Use the AI Assistant to generate flows from natural language
4. Set up environments for different stages
5. Run flows regularly to validate your APIs

## Production Deployment

For production deployment:

1. Build the frontend:

```bash
cd frontend
npm run build
```

2. Set up a production PostgreSQL database

3. Configure environment variables for production

4. Use a process manager like PM2 for the backend:

```bash
npm install -g pm2
cd backend
npm run build
pm2 start dist/index.js --name api-flow-tester
```

5. Serve the frontend build with Nginx or another web server

6. Set up SSL certificates (recommended: Let's Encrypt)

7. Configure proper CORS settings

For detailed production deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).
