# Changelog

All notable changes to MeetingWeaver Insights will be documented in this file.

## [1.0.0] - 2026-04-06

### Added
- **Authentication**: Full Supabase auth with email/password, Google OAuth, password reset
- **Database**: New tables for profiles, meetings, insights, and chat_history with RLS policies
- **Meeting Management**: CRUD operations for meetings with transcript editing, attendee tracking, and action items
- **Insights Page**: AI-generated insights from meetings with sentiment analysis and type categorization
- **AI Chat**: Full chat interface with MeetingWeaver AI system prompt, typing indicator, conversation persistence, and clear functionality
- **Dark Mode**: Theme toggle with system preference detection and localStorage persistence
- **Mobile Support**: Responsive sidebar with hamburger menu for mobile devices
- **Skeleton Loaders**: Loading states for all data-driven pages
- **Empty & Error States**: Informative states with retry actions
- **Custom 404 Page**: Branded 404 with navigation options
- **Footer Component**: Site-wide footer
- **Zod Validation**: Input validation schemas for all data operations
- **CRUD API Layer**: Typed API functions with consistent `{ success, data, error }` response format
- **Documentation**: README with badges, tech stack, env vars, API docs; CHANGELOG; .env.example; .prettierrc

### Changed
- **Theme Colors**: Updated to MeetingWeaver brand colors (light: #f7f6f2/#01696f, dark: #0f0f0f/#4f98a3)
- **Branding**: Updated from "BRD Agent" to "MeetingWeaver Insights" across all components
- **Dashboard**: Now shows meeting-centric stats (meetings, insights, hours, attendees)
- **Sidebar**: Added new navigation items (Meetings, Insights, AI Chat), dark mode toggle, mobile menu
- **Settings**: Added profile section with name editing
- **Auth Page**: Added Google OAuth button, password reset flow, updated branding
- **HTML Meta Tags**: Updated title, description, OG tags for MeetingWeaver

### Fixed
- **AI Chat**: Fixed same-response bug by including full message history in API calls
- **AI Chat**: Added system prompt for consistent MeetingWeaver AI persona
