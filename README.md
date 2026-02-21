# BRD Agent

A multi-agent AI system that transforms scattered emails, meeting transcripts, and chat logs into structured Business Requirements Documents (BRDs).

## Features

- **Data Ingestion**: Upload emails (CSV/JSON), transcripts (AMI format), and chat logs.
- **Pipeline Visualization**: Real-time tracking of ingestion, noise filtering, entity extraction, generation, and validation.
- **AI-Powered Generation**: Generates comprehensive BRDs with sections for Project Overview, Stakeholders, Functional Requirements, NFRs, Risks, and Metrics.
- **Validation Metrics**: Automated scoring for Accuracy, Precision, Recall, and F1 Score.
- **Dashboard**: Monitor active pipelines and historical performance.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **AI Integration**: Supabase Edge Functions + AI Gateway (Google Gemini / OpenAI)

## Setup & Installation

### Prerequisites

- Node.js (v18+)
- npm or pnpm
- Supabase project

### 1. Clone the repository

```bash
git clone <repository-url>
cd brd-agent
```

### 2. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

For the Edge Function (`supabase/functions/generate-brd`), you will need to set the following secrets in your Supabase project dashboard:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LOVABLE_API_KEY` (or your preferred AI gateway key if you modify the function)

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

Run the dev script:

```bash
npm run d""ev
```

The application will be available at `http://localhost:8080`.

## Deployment

### Frontend

Build the project for production:

```bash
npm run build
```

Deploy the `dist` folder to any static host (Vercel, Netlify, Render, etc.).

### Backend

Deploy the database migrations and edge functions using the Supabase CLI:

```bash
supabase functions deploy generate-brd
```

## License

MIT
