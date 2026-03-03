# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Node.js 20+ required; uses nvm if available)
npm run dev:daemon   # Start dev server in background, logs to logs.txt
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run tests with Vitest
npm run setup        # Full setup: npm install + prisma generate + prisma migrate dev
npm run db:reset     # Reset database (destructive)
```

To run a single test file:
```bash
npx vitest run src/path/to/file.test.ts
```

Node.js 20+ is required. If on an older version, use: `nvm use 20`.

## Architecture Overview

**UIGen** is an AI-powered React component generator. Users describe components in natural language, Claude generates/edits the code via tool calls, and a live iframe preview renders the result.

### Core Data Flow

1. User sends a prompt → `/api/chat` receives messages + serialized virtual file system
2. Claude streams a response, making tool calls (`str_replace_editor`, `file_manager`) to create/modify files
3. Tool results are applied to the `VirtualFileSystem` in the client context
4. The preview iframe re-renders by transforming JSX with Babel standalone + esm.sh import maps
5. If authenticated, messages and file system state are persisted to SQLite via Prisma

### Key Abstractions

- **VirtualFileSystem** ([src/lib/file-system.ts](src/lib/file-system.ts)) — In-memory tree of files/dirs. Serialized to JSON for database storage and sent with every API request. All Claude tool calls operate against this.
- **JSX Transformer** ([src/lib/transform/jsx-transformer.ts](src/lib/transform/jsx-transformer.ts)) — Babel standalone transforms JSX to JS, generates import maps pointing to esm.sh, and builds blob URLs for iframe rendering. Entry point is always `App.jsx`.
- **Chat API Route** ([src/app/api/chat/route.ts](src/app/api/chat/route.ts)) — Streams Claude responses with tool use. Uses Anthropic prompt caching. `maxDuration: 120`.
- **FileSystemContext** ([src/lib/contexts/file-system-context.tsx](src/lib/contexts/file-system-context.tsx)) — Holds VirtualFileSystem state and `handleToolCall` which applies Claude's tool results client-side.
- **ChatProvider** ([src/lib/contexts/chat-context.tsx](src/lib/contexts/chat-context.tsx)) — Manages message history, streams from `/api/chat`, and dispatches tool calls to FileSystemContext.

### Authentication & Sessions

- JWT stored in HTTP-only cookies via `jose`. Secret from `JWT_SECRET` env var (defaults to `"development-secret-key"`).
- Anonymous users work in sessionStorage; on sign-in, anonymous work is migrated to a new project.
- Authenticated users have projects persisted: `Project.messages` (JSON string) and `Project.data` (JSON string of file system).

### Database

Prisma + SQLite. Schema in [prisma/schema.prisma](prisma/schema.prisma). Generated client output: `src/generated/prisma`.

Models: `User` (email/password with bcrypt) → `Project` (name, messages JSON, data JSON).

### Mock Mode

When `ANTHROPIC_API_KEY` is absent/empty, the app uses `MockLanguageModel` which returns static demo components with simulated delays — no API costs.

## Environment Variables

```env
ANTHROPIC_API_KEY=   # Optional. If empty, uses MockLanguageModel for demo
JWT_SECRET=          # Optional. Defaults to "development-secret-key"
```

## Tech Stack

- **Framework**: Next.js 15 App Router with React 19
- **AI**: Anthropic SDK with streaming + tool use (`str_replace_editor`, `file_manager`)
- **Styling**: Tailwind CSS v4 (PostCSS)
- **Components**: Radix UI primitives under `src/components/ui/`
- **Code Editor**: Monaco Editor
- **ORM**: Prisma with SQLite
- **Testing**: Vitest
- **Path alias**: `@/*` → `src/*`
