-- ==============================================================================
-- CodeBuddy AI - Production Database Schema & Row Level Security (RLS)
-- Target: Supabase PostgreSQL (Postgres 15+)
-- ==============================================================================

-- 1. Enable UUID Extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- Table 1: profiles
-- Linked 1:1 with auth.users
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT 'Programming Student',
    avatar_url TEXT,
    preferred_language VARCHAR(32) DEFAULT 'python',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- Table 2: conversations
-- AI Tutoring sessions
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    language VARCHAR(32),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- ==============================================================================
-- Table 3: conversation_messages
-- Messages exchanged in tutoring chat
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.conversation_messages(created_at ASC);

-- ==============================================================================
-- Table 4: practice_problems
-- AI-generated educational challenges
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.practice_problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    language VARCHAR(32) NOT NULL,
    topic VARCHAR(64) NOT NULL,
    difficulty VARCHAR(32) NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    input_description TEXT,
    output_description TEXT,
    constraints TEXT,
    sample_input TEXT,
    sample_output TEXT,
    concept_practiced TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_practice_problems_user_id ON public.practice_problems(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_problems_topic ON public.practice_problems(topic);

-- ==============================================================================
-- Table 5: practice_attempts
-- User code attempts, hints unlocked, and completion state
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.practice_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES public.practice_problems(id) ON DELETE CASCADE,
    submitted_code TEXT,
    hints_used INT NOT NULL DEFAULT 0 CHECK (hints_used >= 0 AND hints_used <= 5),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_practice_attempts_user_id ON public.practice_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_attempts_problem_id ON public.practice_attempts(problem_id);

-- ==============================================================================
-- Table 6: learning_activity
-- Verifiable student engagement log for real dashboard analytics
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.learning_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(64) NOT NULL,
    language VARCHAR(32) NOT NULL,
    topic VARCHAR(64),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_learning_activity_user_id ON public.learning_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_activity_created_at ON public.learning_activity(created_at DESC);

-- ==============================================================================
-- 7. Trigger: Automatically update 'updated_at' columns
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_conversations_updated_at ON public.conversations;
CREATE TRIGGER set_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_practice_attempts_updated_at ON public.practice_attempts;
CREATE TRIGGER set_practice_attempts_updated_at
    BEFORE UPDATE ON public.practice_attempts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 8. Trigger: Automatically create public.profile on auth.users registration
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: Users can NEVER read or manipulate another user's records!
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_activity ENABLE ROW LEVEL SECURITY;

-- profiles Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- conversations Policies
CREATE POLICY "Users can view own conversations"
    ON public.conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
    ON public.conversations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
    ON public.conversations FOR DELETE
    USING (auth.uid() = user_id);

-- conversation_messages Policies (Parent-Child Join check)
CREATE POLICY "Users can view messages in own conversations"
    ON public.conversation_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_messages.conversation_id
            AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in own conversations"
    ON public.conversation_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_messages.conversation_id
            AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages in own conversations"
    ON public.conversation_messages FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_messages.conversation_id
            AND c.user_id = auth.uid()
        )
    );

-- practice_problems Policies
CREATE POLICY "Users can view own practice problems"
    ON public.practice_problems FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create practice problems"
    ON public.practice_problems FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own practice problems"
    ON public.practice_problems FOR DELETE
    USING (auth.uid() = user_id);

-- practice_attempts Policies
CREATE POLICY "Users can view own practice attempts"
    ON public.practice_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create practice attempts"
    ON public.practice_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own practice attempts"
    ON public.practice_attempts FOR UPDATE
    USING (auth.uid() = user_id);

-- learning_activity Policies
CREATE POLICY "Users can view own learning activity"
    ON public.learning_activity FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can record own learning activity"
    ON public.learning_activity FOR INSERT
    WITH CHECK (auth.uid() = user_id);
