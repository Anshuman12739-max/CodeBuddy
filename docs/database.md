# CodeBuddy AI - Database Schema & Supabase Architecture

CodeBuddy AI uses **Supabase PostgreSQL** as its primary persistence engine, incorporating **Row Level Security (RLS)**, UUID primary keys, and foreign key constraints to ensure strict multi-tenant isolation.

---

## 1. Entity Relationship Overview

```
auth.users (Supabase Managed)
    |
    +-----> profiles (1:1)
    |
    +-----> conversations (1:N)
    |           |
    |           +-----> conversation_messages (1:N)
    |
    +-----> practice_problems (1:N)
    |           |
    |           +-----> practice_attempts (1:N)
    |
    +-----> learning_activity (1:N)
```

---

## 2. Table Specifications

### A. `profiles`
Stores extended user profile information linked to the authenticated user.
- `id`: `UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
- `display_name`: `TEXT NOT NULL`
- `created_at`: `TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL`
- `updated_at`: `TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL`

### B. `conversations`
Represents an AI tutoring conversation session.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `user_id`: `UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
- `title`: `TEXT NOT NULL DEFAULT 'New Conversation'`
- `language`: `VARCHAR(32)` (e.g. `python`, `c`, `cpp`, `javascript`)
- `created_at`: `TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL`
- `updated_at`: `TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL`

### C. `conversation_messages`
Stores individual chat messages in a conversation.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `conversation_id`: `UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE`
- `role`: `TEXT NOT NULL CHECK (role IN ('user', 'assistant'))`
- `content`: `TEXT NOT NULL`
- `created_at`: `TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL`

### D. `practice_problems`
Holds AI-generated programming challenges generated for a user.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `user_id`: `UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
- `language`: `VARCHAR(32) NOT NULL`
- `topic`: `VARCHAR(64) NOT NULL`
- `difficulty`: `VARCHAR(32) NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced'))`
- `title`: `TEXT NOT NULL`
- `description`: `TEXT NOT NULL`
- `input_description`: `TEXT`
- `output_description`: `TEXT`
- `constraints`: `TEXT`
- `sample_input`: `TEXT`
- `sample_output`: `TEXT`
- `created_at`: `TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL`

### E. `practice_attempts`
Tracks user submissions and hint progression on practice problems.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `user_id`: `UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
- `problem_id`: `UUID NOT NULL REFERENCES practice_problems(id) ON DELETE CASCADE`
- `submitted_code`: `TEXT`
- `hints_used`: `INT NOT NULL DEFAULT 0 CHECK (hints_used >= 0 AND hints_used <= 5)`
- `completed`: `BOOLEAN NOT NULL DEFAULT FALSE`
- `created_at`: `TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL`
- `updated_at`: `TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL`

### F. `learning_activity`
Audit log of student engagement used to compute real dashboard statistics (streak, completion count, top languages).
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `user_id`: `UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
- `activity_type`: `VARCHAR(64) NOT NULL` (`code_explained`, `debug_assisted`, `problem_generated`, `hint_viewed`, `problem_completed`)
- `language`: `VARCHAR(32) NOT NULL`
- `topic`: `VARCHAR(64)`
- `metadata`: `JSONB DEFAULT '{}'::jsonb`
- `created_at`: `TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL`

---

## 3. Row Level Security (RLS) Strategy

Every single user-scoped table enables RLS via:
```sql
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
```

Policies enforce that `auth.uid() = user_id`:
```sql
CREATE POLICY "Users can only read own data" ON <table>
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert own data" ON <table>
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update own data" ON <table>
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete own data" ON <table>
  FOR DELETE USING (auth.uid() = user_id);
```

For child tables like `conversation_messages`, RLS validates ownership by joining with parent `conversations.user_id = auth.uid()`.
