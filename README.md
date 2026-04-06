# MeetingWeaver Insights

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ecf8e.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![Deployed](https://img.shields.io/badge/Live-Vercel-000.svg)](https://meeting-weaver-insights.vercel.app)

AI-powered meeting intelligence platform. Analyze transcripts, extract action items, summarize discussions, track decisions, and improve meeting productivity.

## Features

- **Meeting Management** - Create, view, edit, and delete meetings with transcripts, attendees, and action items
- **AI Chat** - Conversational AI assistant (MeetingWeaver AI) for analyzing meetings, extracting insights, and answering questions
- **Insights Dashboard** - AI-generated insights with sentiment analysis, topic extraction, and decision tracking
- **BRD Generation** - Transform meeting data into structured Business Requirements Documents with live streaming
- **Authentication** - Email/password login, Google OAuth, password reset via Supabase Auth
- **Dark Mode** - System-aware theme with manual toggle, clean light/dark color system
- **Mobile Responsive** - Collapsible sidebar with hamburger menu for mobile devices
- **Real-time Pipeline** - SSE-based pipeline visualization with step-by-step progress

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript 5.8, Vite 5 |
| UI | Tailwind CSS 3.4, shadcn/ui (Radix UI), Lucide Icons |
| Auth | Supabase Auth (email/password, Google OAuth) |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Validation | Zod schemas |
| State | React Query, React hooks |
| AI | Gemini 3 Flash via Lovable Gateway (SSE streaming) |
| Charts | Recharts |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or bun
- Supabase project

### Installation

```bash
git clone https://github.com/ayushjhaa1187-spec/meeting-weaver-insights.git
cd meeting-weaver-insights
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID |

Server-side (Edge Functions):

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `LOVABLE_API_KEY` | API key for AI gateway |

### Development

```bash
npm run dev      # Start dev server on port 8080
npm run build    # Production build
npm run preview  # Preview production build
npm run test     # Run tests
npm run lint     # Run ESLint
```

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (auto-created on signup) |
| `meetings` | Meetings with title, date, duration, attendees (JSONB), transcript, summary, action_items (JSONB), status |
| `insights` | AI-generated insights linked to meetings, with type and sentiment_score |
| `chat_history` | Persistent AI chat messages per user |
| `projects` | BRD generation projects |
| `documents` | Uploaded source documents |
| `brds` | Generated Business Requirements Documents |
| `metrics` | Validation metrics per project |
| `pipeline_logs` | Pipeline execution logs |

All tables use UUID primary keys, timestamps, user_id foreign keys, and Row Level Security policies.

## API Routes

All API functions follow a consistent response format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Meetings
- `getMeetings()` - List all user meetings
- `getMeeting(id)` - Get single meeting
- `createMeeting(input)` - Create meeting (Zod validated)
- `updateMeeting(id, input)` - Update meeting
- `deleteMeeting(id)` - Delete meeting

### Insights
- `getInsights(meetingId?)` - List insights, optionally filtered by meeting
- `createInsight(input)` - Create insight (Zod validated)
- `deleteInsight(id)` - Delete insight

### Chat
- `getChatHistory()` - Get all chat messages
- `saveChatMessage(role, content)` - Save a message
- `clearChatHistory()` - Clear all messages

### Profile
- `getProfile()` - Get user profile
- `updateProfile(input)` - Update profile (Zod validated)

## Project Structure

```
src/
  components/     # Reusable UI components
    ui/           # shadcn/ui primitives
  hooks/          # Custom React hooks (useAuth, useTheme, useMobile)
  integrations/   # Supabase client and types
  lib/            # API routes, Zod schemas, utilities
  pages/          # Route page components
  types/          # TypeScript type definitions
supabase/
  functions/      # Edge functions (BRD generation, AI chat)
  migrations/     # SQL migrations
```

## Author

**Ayush Kumar Jha** - [GitHub](https://github.com/ayushjhaa1187-spec)

## License

This project is private.
