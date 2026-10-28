# CodeBuddy AI - REST API Documentation

Base URL: `http://localhost:5000/api`

All JSON responses follow a standardized payload structure:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional descriptive status message"
}
```
Error format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | AUTH_ERROR | AI_TIMEOUT | NOT_FOUND | SERVER_ERROR",
    "message": "Human-readable explanation of error",
    "details": []
  }
}
```

---

## 1. System Health

### GET `/api/health`
Checks overall backend status.
- **Auth:** Public
- **Response `200`:**
  ```json
  {
    "success": true,
    "data": {
      "status": "healthy",
      "timestamp": "2026-10-28T06:30:00Z",
      "uptime": 128.4
    }
  }
  ```

### GET `/api/health/ai`
Checks active AI provider health and connectivity (Ollama or Gemini).
- **Auth:** Public
- **Response `200`:**
  ```json
  {
    "success": true,
    "data": {
      "provider": "ollama",
      "model": "gemma3:1b",
      "isHealthy": true,
      "latencyMs": 42
    }
  }
  ```

---

## 2. Authentication & Profile

### GET `/api/auth/me`
Retrieves currently authenticated user details decoded from Supabase JWT.
- **Auth:** Bearer Token
- **Headers:** `Authorization: Bearer <supabase_jwt>`
- **Response `200`:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "uuid-v4",
        "email": "student@college.edu",
        "displayName": "Aarav Sharma"
      }
    }
  }
  ```

### GET `/api/profile`
Fetches user profile data from `profiles` table.
- **Auth:** Bearer Token

### PATCH `/api/profile`
Updates profile display name and preferences.
- **Body:** `{ "displayName": "Aarav S." }`

---

## 3. AI Capabilities

### POST `/api/ai/explain`
Generates a structured, beginner-friendly line-by-line explanation of code.
- **Auth:** Optional / Recommended Bearer Token
- **Body:**
  ```json
  {
    "language": "python",
    "code": "def fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)"
  }
  ```
- **Response `200`:**
  ```json
  {
    "success": true,
    "data": {
      "summary": "This is a recursive function calculating the nth Fibonacci number.",
      "concepts": ["Recursion", "Base Conditions", "Function Call Stack"],
      "lineByLine": [
        { "line": 1, "code": "def fib(n):", "explanation": "Defines a function named fib taking integer argument n." },
        { "line": 2, "code": "if n <= 1: return n", "explanation": "Base case: stops recursion when n is 0 or 1." },
        { "line": 3, "code": "return fib(n-1) + fib(n-2)", "explanation": "Recursive step: calls itself twice with smaller inputs." }
      ],
      "relatedExample": {
        "title": "Iterative Fibonacci",
        "code": "def fib_iter(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a",
        "takeaway": "Iterative approaches take O(N) time and prevent stack overflow."
      }
    }
  }
  ```

### POST `/api/ai/debug`
Pinpoints syntax and logical errors with minimal recommended fixes.
- **Body:**
  ```json
  {
    "language": "c",
    "code": "int main() { int *p; *p = 10; return 0; }",
    "errorMessage": "Segmentation fault (core dumped)",
    "expectedBehavior": "Store integer 10 in dynamically allocated memory"
  }
  ```
- **Response `200`:**
  ```json
  {
    "success": true,
    "data": {
      "problem": "Uninitialized pointer dereference (Wild Pointer).",
      "cause": "Pointer 'p' points to an arbitrary memory address because it was not allocated with malloc or pointed to a valid variable.",
      "line": 1,
      "isSyntaxError": false,
      "suggestedFix": "int main() {\n    int val;\n    int *p = &val;\n    *p = 10;\n    return 0;\n}",
      "explanation": "Assigning the address of 'val' to 'p' ensures memory is safely mapped before dereferencing.",
      "preventionTip": "Always initialize pointers to NULL or a valid memory address upon declaration."
    }
  }
  ```

### POST `/api/ai/practice/generate`
Generates a targeted programming challenge.
- **Body:**
  ```json
  {
    "language": "python",
    "topic": "Loops",
    "difficulty": "Beginner"
  }
  ```

### POST `/api/ai/hints`
Retrieves a specific progressive hint level (1 through 4) without spoiling the full solution.
- **Body:**
  ```json
  {
    "problemId": "uuid-v4",
    "level": 1,
    "problemContext": { "title": "Sum of Evens", "description": "..." },
    "studentCode": "..."
  }
  ```

### POST `/api/ai/solution`
Explicit action required to reveal the Level 5 full solution.
- **Body:**
  ```json
  {
    "problemId": "uuid-v4",
    "problemContext": { ... }
  }
  ```

### POST `/api/ai/chat`
Interactive tutor chat with memory of past turns.
- **Body:**
  ```json
  {
    "conversationId": "uuid-v4",
    "language": "cpp",
    "message": "Why do we use std::vector instead of raw arrays in C++?",
    "history": []
  }
  ```

---

## 4. Conversations & Learning Management

- `GET /api/conversations` - List conversations for user
- `POST /api/conversations` - Start new conversation
- `GET /api/conversations/:id` - Get full message history
- `PATCH /api/conversations/:id` - Rename conversation title
- `DELETE /api/conversations/:id` - Delete conversation
- `GET /api/practice` - Get practice problems generated for user
- `POST /api/practice` - Save a practice problem
- `GET /api/practice/:id` - Get practice problem details
- `POST /api/practice/:id/attempts` - Submit an attempt or save hint progress
- `GET /api/dashboard/stats` - Calculated real statistics
- `GET /api/dashboard/activity` - Recent activity stream
