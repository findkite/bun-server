# Better Auth + PostgreSQL + Drizzle ORM Setup

## 📋 Prerequisites
- PostgreSQL database running
- Bun installed

## 🚀 Quick Start

### 1. Copy Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local with your database credentials
```

### 2. Create Database
```bash
# PostgreSQL
createdb bun_server
```

### 3. Push Schema to Database
```bash
bun run db:push
```

### 4. Start Development Server
```bash
bun run dev
```

## 📚 Available Commands

- `bun run dev` - Start dev server with hot reload
- `bun run db:push` - Push schema changes to database
- `bun run db:migrate` - Run migrations
- `bun run db:studio` - Open Drizzle Studio for data visualization

## 🔐 Authentication Endpoints

After starting the server, these auth routes are available:

- `POST /api/auth/sign-up` - Register new user
- `POST /api/auth/sign-in` - Login user
- `POST /api/auth/sign-out` - Logout user
- `GET /api/auth/session` - Get current session
- `POST /api/auth/change-password` - Change password

## 🔗 WebSocket Connection

Connect to WebSocket with a valid session token:

```bash
# After logging in, get the session token
# Then connect:
ws://localhost:4000/ws?token=SESSION_TOKEN

# Or use Authorization header
ws://localhost:4000/ws
# Headers: Authorization: Bearer SESSION_TOKEN
```

## 📁 Project Structure

```
src/
├── index.ts          # Main app with WebSocket
├── auth.ts           # Better Auth configuration
└── db/
    ├── index.ts      # Database connection
    └── schema.ts     # Drizzle ORM schema
```

## 🛠️ Adding OAuth Providers

Update `src/auth.ts` socialProviders section:

```typescript
socialProviders: {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
}
```

## 📝 Notes

- Session tokens are automatically set in cookies during auth
- WebSocket validates sessions before opening connections
- All messages include user context (id, email)
- Errors are returned as structured JSON with error codes
