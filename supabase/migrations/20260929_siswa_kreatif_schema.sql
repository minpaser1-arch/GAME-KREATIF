-- ============================================================================
-- SKEMA DATABASE RESMI: SISWA KREATIF DENGAN GAME KREATIF
-- MADRASAH IBTIDAIYAH NEGERI 1 PASER (MIN 1 PASER)
-- KABUPATEN PASER, KALIMANTAN TIMUR
-- TAHUN PELAJARAN 2026/2027
-- Kepala Madrasah: Ismail, S.Ag
-- Pengembang: Dzakirul Husni, S.Pd.
-- Target: Supabase PostgreSQL dengan Row Level Security (RLS)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'guru');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE semester_type AS ENUM ('ganjil', 'genap');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('mudah', 'sedang', 'sulit', 'hots');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE question_type AS ENUM ('pilihan_ganda', 'benar_salah', 'isian_singkat', 'uraian');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE question_status AS ENUM ('perlu_ditinjau', 'disetujui', 'diarsipkan');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE game_status AS ENUM ('setup', 'active', 'paused', 'completed', 'abandoned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Terkoneksi dengan auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role DEFAULT 'guru'::user_role NOT NULL,
    nip VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. ACADEMIC YEARS (Tahun Pelajaran)
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE, -- e.g. '2026/2027'
    is_active BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. SEMESTERS
CREATE TABLE IF NOT EXISTS public.semesters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    type semester_type NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_ay_semester UNIQUE (academic_year_id, type)
);

-- 6. SUBJECTS (Mata Pelajaran MIN 1 Paser)
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    fase VARCHAR(50) DEFAULT 'Fase C' NOT NULL,
    grade VARCHAR(50) DEFAULT 'Kelas VI' NOT NULL,
    description TEXT,
    color VARCHAR(20) DEFAULT '#0284C7',
    icon_name VARCHAR(50) DEFAULT 'BookOpen',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. LEARNING MATERIALS & OBJECTIVES (Materi & Tujuan Pembelajaran)
CREATE TABLE IF NOT EXISTS public.learning_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    chapter VARCHAR(100) NOT NULL,
    material TEXT NOT NULL,
    submaterial TEXT,
    learning_objective TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. QUESTIONS (Bank Soal)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    semester_id UUID REFERENCES public.semesters(id) ON DELETE SET NULL,
    fase VARCHAR(50) DEFAULT 'Fase C' NOT NULL,
    grade VARCHAR(50) DEFAULT 'Kelas VI' NOT NULL,
    chapter VARCHAR(100),
    material TEXT NOT NULL,
    submaterial TEXT,
    learning_objective TEXT,
    difficulty difficulty_level DEFAULT 'sedang'::difficulty_level NOT NULL,
    type question_type DEFAULT 'pilihan_ganda'::question_type NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB, -- Array string pilihan jawaban: ["A. ...", "B. ...", "C. ...", "D. ..."]
    correct_answer VARCHAR(255) NOT NULL,
    explanation TEXT,
    source VARCHAR(50) DEFAULT 'manual' NOT NULL, -- 'ai_gemini' | 'manual' | 'import'
    status question_status DEFAULT 'perlu_ditinjau'::question_status NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. QUESTION SETS (Paket Soal Permainan)
CREATE TABLE IF NOT EXISTS public.question_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
    semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE RESTRICT,
    grade VARCHAR(50) DEFAULT 'Kelas VI' NOT NULL,
    description TEXT,
    is_archived BOOLEAN DEFAULT false NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. QUESTION SET ITEMS (Relasi Many-to-Many Soal ke Paket)
CREATE TABLE IF NOT EXISTS public.question_set_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_set_id UUID NOT NULL REFERENCES public.question_sets(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE RESTRICT,
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_set_question UNIQUE (question_set_id, question_id)
);

-- 11. GAME SESSIONS (Sesi Permainan Langsung di Kelas)
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    question_set_id UUID NOT NULL REFERENCES public.question_sets(id) ON DELETE RESTRICT,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
    semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE RESTRICT,
    turn_mode VARCHAR(50) DEFAULT 'round_robin' NOT NULL, -- 'round_robin' | 'teacher_select'
    current_question_index INT DEFAULT 0 NOT NULL,
    current_team_id UUID,
    status game_status DEFAULT 'setup'::game_status NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ended_at TIMESTAMPTZ,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. GAME TEAMS (8 Kelompok Permainan)
CREATE TABLE IF NOT EXISTS public.game_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- Garuda, Elang, Rajawali, Cendekia, Kreator, Inovator, Juara, Bintang
    color VARCHAR(20) NOT NULL,
    points INT DEFAULT 0 NOT NULL,
    stars INT DEFAULT 0 NOT NULL,
    correct_answers INT DEFAULT 0 NOT NULL,
    wrong_answers INT DEFAULT 0 NOT NULL,
    total_answered INT DEFAULT 0 NOT NULL,
    consecutive_errors INT DEFAULT 0 NOT NULL,
    current_streak INT DEFAULT 0 NOT NULL,
    is_eliminated BOOLEAN DEFAULT false NOT NULL,
    eliminated_at TIMESTAMPTZ,
    elimination_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. GAME TEAM MEMBERS (Maksimal 4 Siswa per Kelompok)
CREATE TABLE IF NOT EXISTS public.game_team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_team_id UUID NOT NULL REFERENCES public.game_teams(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    nisn VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 14. GAME ANSWERS (Pencatatan Jawaban dan Audit Skor)
CREATE TABLE IF NOT EXISTS public.game_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE RESTRICT,
    question_index INT NOT NULL,
    game_team_id UUID NOT NULL REFERENCES public.game_teams(id) ON DELETE CASCADE,
    submitted_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    points_earned INT DEFAULT 0 NOT NULL,
    bonus_stars_earned INT DEFAULT 0 NOT NULL,
    consecutive_errors_at_answer INT NOT NULL,
    streak_at_answer INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_session_question_answer UNIQUE (game_session_id, question_id, question_index)
);

-- 15. GAME EVENTS (Audit Log Peristiwa Permainan)
CREATE TABLE IF NOT EXISTS public.game_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- GAME_STARTED, ANSWER_CORRECT, ANSWER_WRONG, BONUS_STARS, TEAM_ELIMINATED, GAME_COMPLETED
    game_team_id UUID REFERENCES public.game_teams(id) ON DELETE SET NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL,
    details TEXT NOT NULL,
    points_awarded INT DEFAULT 0,
    stars_awarded INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- INDEKS PERFORMA
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_status ON public.questions(status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_academic_year ON public.game_sessions(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON public.game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_game_teams_session ON public.game_teams(game_session_id);
CREATE INDEX IF NOT EXISTS idx_game_answers_session ON public.game_answers(game_session_id);
CREATE INDEX IF NOT EXISTS idx_game_events_session ON public.game_events(game_session_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_set_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_events ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if user is Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'::user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: read by authenticated users, update own or admin
CREATE POLICY "Profiles readable by authenticated users"
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Profiles editable by self or admin"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid() OR public.is_admin());

-- Academic Years & Semesters: Read by all authenticated, modified by admin
CREATE POLICY "Academic years readable by all authenticated"
ON public.academic_years FOR SELECT TO authenticated USING (true);

CREATE POLICY "Academic years writable by admin only"
ON public.academic_years FOR ALL TO authenticated
USING (public.is_admin());

CREATE POLICY "Semesters readable by all authenticated"
ON public.semesters FOR SELECT TO authenticated USING (true);

CREATE POLICY "Semesters writable by admin only"
ON public.semesters FOR ALL TO authenticated
USING (public.is_admin());

-- Subjects & Learning Materials: Read by all authenticated, modified by admin or guru
CREATE POLICY "Subjects readable by all authenticated"
ON public.subjects FOR SELECT TO authenticated USING (true);

CREATE POLICY "Subjects writable by admin or guru"
ON public.subjects FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Learning materials readable by all authenticated"
ON public.learning_materials FOR SELECT TO authenticated USING (true);

CREATE POLICY "Learning materials writable by admin or guru"
ON public.learning_materials FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL);

-- Questions & Question Sets: Full access for authenticated teachers & admins
CREATE POLICY "Questions readable by all authenticated"
ON public.questions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Questions writable by authenticated"
ON public.questions FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Question sets accessible by authenticated"
ON public.question_sets FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Question set items accessible by authenticated"
ON public.question_set_items FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL);

-- Game Sessions & Audit Data: Accessible by teachers & admin
CREATE POLICY "Game sessions accessible by authenticated"
ON public.game_sessions FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Game teams accessible by authenticated"
ON public.game_teams FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Game team members accessible by authenticated"
ON public.game_team_members FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Game answers accessible by authenticated"
ON public.game_answers FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Game events accessible by authenticated"
ON public.game_events FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- ATOMIC TRANSACTION PROCEDURE: SUBMIT GAME ANSWER
-- Mengimplementasikan aturan poin (+10), streak, eliminasi (3 error), bonus bintang (kelipatan 5)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.process_game_answer(
    p_session_id UUID,
    p_question_id UUID,
    p_team_id UUID,
    p_submitted_answer TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_correct_answer TEXT;
    v_is_correct BOOLEAN;
    v_team_streak INT;
    v_team_errors INT;
    v_points_earned INT := 0;
    v_stars_earned INT := 0;
    v_is_eliminated BOOLEAN := false;
    v_team_name TEXT;
    v_curr_q_index INT;
    v_result JSONB;
BEGIN
    -- 1. Verifikasi sesi aktif
    SELECT current_question_index INTO v_curr_q_index
    FROM public.game_sessions
    WHERE id = p_session_id AND status = 'active';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sesi permainan tidak aktif atau tidak ditemukan';
    END IF;

    -- 2. Dapatkan kunci jawaban dari tabel questions
    SELECT correct_answer INTO v_correct_answer
    FROM public.questions
    WHERE id = p_question_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Soal tidak ditemukan';
    END IF;

    -- 3. Dapatkan data kelompok
    SELECT name, current_streak, consecutive_errors, is_eliminated
    INTO v_team_name, v_team_streak, v_team_errors, v_is_eliminated
    FROM public.game_teams
    WHERE id = p_team_id AND game_session_id = p_session_id;

    IF v_is_eliminated THEN
        RAISE EXCEPTION 'Kelompok % telah tereliminasi dan tidak dapat menjawab', v_team_name;
    END IF;

    -- 4. Evaluasi jawaban di server
    v_is_correct := (TRIM(UPPER(p_submitted_answer)) = TRIM(UPPER(v_correct_answer)));

    IF v_is_correct THEN
        -- Jawaban Benar: +10 Poin, reset consecutive errors, streak +1
        v_points_earned := 10;
        v_team_streak := v_team_streak + 1;
        v_team_errors := 0;

        -- Bonus Bintang setiap kelipatan 5 (5, 10, 15, dst.)
        IF (v_team_streak > 0 AND v_team_streak % 5 = 0) THEN
            v_stars_earned := 5;
        END IF;

        -- Update kelompok
        UPDATE public.game_teams
        SET points = points + v_points_earned,
            stars = stars + v_stars_earned,
            correct_answers = correct_answers + 1,
            total_answered = total_answered + 1,
            consecutive_errors = 0,
            current_streak = v_team_streak,
            updated_at = NOW()
        WHERE id = p_team_id;

        -- Catat event jawaban benar
        INSERT INTO public.game_events (game_session_id, event_type, game_team_id, question_id, details, points_awarded)
        VALUES (p_session_id, 'ANSWER_CORRECT', p_team_id, p_question_id,
                format('Kelompok %s menjawab BENAR (+10 Poin). Streak: %s', v_team_name, v_team_streak), 10);

        -- Catat event bonus bintang jika dapat
        IF v_stars_earned > 0 THEN
            INSERT INTO public.game_events (game_session_id, event_type, game_team_id, question_id, details, stars_awarded)
            VALUES (p_session_id, 'BONUS_STARS', p_team_id, p_question_id,
                    format('HORE, KALIAN DAPAT BINTANG BERJUMLAH 5 BINTANG! Kelompok %s mencapai streak %s!', v_team_name, v_team_streak), 5);
        END IF;

    ELSE
        -- Jawaban Salah: streak putus, consecutive errors + 1
        v_team_streak := 0;
        v_team_errors := v_team_errors + 1;

        -- Cek apakah mencapai 3 kesalahan beruntun
        IF v_team_errors >= 3 THEN
            v_is_eliminated := true;
        END IF;

        -- Update kelompok
        UPDATE public.game_teams
        SET wrong_answers = wrong_answers + 1,
            total_answered = total_answered + 1,
            consecutive_errors = v_team_errors,
            current_streak = 0,
            is_eliminated = v_is_eliminated,
            eliminated_at = CASE WHEN v_is_eliminated THEN NOW() ELSE NULL END,
            elimination_reason = CASE WHEN v_is_eliminated THEN 'Mencapai 3 kesalahan berturut-turut' ELSE NULL END,
            updated_at = NOW()
        WHERE id = p_team_id;

        -- Catat event jawaban salah
        INSERT INTO public.game_events (game_session_id, event_type, game_team_id, question_id, details)
        VALUES (p_session_id, 'ANSWER_WRONG', p_team_id, p_question_id,
                format('Kelompok %s menjawab SALAH. Kesalahan berturut-turut: %s/3', v_team_name, v_team_errors));

        -- Catat event eliminasi jika gugur
        IF v_is_eliminated THEN
            INSERT INTO public.game_events (game_session_id, event_type, game_team_id, question_id, details)
            VALUES (p_session_id, 'TEAM_ELIMINATED', p_team_id, p_question_id,
                    format('KELOMPOK TERELIMINASI! Kelompok %s gugur dari sesi permainan aktif.', v_team_name));
        END IF;
    END IF;

    -- 5. Catat jawaban ke tabel game_answers
    INSERT INTO public.game_answers (
        game_session_id, question_id, question_index, game_team_id,
        submitted_answer, is_correct, points_earned, bonus_stars_earned,
        consecutive_errors_at_answer, streak_at_answer
    )
    VALUES (
        p_session_id, p_question_id, v_curr_q_index, p_team_id,
        p_submitted_answer, v_is_correct, v_points_earned, v_stars_earned,
        v_team_errors, v_team_streak
    );

    -- Bangun payload kembalian
    v_result := jsonb_build_object(
        'is_correct', v_is_correct,
        'points_earned', v_points_earned,
        'bonus_stars_earned', v_stars_earned,
        'is_eliminated', v_is_eliminated,
        'consecutive_errors', v_team_errors,
        'current_streak', v_team_streak
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
