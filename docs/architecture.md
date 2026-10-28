# CodeBuddy AI - System Architecture

> **Target Audience:** First-Year BTech CSE (AI/ML) Students & Software Engineering Mentors  
> **Project Tagline:** *Learn to Code. Understand the Logic. Build Confidence.*

---

## 1. Executive Summary & Architectural Overview

**CodeBuddy AI** is an interactive, production-minded educational coding assistant designed to help programming students master **Python, C, C++, and JavaScript**. Rather than acting as a simple "code generator" or answering tool, CodeBuddy AI acts as a **pedagogical mentor**:
- It breaks down code line by line.
- It identifies root causes of runtime and syntax bugs with actionable prevention tips.
- It generates progressive practice problems across 12 computer science topics.
- It enforces a **strictly controlled 5-level progressive hint mechanism**, preventing students from accidentally spoiling algorithms before attempting them.
- It logs learning activities and compiles real, non-fabricated metrics (streak, completion count, language mastery).

```
+---------------------------------------------------------------------------------------+
|                                    USER BROWSER                                       |
|  React 18 + Vite SPA | Monaco Editor | Tailwind CSS | Lucide Icons | Recharts Charts  |
+-------------------------------------------+-------------------------------------------+
                                            | (HTTPS / REST + Supabase Auth JWT)
                                            v
+---------------------------------------------------------------------------------------+
|                               EXPRESS.JS BACKEND (API)                                 |
|  - Security Middleware: Helmet, CORS, Rate-Limiting, Request Size Limits              |
|  - Auth Middleware: Supabase JWT Verification & Claims Extraction                     |
|  - Request Validation: Zod Schemas for Strict Type & Length Checking                   |
|  - Controllers: AI, Conversations, Practice Problems, Attempts, Dashboard, Profile   |
|  - Service Layer: AI Abstraction, Supabase Data Client, Sanitization                  |
+----------------------+------------------------------------+---------------------------+
                       |                                    |
          +------------v------------+          +------------v------------+
          |      AI SERVICE         |          |     PERSISTENCE         |
          |  (Unified AI Provider)  |          |  (Supabase PostgreSQL)  |
          +------------+------------+          +------------+------------+
                       |                                    |
          +------------+------------+          +------------+------------+
          |                         |          | - Row Level Security    |
          v                         v          | - User-Scoped Access    |
+-------------------+     +------------------+ | - Profiles              |
|  Ollama Provider  |     | Gemini Provider  | | - Conversations         |
|  (gemma3:1b local)|     | (Google Gen AI)  | | - Practice & Attempts   |
|  http://127.0.0.1 |     | Official SDK     | | - Learning Activity     |
+-------------------+     +------------------+ +-------------------------+
```

---

## 2. Architectural Principles Explained for First-Year Students

### A. Client-Server Separation
The user interface (Frontend) and business logic (Backend) are completely decoupled:
1. **Frontend (React)**: Handles the visual components, user events, responsive styling, and code editing via Monaco Editor. It never contains private API keys or database service roles.
2. **Backend (Express)**: Manages authentication verification, validates payloads, enforces rate limits, orchestrates AI prompt templates, and communicates with Supabase and AI models.

### B. The AI Provider Abstraction Pattern
In object-oriented and enterprise architecture, we avoid coupling our code directly to a single vendor. We define an abstract interface:
- Both `OllamaProvider` and `GeminiProvider` implement a common contract:
  - `healthCheck()`
  - `generateExplanation(language, code)`
  - `analyzeError(language, code, errorMessage, expectedBehavior)`
  - `generatePracticeProblem(language, topic, difficulty)`
  - `generateHint(level, problemContext, currentCode)`
  - `generateFullSolution(problemContext)`
  - `chat(messages, languageContext)`
- `AIProviderFactory` reads the `AI_PROVIDER` environment variable (`ollama` or `gemini`) and instantiates the proper provider. The frontend receives a standardized, sanitized JSON response regardless of which engine generated it.

### C. The Progressive Hint Security Boundary
A common pitfall in educational software is sending all 5 hint levels and the full solution to the client browser in a single JSON payload and "hiding" them with CSS. Any student inspecting Network DevTools could see the answer immediately!
- In **CodeBuddy AI**, hints are stored and delivered **level by level strictly on-demand**:
  - `POST /api/ai/hints` with `{ problemId, requestedLevel: 1 }` returns ONLY Level 1.
  - The full solution is never provided unless an explicit call to `POST /api/ai/solution` is made, which logs the attempt state to the database.

### D. Safe Code Execution Architecture (No Arbitrary Server-Side Eval)
Executing arbitrary student-submitted C/C++ or Python code directly on an application server using `child_process.exec()` or `eval()` is a **critical security vulnerability** (Remote Code Execution, fork bombs, disk erasure).
- In CodeBuddy AI v1:
  - Code analysis, syntax detection, and debugging are performed through **AI Static Analysis & Pattern Parsing**.
  - A clean abstraction `ExecutionService` is stubbed out for future sandboxing technologies (e.g., Docker containers with resource caps, gVisor, or WebAssembly-based runners like Pyodide for Python in a web worker).

---

## 3. Component Details

### Frontend Architecture
- **State Management**: React Context (`AuthContext` for user session & profile, `ThemeContext` for dark mode).
- **Navigation**: React Router DOM v6 with protected route wrappers (`ProtectedRoute`).
- **Code Editor**: Monaco Editor (the open-source core powering VS Code) with syntax highlighting, line numbers, automatic bracket matching, and font scaling.
- **Data Visualization**: Recharts for dynamic visual metrics (radar chart of language proficiency, bar charts of topic mastery, area chart of activity streak).

### Backend Architecture
- **Directory Layout**: Strict MVC + Services architecture (`controllers/`, `services/`, `middleware/`, `routes/`, `validators/`).
- **Validation**: Zod schema validation on all inputs before reaching controllers.
- **Security**: Helmet HTTP headers, strict CORS policy tied to `FRONTEND_ORIGIN`, IP-based and user-based rate limiters (`express-rate-limit`).

### Persistence & Security (Supabase)
- **Supabase Auth**: Secure JWT-based authentication with bcrypt password hashing managed in `auth.users`.
- **Row Level Security (RLS)**: Enforced directly at the PostgreSQL layer. Even if an attacker guessed another user's UUID, PostgreSQL returns 0 rows because `auth.uid() = user_id`.
