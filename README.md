# Sports Bet Tracker

Lean MVP full-stack betting tracker built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, SQLite, and Recharts. The MVP runs locally on SQLite today, while Prisma remains the single database access layer so the app can be moved to Postgres later without major refactoring.

## Features

- Persistent database-backed bet tracking
- Add, edit, delete, and duplicate bets
- Server-rendered dashboard and bets table
- Filters for date range, sport, result, bet type, live/pregame, and parlay/straight
- Centralized betting math and analytics
- Sport breakdown and simple trend charts
- Seed script with realistic sample data that only runs on an empty database

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Prisma
- SQLite
- Recharts
- Zod

## Project Structure

```text
app/                    Pages and API routes
components/             Reusable UI components
lib/prisma.ts           Prisma client
lib/data/               Database access helpers
lib/calculations/       Betting math and analytics
lib/validations/        Zod validation
lib/utils/              Formatting and query helpers
prisma/                 Schema and seed script
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Generate the Prisma client and create the local SQLite schema:

```bash
npm run prisma:generate
npm run prisma:push
```

4. Seed initial sample data:

```bash
npm run seed
```

5. Start the app:

```bash
npm run dev
```

## Validation Commands

```bash
npm run lint
npm run typecheck
npm run build
```

## Notes

- `prisma/dev.db` is the single source of truth.
- Profit/loss is always computed from result, stake, and payout.
- The seed script exits without changing data when bets already exist.
- All app reads and writes go through Prisma and the shared data helpers in `lib/data/`, which keeps the code portable across database providers.

## Future Postgres Deployment

This MVP intentionally keeps Prisma as the only database access layer, so moving from local SQLite to hosted Postgres later should be mostly configuration work.

Typical upgrade steps:

1. Update `prisma/schema.prisma` datasource provider from `sqlite` to `postgresql`.
2. Change `DATABASE_URL` to a Postgres connection string.
3. Run `npm run prisma:generate`.
4. Run a Prisma migration or `prisma db push` against the Postgres database.
5. Deploy with the same application code.

Because the app avoids raw SQL and keeps database access centralized, the rest of the code should require little or no refactoring.

## Hosted Deployment Prep

The codebase is now set up so local development can stay on SQLite while production can move to Postgres later.

Deployment-friendly details already in place:

- Prisma remains the only database access layer.
- `postinstall` runs `prisma generate`, which helps on hosts like Vercel.
- `npm run prisma:migrate:deploy` is available for production migrations.
- Next.js is configured with `outputFileTracingRoot` to avoid workspace root issues during hosted builds.
- A Postgres-ready schema lives at `prisma/schema.postgres.prisma` so local SQLite can stay untouched until you are ready to switch.

### Recommended Production Rollout

1. Push this project to GitHub.
2. Create a hosted Postgres database.
3. Update `prisma/schema.prisma` datasource provider from `sqlite` to `postgresql`.
4. Set production `DATABASE_URL` in your host environment.
5. Run `npm run prisma:generate`.
6. Run `npm run prisma:migrate:deploy` in production, or push the schema before first deploy.
7. Deploy the app to Vercel.

If you want to test the Postgres schema before fully switching the repo, you can use:

```bash
npm run prisma:generate:postgres
npm run prisma:push:postgres
```

Those commands use `prisma/schema.postgres.prisma` and do not change the default local SQLite workflow.

### Production Environment Variables

At minimum, production will need:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
```

You can copy [.env.production.example](/Users/gavindeuser/Documents/Playground/.env.production.example) when you are ready to configure hosted deployment.

### Before You Switch Providers

Keep local MVP development on SQLite until you are ready to deploy publicly. When you are ready:

- back up `prisma/dev.db`
- move the existing data into Postgres
- switch the Prisma datasource
- deploy using the same app code
