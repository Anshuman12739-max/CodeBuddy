# CodeBuddy AI - Troubleshooting Guide

This guide covers common development and deployment issues when setting up or running CodeBuddy AI on Windows and Linux/macOS.

---

## 1. Ollama Issues

### Issue A: `ECONNREFUSED 127.0.0.1:11434`
**Symptom:** AI endpoints return `"AI provider connection failed: Ollama is unreachable at http://127.0.0.1:11434"`.
**Resolution:**
1. Check if Ollama service is running:
   ```powershell
   ollama list
   ```
2. If not running, start Ollama:
   ```powershell
   ollama serve
   ```
3. Test connectivity in PowerShell:
   ```powershell
   Invoke-RestMethod -Uri http://127.0.0.1:11434/ -Method Get
   # Expected output: "Ollama is running"
   ```

### Issue B: `model 'gemma3:1b' not found`
**Symptom:** Ollama is running but AI requests error out stating the model does not exist.
**Resolution:**
Run the pull command in PowerShell:
```powershell
ollama pull gemma3:1b
```
Verify with:
```powershell
ollama run gemma3:1b "Hello"
```

---

## 2. Gemini API Issues

### Issue A: `API_KEY_INVALID` or `401 Unauthorized`
**Symptom:** Backend returns Gemini authorization error.
**Resolution:**
1. Check `backend/.env` file. Ensure `GEMINI_API_KEY` is present and valid.
2. Ensure no spaces or quotes exist around the key.
3. Test if model `GEMINI_MODEL=gemini-2.5-flash` or `gemini-1.5-flash` is enabled in your Google AI Studio project.

### Issue B: `RESOURCE_EXHAUSTED` (Rate limit or quota)
**Symptom:** Error `429 Too Many Requests`.
**Resolution:**
- Wait 60 seconds for quota replenishment.
- Alternatively, toggle `AI_PROVIDER=ollama` in `backend/.env` to switch to the free, offline local Ollama model immediately!

---

## 3. Supabase Database & Auth Issues

### Issue A: `relation "profiles" does not exist`
**Symptom:** Database queries return 500 or SQL syntax error.
**Resolution:**
1. Go to your Supabase project dashboard -> SQL Editor.
2. Open `backend/supabase/migrations/20261028_initial_schema.sql`.
3. Paste and click **Run**.
4. Confirm tables are created under the `public` schema.

### Issue B: CORS or JWT Verification Failure
**Symptom:** Requests return 401 Unauthorized or CORS preflight blocked.
**Resolution:**
1. Ensure `FRONTEND_ORIGIN=http://localhost:5173` is set in `backend/.env`.
2. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `frontend/.env` match `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `backend/.env`.

---

## 4. Port Conflicts

### Port 5000 in use:
Change `PORT=5001` in `backend/.env` and update `VITE_API_BASE_URL=http://localhost:5001/api` in `frontend/.env`.

### Port 5173 in use:
Vite will automatically pick 5174 or specify `--port 5173` in `npm run dev`.
