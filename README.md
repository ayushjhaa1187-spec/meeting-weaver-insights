# BRD Agent

A multi-agent AI system that transforms scattered emails, meeting transcripts, and chat logs into structured Business Requirements Documents (BRDs).

## Features

- **Data Ingestion**: Upload emails (CSV/JSON), transcripts (AMI format), and chat logs.
- **Pipeline Visualization**: Real-time tracking of ingestion, noise filtering, entity extraction, generation, and validation.
- **AI-Powered Generation**: Generates comprehensive BRDs with sections for Project Overview, Stakeholders, Functional Requirements, NFRs, Risks, and Metrics.
- **Validation Metrics**: Automated scoring for Accuracy, Precision, Recall, and F1 Score.
- **Dashboard**: Monitor active pipelines and historical performance.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, shadcn/ui (in `frontend/` directory)
- **Backend**: Supabase (Database, Auth, Edge Functions) (in `supabase/` directory)
- **AI Integration**: Supabase Edge Functions + AI Gateway (Google Gemini / OpenAI)

## Repository Structure

```
.
├── frontend/           # React application (Vite)
│   ├── src/            # Source code
│   ├── public/         # Static assets
│   ├── vite.config.ts  # Vite configuration
│   └── ...
├── supabase/           # Backend Logic
│   ├── functions/      # Edge Functions (API)
│   ├── migrations/     # Database Schema
│   └── ...
├── netlify.toml        # Netlify deployment config
└── render.yaml         # Render deployment blueprint
```

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

Navigate to the frontend directory and create the .env file:

```bash
cd frontend
cp .env.example .env
```

Update `.env` with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

For the Edge Function (`supabase/functions/generate-brd`), set secrets in your Supabase dashboard:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LOVABLE_API_KEY`

### 3. Install Dependencies & Run

```bash
cd frontend
npm install
npm run de""v
```

The application will be available at `http://localhost:8080`.

## Deployment

### Netlify / Vercel

The repository is configured for easy deployment.
- **Base Directory**: `frontend`
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`

**Netlify**: The included `netlify.toml` handles this automatically.
**Vercel**: Set the "Root Directory" to `frontend` in your project settings.

### Render

Use the `render.yaml` blueprint to deploy the frontend as a Static Site.

### Backend

Deploy Supabase functions:

```bash
supabase functions deploy generate-brd
```

## License

MIT
