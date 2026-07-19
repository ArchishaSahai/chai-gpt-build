# ChaiGPT Build – AI Tools & Chat Branching

An AI-powered chatbot built with **Next.js 16**, **AI SDK**, **OpenAI**, **Prisma**, **Clerk**, and **PostgreSQL**, extended with production-style AI capabilities inspired by modern chat applications like ChatGPT.

This project was completed as part of the ChaiCode Full Stack AI Assignment.

---


**Live Application:** https://chai-gpt-build-phi.vercel.app/

---

## ✨ Features

### 🤖 AI Chat

- Streaming AI responses
- Persistent chat history
- Automatic conversation titles
- Markdown rendering
- Authentication using Clerk

---

## 🌐 Phase 1 — AI Tool Calling (Web Search)

Implemented a production-style tool calling workflow using **Tavily Search API**.

### Features

- Automatic tool invocation by the LLM
- Real-time web search for recent events
- Streaming final AI response
- Graceful loading states
- Error handling for API failures
- Tool execution integrated into chat flow

### Example

**User**

> Who won Wimbledon 2026?

The assistant automatically performs a web search before generating the final response.

---

## 🌳 Phase 2 — Chat Branching

Implemented conversation branching similar to modern AI products.

Users can:

- Create a new branch from any previous message
- Continue conversations independently
- Switch between branches
- Rename branches
- Delete branches
- Preserve conversation history up to the branching point

Each branch behaves like an independent conversation while maintaining the shared history before the selected message.

---

# Tech Stack

- Next.js 16
- React 19
- TypeScript
- AI SDK
- OpenAI
- Tavily Search API
- Prisma ORM
- PostgreSQL
- Clerk Authentication
- React Query
- Tailwind CSS
- shadcn/ui

---

# Architecture

```
User
   │
   ▼
ConversationView
   │
   ▼
API Route
   │
   ├──────────────┐
   │              │
   ▼              ▼
OpenAI        Web Search Tool
                 │
                 ▼
            Tavily API
                 │
                 ▼
          Final AI Response
```

---

# Chat Branching Architecture

```
Conversation A

Message 1
Message 2
Message 3
Message 4

        │
        │ Branch from Message 2
        ▼

Conversation B

Message 1
Message 2
```

Both conversations continue independently after the branching point.

---

# Project Structure

```
app/
 ├── api/
 │     └── chat/
 │            ├── route.ts
 │            └── tools.ts
 │
features/
 ├── ai/
 ├── auth/
 ├── conversation/
 │      ├── actions/
 │      ├── components/
 │      ├── hooks/
 │      └── utils/
 │
lib/
 ├── db.ts
 └── generated/
```

---

# Installation

Clone the repository

```bash
git clone https://github.com/ArchishaSahai/chai-gpt-build.git
```

Install dependencies

```bash
bun install
```

Generate Prisma Client

```bash
bunx prisma generate
```

Run database migrations

```bash
bunx prisma migrate dev
```

Start development server

```bash
bun dev
```

---

# Environment Variables

Create a `.env` file with the following variables.

```env
DATABASE_URL=

OPENAI_API_KEY=

TAVILY_API_KEY=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_CLERK_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_SIGN_UP_URL=
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=
```

---

# Assignment Requirements

## ✅ Phase 1 — AI Tools

- ✔ Web Search Integration
- ✔ Automatic Tool Calling
- ✔ Streaming Responses
- ✔ Loading States
- ✔ Error Handling
- ✔ Tool Response Persistence

---

## ✅ Phase 2 — Chat Branching

- ✔ Branch Creation
- ✔ Branch Navigation
- ✔ Rename Branch
- ✔ Delete Branch
- ✔ Branch Persistence
- ✔ Independent Conversation History

---

# Future Improvements

- Multi-tool support
- Citation cards for search results
- Branch visualization graph
- Branch comparison
- Better automatic branch naming
- Rate limiting
- Multi-model support

---

# Deployment

Deployed on **Vercel**.

---

# Author

**Archisha Sahai**

GitHub: https://github.com/ArchishaSahai

---

# License

This project is built for educational purposes as part of the ChaiCode Full Stack AI Assignment.