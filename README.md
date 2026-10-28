# CodeBuddy AI 🚀
> **Learn to Code. Understand the Logic. Build Confidence.**

**CodeBuddy AI** is a production-grade full-stack pedagogical programming tutor specifically designed for **first-year BTech CSE (AI/ML) students** and programming educators. It supports **Python, C, C++, and JavaScript** through line-by-line code explanations, root-cause debugging, progressive 5-level hint gating, and persistent learning history.

---

## 📑 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Node.js Installation](#2-nodejs-installation)
3. [Project Installation](#3-project-installation)
4. [Ollama Installation (Local AI)](#4-ollama-installation-local-ai)
5. [Downloading Gemma Model](#5-downloading-gemma-model)
6. [Testing the Model in Terminal](#6-testing-the-model-in-terminal)
7. [Creating a Supabase Project](#7-creating-a-supabase-project)
8. [Applying Database Migrations](#8-applying-database-migrations)
9. [Configuring Environment Files](#9-configuring-environment-files)
10. [Installing Frontend Dependencies](#10-installing-frontend-dependencies)
11. [Installing Backend Dependencies](#11-installing-backend-dependencies)
12. [Starting the Backend Server](#12-starting-the-backend-server)
13. [Starting the Frontend App](#13-starting-the-frontend-app)
14. [Selecting the Ollama Provider (Free & Offline)](#14-selecting-the-ollama-provider-free--offline)
15. [Selecting the Gemini Provider (Cloud AI)](#15-selecting-the-gemini-provider-cloud-ai)
16. [Testing AI Requests](#16-testing-ai-requests)
17. [Running Automated Tests](#17-running-automated-tests)
18. [Troubleshooting Common Errors](#18-troubleshooting-common-errors)

---

## 1. Prerequisites
- **Operating System:** Windows 10/11 (or macOS / Linux)
- **PowerShell:** Version 5.1 or newer (default on Windows 10/11)
- **Node.js:** v18.0.0 or newer (tested on Node v24)
- **Memory (RAM):** 8 GB minimum (16 GB recommended for running local models)

---

## 2. Node.js Installation
If Node.js is not installed:
1. Download Node.js LTS from: https://nodejs.org/
2. Run the installer and check the box to install Chocolatey / Build Tools if prompted.
3. Verify in PowerShell:
   ```powershell
   node -v
   npm -v
   ```

---

## 3. Project Installation
Clone or navigate to the project directory:
```powershell
cd C:\Users\<YourUser>\Desktop\Hacktoberfest
```

---

## 4. Ollama Installation (Local AI)
Ollama runs LLMs locally on your computer with complete privacy and zero API costs.
1. Download the Windows installer from: https://ollama.com/download/windows
2. Run `OllamaSetup.exe`.
3. Verify in PowerShell:
   ```powershell
   ollama --version
   ```
4. Verify the Ollama service is listening:
   ```powershell
   Invoke-RestMethod -Uri http://127.0.0.1:11434/ -Method Get
   # Should output: "Ollama is running"
   ```

---

## 5. Downloading Gemma Model
Download Google's Gemma 3:1B parameter model:
```powershell
ollama pull gemma3:1b
```
To verify the model is downloaded:
```powershell
ollama list
```
You should see:
```text
NAME         ID              SIZE      MODIFIED
gemma3:1b    97558784bdc9    806 MB    ...
```

---

## 6. Testing the Model in Terminal
Verify the model responds to prompts in PowerShell:
```powershell
ollama run gemma3:1b "Explain why arrays in C are 0-indexed in two sentences."
```
Type `/bye` to exit the chat interactive mode.

---

## 7. Creating a Supabase Project
1. Go to https://supabase.com and create a free account.
2. Click **New Project** and name it `CodeBuddy-AI`.
3. Choose a region close to you and set a secure database password.
4. Once provisioned, navigate to **Project Settings -> API**:
   - Copy **Project URL** (`https://xyzcompany.supabase.co`)
   - Copy **Project API anon / public key** (`eyJhbGci...`)

---

## 8. Applying Database Migrations
1. In the Supabase Dashboard, click on **SQL Editor** in the left sidebar.
2. Click **New Query**.
3. Open the file `backend/supabase/migrations/20261028000000_initial_schema.sql` from this repository.
4. Copy its contents, paste them into the Supabase SQL Editor, and click **Run**.
5. Confirm the tables are created: `profiles`, `conversations`, `conversation_messages`, `practice_problems`, `practice_attempts`, `learning_activity`.
6. Confirm **Row Level Security (RLS)** is enabled on all tables.

---

## 9. Configuring Environment Files

### Backend Configuration
Copy `.env.example` to `.env`:
```powershell
cp backend/.env.example backend/.env
```
Edit `backend/.env` with your preferred settings:
```env
PORT=5000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173

# Supabase Credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key

# AI Provider Selection: 'ollama' or 'gemini'
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=gemma3:1b

# Google Gemini (if using gemini provider)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

AI_REQUEST_TIMEOUT_MS=60000
```

### Frontend Configuration
Copy `.env.example` to `.env`:
```powershell
cp frontend/.env.example frontend/.env
```
Edit `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

---

## 10. Installing Frontend Dependencies
```powershell
cd frontend
npm install
cd ..
```

---

## 11. Installing Backend Dependencies
```powershell
cd backend
npm install
cd ..
```

---

## 12. Starting the Backend Server
From the root or backend directory:
```powershell
cd backend
npm run dev
```
Output:
```text
==================================================
  CodeBuddy AI Backend Server Running on :5000
  Environment : development
  AI Provider : OLLAMA
  AI Model    : gemma3:1b
  CORS Origin : http://localhost:5173
==================================================
AI Provider Status: ONLINE (42ms latency)
```

---

## 13. Starting the Frontend App
Open a separate PowerShell terminal window:
```powershell
cd frontend
npm run dev
```
Visit: **`http://localhost:5173`** in your browser.

> **Tip:** You can also run both servers concurrently from the project root using:
> ```powershell
> npm run dev
> ```

---

## 14. Selecting the Ollama Provider (Free & Offline)
To run CodeBuddy AI 100% offline using your local Gemma 3:1B model:
1. Ensure Ollama is running (`ollama list`).
2. In `backend/.env`, set:
   ```env
   AI_PROVIDER=ollama
   OLLAMA_BASE_URL=http://127.0.0.1:11434
   OLLAMA_MODEL=gemma3:1b
   ```
3. Restart the backend server. The navbar badge in the UI will display: `ollama: gemma3:1b` with a green pulse dot.

---

## 15. Selecting the Gemini Provider (Cloud AI)
To switch to Google Gemini:
1. Get a free API key from [Google AI Studio](https://aistudio.google.com/).
2. In `backend/.env`, set:
   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=AIzaSy...
   GEMINI_MODEL=gemini-2.5-flash
   ```
3. Restart the backend server. The UI navbar badge will immediately reflect `gemini: gemini-2.5-flash`.

---

## 16. Testing AI Requests

### Testing System Health
```powershell
Invoke-RestMethod -Uri http://localhost:5000/api/health -Method Get
```

### Testing AI Provider Health
```powershell
Invoke-RestMethod -Uri http://localhost:5000/api/health/ai -Method Get
```

### Testing Code Explainer Endpoint
```powershell
$body = @{
    language = "python"
    code = "def add(a, b): return a + b"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:5000/api/ai/explain -Method Post -Body $body -ContentType "application/json"
```

---

## 17. Running Automated Tests
Run the Vitest and Supertest automated test suite:
```powershell
cd backend
npm test
```
Expected output:
```text
 ✓ tests/api.test.js (11 tests) 151ms
 Test Files  1 passed (1)
      Tests  11 passed (11)
```

---

## 18. Troubleshooting Common Errors

| Error Symptom | Probable Cause | Action / Resolution |
| :--- | :--- | :--- |
| `ECONNREFUSED 127.0.0.1:11434` | Ollama service is stopped | Run `ollama serve` or open the Ollama Windows application. |
| `model 'gemma3:1b' not found` | Gemma model not yet pulled | Run `ollama pull gemma3:1b` in PowerShell. |
| `API_KEY_INVALID` (Gemini) | Missing or bad Gemini key | Verify `GEMINI_API_KEY` in `backend/.env`. |
| `401 Unauthorized` | Missing Bearer token on protected route | Log in via `/login` to generate a session JWT. |
| `Progressive hints only support levels 1 through 4` | Requesting Level 5 on hint endpoint | Use `/api/ai/solution` for full solutions as required by the security policy. |
| `Port 5000 already in use` | Another service is using port 5000 | Change `PORT=5001` in `backend/.env` and update `VITE_API_BASE_URL` in `frontend/.env`. |

---

## 🎓 Pedagogical Note for 1st Year CSE Students
When learning to program, avoid relying on instant code completion. Use CodeBuddy AI to understand:
1. **Control flow:** Order of execution in conditional branches and nested loops.
2. **Variable scopes:** How local vs global variables persist in stack frames.
3. **Pointers & Memory:** Why addresses must point to valid allocations before dereferencing in C/C++.
4. **Time & Space Complexity:** Big-O growth rate of your algorithms.
