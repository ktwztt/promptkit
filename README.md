# PromptKit

AI Prompt Workspace — clean, optimize, translate, and manage prompts for every AI model.

## Features

- **Prompt Cleaner** — Remove markdown, HTML, emoji, and normalize formatting
- **Prompt Optimizer** — Auto-optimize prompts for ChatGPT, Claude, Gemini, Grok, DeepSeek
- **Prompt Translator** — Translate prompts while preserving logic and structure
- **Token Counter** — Count tokens, estimate costs, check context limits
- **Prompt Library** — Save, organize, tag, favorite, and version your prompts

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** SQLite (via Prisma 7 + libsql)
- **Auth:** Better Auth (email/password, GitHub, Google)
- **AI:** Vercel AI SDK + OpenAI

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your keys

# Run database migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite database URL (default: `file:./dev.db`) |
| `BETTER_AUTH_SECRET` | Auth secret (generate with `openssl rand -hex 32`) |
| `OPENAI_API_KEY` | OpenAI API key for optimizer/translator |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── tools/
│   │   │   ├── cleaner/      # Prompt Cleaner
│   │   │   ├── optimizer/    # Prompt Optimizer
│   │   │   ├── translator/   # Prompt Translator
│   │   │   └── token-counter/# Token Counter
│   │   └── library/          # Prompt Library
│   ├── api/                  # API routes
│   ├── sign-in/              # Sign in page
│   └── sign-up/              # Sign up page
├── components/
│   └── ui/                   # shadcn/ui components
└── lib/                      # Utilities, auth, DB, AI
```

## License

MIT
