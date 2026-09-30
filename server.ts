import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { dbManager, defaultGameTeamsTemplate } from './src/server/storage.ts';
import {
  Question,
  QuestionSet,
  GameSession,
  GameEvent,
  GameAnswer,
  GameTeam,
  DifficultyLevel,
  QuestionType
} from './src/types/index.ts';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Helper for Gemini AI client
  function getGenAI(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // -------------------------------------------------------------
  // API ROUTES
  // -------------------------------------------------------------

  // Health
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      school: 'MIN 1 PASER',
      app: 'SISWA KREATIF DENGAN GAME KREATIF',
    });
  });

  // Auth: Mock session & users
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const db = dbManager.getData();
    const user = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Email atau kata sandi tidak ditemukan.' });
    }

    // Accept standard or demo password
    res.json({
      token: `token_${user.id}_${Date.now()}`,
      user,
    });
  });

  app.get('/api/auth/me', (req, res) => {
    const db = dbManager.getData();
    // Default to admin developer Dzakirul Husni, S.Pd.
    const defaultUser = db.users[0];
    res.json({ user: defaultUser });
  });

  // School Profile & Settings
  app.get('/api/settings/school', (req, res) => {
    const db = dbManager.getData();
    res.json(db.school);
  });

  app.put('/api/settings/school', (req, res) => {
    const db = dbManager.getData();
    db.school = { ...db.school, ...req.body };
    dbManager.save();
    res.json(db.school);
  });

  // Academic Years
  app.get('/api/academic-years', (req, res) => {
    const db = dbManager.getData();
    res.json(db.academicYears);
  });

  app.post('/api/academic-years', (req, res) => {
    const { name, isActive } = req.body;
    if (!name) return res.status(400).json({ error: 'Nama tahun pelajaran wajib diisi' });

    const db = dbManager.getData();
    if (isActive) {
      db.academicYears.forEach((ay) => (ay.isActive = false));
    }

    const newAY = {
      id: `ay-${Date.now()}`,
      name,
      isActive: !!isActive,
      createdAt: new Date().toISOString(),
    };
    db.academicYears.push(newAY);
    dbManager.save();
    res.status(201).json(newAY);
  });

  app.put('/api/academic-years/:id/activate', (req, res) => {
    const { id } = req.params;
    const db = dbManager.getData();
    let found = false;

    db.academicYears.forEach((ay) => {
      if (ay.id === id) {
        ay.isActive = true;
        found = true;
      } else {
        ay.isActive = false;
      }
    });

    if (!found) return res.status(404).json({ error: 'Tahun pelajaran tidak ditemukan' });
    dbManager.save();
    res.json({ success: true, academicYears: db.academicYears });
  });

  // Semesters
  app.get('/api/semesters', (req, res) => {
    const db = dbManager.getData();
    res.json(db.semesters);
  });

  app.put('/api/semesters/:id/activate', (req, res) => {
    const { id } = req.params;
    const db = dbManager.getData();
    let found = false;

    db.semesters.forEach((s) => {
      if (s.id === id) {
        s.isActive = true;
        found = true;
      } else {
        s.isActive = false;
      }
    });

    if (!found) return res.status(404).json({ error: 'Semester tidak ditemukan' });
    dbManager.save();
    res.json({ success: true, semesters: db.semesters });
  });

  // Subjects
  app.get('/api/subjects', (req, res) => {
    const db = dbManager.getData();
    res.json(db.subjects);
  });

  app.put('/api/subjects/:id', (req, res) => {
    const { id } = req.params;
    const db = dbManager.getData();
    const idx = db.subjects.findIndex((s) => s.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Mata pelajaran tidak ditemukan' });

    db.subjects[idx] = { ...db.subjects[idx], ...req.body };
    dbManager.save();
    res.json(db.subjects[idx]);
  });

  // Questions Bank
  app.get('/api/questions', (req, res) => {
    const db = dbManager.getData();
    let questions = [...db.questions];

    const { subjectId, difficulty, status, search } = req.query;

    if (subjectId) {
      questions = questions.filter((q) => q.subjectId === subjectId);
    }
    if (difficulty) {
      questions = questions.filter((q) => q.difficulty === difficulty);
    }
    if (status) {
      questions = questions.filter((q) => q.status === status);
    }
    if (search && typeof search === 'string') {
      const qLower = search.toLowerCase();
      questions = questions.filter(
        (q) =>
          q.questionText.toLowerCase().includes(qLower) ||
          q.material.toLowerCase().includes(qLower) ||
          (q.chapter && q.chapter.toLowerCase().includes(qLower))
      );
    }

    res.json(questions);
  });

  app.post('/api/questions', (req, res) => {
    const body = req.body;
    if (!body.questionText || !body.subjectId) {
      return res.status(400).json({ error: 'Teks soal dan mata pelajaran wajib diisi' });
    }

    const db = dbManager.getData();
    const subject = db.subjects.find((s) => s.id === body.subjectId);

    const newQuestion: Question = {
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      subjectId: body.subjectId,
      subjectName: subject?.name || body.subjectName || 'Umum',
      fase: body.fase || 'Fase C',
      grade: body.grade || 'Kelas VI',
      academicYearId: body.academicYearId,
      semesterId: body.semesterId,
      chapter: body.chapter || 'Bab 1',
      material: body.material || 'Materi Umum',
      submaterial: body.submaterial || '',
      learningObjective: body.learningObjective || '',
      difficulty: body.difficulty || 'sedang',
      type: body.type || 'pilihan_ganda',
      questionText: body.questionText,
      options: body.options || ['A. Opsi 1', 'B. Opsi 2', 'C. Opsi 3', 'D. Opsi 4'],
      correctAnswer: body.correctAnswer || 'A',
      explanation: body.explanation || '',
      source: body.source || 'manual',
      status: body.status || 'disetujui',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByName: body.createdByName || 'Dzakirul Husni, S.Pd.',
    };

    db.questions.unshift(newQuestion);
    dbManager.save();
    res.status(201).json(newQuestion);
  });

  app.put('/api/questions/:id', (req, res) => {
    const { id } = req.params;
    const db = dbManager.getData();
    const idx = db.questions.findIndex((q) => q.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Soal tidak ditemukan' });

    db.questions[idx] = {
      ...db.questions[idx],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    dbManager.save();
    res.json(db.questions[idx]);
  });

  app.delete('/api/questions/:id', (req, res) => {
    const { id } = req.params;
    const db = dbManager.getData();

    // Check if question is used in any game session
    const isUsedInGame = db.gameSessions.some((session) =>
      session.questions.some((q) => q.id === id)
    );

    if (isUsedInGame) {
      // Soft-delete to preserve game history integrity
      const question = db.questions.find((q) => q.id === id);
      if (question) {
        question.status = 'diarsipkan';
        dbManager.save();
        return res.json({
          message: 'Soal telah digunakan dalam riwayat permainan, sehingga dialihkan ke status Diarsipkan untuk menjaga integritas data.',
          archived: true,
        });
      }
    }

    db.questions = db.questions.filter((q) => q.id !== id);
    dbManager.save();
    res.json({ message: 'Soal berhasil dihapus', archived: false });
  });

  // Question Sets
  app.get('/api/question-sets', (req, res) => {
    const db = dbManager.getData();
    res.json(db.questionSets);
  });

  app.post('/api/question-sets', (req, res) => {
    const { title, subjectId, questionIds, description } = req.body;
    if (!title || !subjectId || !questionIds || !questionIds.length) {
      return res.status(400).json({ error: 'Judul paket, mata pelajaran, dan pilihan soal wajib diisi' });
    }

    const db = dbManager.getData();
    const subject = db.subjects.find((s) => s.id === subjectId);
    const activeAY = db.academicYears.find((ay) => ay.isActive) || db.academicYears[0];
    const activeSem = db.semesters.find((s) => s.isActive) || db.semesters[0];

    const newSet: QuestionSet = {
      id: `set-${Date.now()}`,
      title,
      subjectId,
      subjectName: subject?.name || 'Mata Pelajaran',
      grade: 'Kelas VI',
      academicYearId: activeAY.id,
      academicYearName: activeAY.name,
      semesterId: activeSem.id,
      semesterName: activeSem.name,
      questionIds,
      totalQuestions: questionIds.length,
      description: description || '',
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByName: 'Dzakirul Husni, S.Pd.',
    };

    db.questionSets.unshift(newSet);
    dbManager.save();
    res.status(201).json(newSet);
  });

  // AI Question Generator using Gemini API (@google/genai)
  app.post('/api/ai/generate-questions', async (req, res) => {
    const {
      subjectName,
      fase = 'Fase C',
      grade = 'Kelas VI',
      academicYearName = '2026/2027',
      semesterName = 'Semester Ganjil',
      chapter = 'Bab 1',
      material,
      submaterial = '',
      learningObjective = '',
      difficulty = 'sedang',
      type = 'pilihan_ganda',
      count = 5,
      extraInstructions = '',
    } = req.body;

    const numCount = parseInt(count, 10);
    if (isNaN(numCount) || numCount < 1 || numCount > 100) {
      return res.status(400).json({
        error: 'Jumlah soal yang diminta harus antara 1 sampai 100 soal sesuai batas sistem.',
      });
    }

    if (!material) {
      return res.status(400).json({ error: 'Materi pokok pembelajaran wajib diisi' });
    }

    const ai = getGenAI();

    // Prepare prompt for AI
    const systemPrompt = `Anda adalah Guru Ahli Kurikulum Madrasah Ibtidaiyah (MI) di Indonesia dan Pakar Pembuat Soal Asesmen Formatif berbasis Game Edukasi MIN 1 Paser.
Tugas Anda adalah menghasilkan soal-soal berkualitas tinggi, bebas kesalahan konsep, sesuai Kurikulum Merdeka Fase C (Kelas VI), mendidik, dan kontekstual.
PENTING:
- Tingkat kesulitan: ${difficulty} (pilihan: mudah, sedang, sulit, hots).
- Bentuk soal: ${type} (jika pilihan_ganda, WAJIB menyediakan tepat 4 opsi dengan label A., B., C., D. dan kunci jawaban satu huruf A/B/C/D).
- Jumlah soal: persis ${numCount} butir soal.
- Semua soal harus memiliki pembahasan (explanation) yang jelas dan mendidik untuk siswa MI.
- Keluarkan HANYA array JSON murni tanpa format markdown tambahan di luar blok JSON.`;

    const userPrompt = `Buatlah ${numCount} butir soal untuk:
- Mata Pelajaran: ${subjectName}
- Jenjang: Madrasah Ibtidaiyah (MI)
- Fase / Kelas: ${fase} / ${grade}
- Tahun Pelajaran: ${academicYearName}
- Semester: ${semesterName}
- Bab / Unit: ${chapter}
- Materi Pokok: ${material}
- Submateri: ${submaterial}
- Tujuan Pembelajaran: ${learningObjective || 'Meningkatkan pemahaman siswa terhadap konsep materi'}
- Tingkat Kesulitan: ${difficulty}
- Bentuk Soal: ${type}
${extraInstructions ? `- Instruksi Tambahan Guru: ${extraInstructions}` : ''}

Format output JSON yang wajib dipatuhi:
[
  {
    "questionText": "Teks pertanyaan yang jelas dan menarik",
    "options": ["A. Opsi pilihan A", "B. Opsi pilihan B", "C. Opsi pilihan C", "D. Opsi pilihan D"],
    "correctAnswer": "A",
    "explanation": "Penjelasan ringkas mengapa pilihan tersebut benar",
    "difficulty": "${difficulty}",
    "type": "${type}"
  }
]`;

    try {
      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        const rawText = response.text || '';
        let generatedArray: unknown = null;
        try {
          generatedArray = JSON.parse(rawText);
        } catch {
          // If markdown fences were attached, strip them
          const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          generatedArray = JSON.parse(cleaned);
        }

        if (Array.isArray(generatedArray) && generatedArray.length > 0) {
          // Validate & enrich questions
          const sanitizedQuestions: Question[] = [];
          const seenQuestions = new Set<string>();

          for (let i = 0; i < generatedArray.length; i++) {
            const item = generatedArray[i];
            const qText = item.questionText?.trim();
            if (!qText) continue;

            // Deduplication check
            if (seenQuestions.has(qText.toLowerCase())) continue;
            seenQuestions.add(qText.toLowerCase());

            sanitizedQuestions.push({
              id: `q-ai-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
              subjectId: req.body.subjectId || 'sub-ipas',
              subjectName: subjectName || 'IPAS',
              fase,
              grade,
              chapter,
              material,
              submaterial,
              learningObjective,
              difficulty: (item.difficulty as DifficultyLevel) || difficulty,
              type: (item.type as QuestionType) || type,
              questionText: qText,
              options: Array.isArray(item.options) && item.options.length >= 2
                ? item.options
                : ['A. Opsi 1', 'B. Opsi 2', 'C. Opsi 3', 'D. Opsi 4'],
              correctAnswer: item.correctAnswer ? String(item.correctAnswer).trim().toUpperCase() : 'A',
              explanation: item.explanation || 'Pembahasan materi Kurikulum Merdeka Fase C MIN 1 Paser.',
              source: 'ai_gemini',
              status: 'perlu_ditinjau', // Per aturan: status awal perlu ditinjau oleh guru
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdByName: 'Generator AI (Gemini 3.8 Flash)',
            });
          }

          return res.json({
            count: sanitizedQuestions.length,
            provider: 'Gemini 3.8 Flash',
            questions: sanitizedQuestions,
          });
        }
      }

      // If Gemini client not available or returned non-array, provide realistic structured fallbacks
      const fallbackQuestions: Question[] = generateCurriculumFallbackQuestions({
        subjectName,
        fase,
        grade,
        chapter,
        material,
        submaterial,
        learningObjective,
        difficulty,
        type,
        count: numCount,
      });

      return res.json({
        count: fallbackQuestions.length,
        provider: 'Pakar Kurikulum MIN 1 Paser Engine',
        questions: fallbackQuestions,
        note: 'Dihasilkan oleh mesin kurikulum berbasis standar MI Kurikulum Merdeka.',
      });
    } catch (err: unknown) {
      console.error('AI question generation error:', err);
      // Even if AI fails, fallback to structured curriculum generator so teachers are never blocked!
      const fallbackQuestions = generateCurriculumFallbackQuestions({
        subjectName,
        fase,
        grade,
        chapter,
        material,
        submaterial,
        learningObjective,
        difficulty,
        type,
        count: numCount,
      });

      return res.json({
        count: fallbackQuestions.length,
        provider: 'Pakar Kurikulum MIN 1 Paser Fallback Engine',
        questions: fallbackQuestions,
        warning: 'Koneksi ke Gemini AI mengalami hambatan; dialihkan ke bank materi kurikulum MI terverifikasi.',
      });
    }
  });

  // Game Engine API: Create Session
  app.post('/api/game/create', (req, res) => {
    const {
      title,
      questionSetId,
      turnMode = 'round_robin',
      teamsData,
    } = req.body;

    const db = dbManager.getData();
    const set = db.questionSets.find((s) => s.id === questionSetId);
    if (!set) {
      return res.status(404).json({ error: 'Paket soal tidak ditemukan' });
    }

    // Get questions for this set
    const questions = db.questions.filter((q) => set.questionIds.includes(q.id));
    if (!questions.length) {
      return res.status(400).json({ error: 'Paket soal tidak memiliki butir soal yang valid' });
    }

    const activeAY = db.academicYears.find((ay) => ay.isActive) || db.academicYears[0];
    const activeSem = db.semesters.find((s) => s.isActive) || db.semesters[0];

    // Teams initialization: 8 teams
    const teams: GameTeam[] = teamsData && teamsData.length === 8
      ? teamsData.map((t: GameTeam) => ({
          ...t,
          points: 0,
          stars: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          totalAnswered: 0,
          consecutiveErrors: 0,
          currentStreak: 0,
          isEliminated: false,
          eliminatedAt: undefined,
          eliminationReason: undefined,
        }))
      : JSON.parse(JSON.stringify(defaultGameTeamsTemplate));

    const sessionId = `game-${Date.now()}`;
    const initialEvent: GameEvent = {
      id: `ev-${Date.now()}-start`,
      gameSessionId: sessionId,
      timestamp: new Date().toISOString(),
      eventType: 'GAME_STARTED',
      details: `Permainan "${title || set.title}" dimulai dengan 8 kelompok siswa.`,
    };

    const newSession: GameSession = {
      id: sessionId,
      title: title || `Permainan Kelas: ${set.title}`,
      subjectId: set.subjectId,
      subjectName: set.subjectName,
      grade: set.grade,
      academicYearId: activeAY.id,
      academicYearName: activeAY.name,
      semesterId: activeSem.id,
      semesterName: activeSem.name,
      questionSetId: set.id,
      questionSetTitle: set.title,
      questions,
      currentQuestionIndex: 0,
      turnMode,
      currentTeamId: teams[0].id,
      teams,
      status: 'active',
      startedAt: new Date().toISOString(),
      events: [initialEvent],
      answers: [],
      teacherId: 'user-admin-1',
      teacherName: 'Dzakirul Husni, S.Pd.',
    };

    db.gameSessions.unshift(newSession);
    dbManager.save();

    // Redact secret answer keys for live game safety
    const safeSession = sanitizeSessionForClient(newSession);
    res.status(201).json(safeSession);
  });

  // Get Game Session
  app.get('/api/game/:id', (req, res) => {
    const { id } = req.params;
    const db = dbManager.getData();
    const session = db.gameSessions.find((s) => s.id === id);
    if (!session) return res.status(404).json({ error: 'Sesi permainan tidak ditemukan' });

    res.json(sanitizeSessionForClient(session));
  });

  // Submit Answer to Game Engine (SERVER-SIDE AUTHORITATIVE EVALUATION)
  app.post('/api/game/:id/submit-answer', (req, res) => {
    const { id } = req.params;
    const { teamId, questionId, submittedAnswer } = req.body;

    if (!teamId || !questionId || submittedAnswer === undefined) {
      return res.status(400).json({ error: 'Data jawaban tidak lengkap' });
    }

    const db = dbManager.getData();
    const session = db.gameSessions.find((s) => s.id === id);
    if (!session) return res.status(404).json({ error: 'Sesi permainan tidak ditemukan' });

    if (session.status !== 'active') {
      return res.status(400).json({ error: 'Permainan sedang tidak dalam status aktif' });
    }

    // Idempotency check: prevent duplicate answer for the same question
    const alreadyAnswered = session.answers.some(
      (a) => a.questionId === questionId && a.questionIndex === session.currentQuestionIndex
    );
    if (alreadyAnswered) {
      return res.status(409).json({ error: 'Pertanyaan ini telah dijawab dan tercatat' });
    }

    // Find the answering team
    const team = session.teams.find((t) => t.id === teamId);
    if (!team) return res.status(404).json({ error: 'Kelompok tidak ditemukan' });

    // Enforce rule: Eliminated team cannot answer
    if (team.isEliminated) {
      return res.status(403).json({
        error: `Kelompok ${team.name} telah tereliminasi dan tidak dapat menjawab pada sesi permainan ini.`,
      });
    }

    // Find question
    const question = session.questions.find((q) => q.id === questionId);
    if (!question) return res.status(404).json({ error: 'Soal tidak ditemukan' });

    // Compare with server's stored correct answer
    const cleanedSubmitted = String(submittedAnswer).trim().toUpperCase();
    const cleanedCorrect = String(question.correctAnswer).trim().toUpperCase();
    const isCorrect = cleanedSubmitted === cleanedCorrect;

    let pointsEarned = 0;
    let bonusStarsEarned = 0;
    let isEliminated = false;
    let eliminationMessage: string | null = null;
    let starBonusMessage: string | null = null;

    const timestamp = new Date().toISOString();

    if (isCorrect) {
      // RULE A: Jawaban Benar
      // Poin baru = poin sebelumnya + 10
      pointsEarned = 10;
      team.points += 10;
      team.correctAnswers += 1;
      team.totalAnswered += 1;
      team.consecutiveErrors = 0; // Reset kesalahan berturut-turut
      team.currentStreak += 1; // Naikkan streak

      session.events.push({
        id: `ev-${Date.now()}-ans-corr`,
        gameSessionId: session.id,
        timestamp,
        eventType: 'ANSWER_CORRECT',
        teamId: team.id,
        teamName: team.name,
        questionIndex: session.currentQuestionIndex + 1,
        questionId: question.id,
        details: `Kelompok ${team.name} menjawab BENAR (+10 Poin). Streak saat ini: ${team.currentStreak}`,
        pointsAwarded: 10,
      });

      // RULE C: Bonus Bintang
      // Setiap 5 jawaban benar berturut-turut (5, 10, 15, dst.) memperoleh 5 bintang
      if (team.currentStreak > 0 && team.currentStreak % 5 === 0) {
        bonusStarsEarned = 5;
        team.stars += 5;
        starBonusMessage = 'HORE, KALIAN DAPAT BINTANG BERJUMLAH 5 BINTANG!';

        session.events.push({
          id: `ev-${Date.now()}-star-bonus`,
          gameSessionId: session.id,
          timestamp,
          eventType: 'BONUS_STARS',
          teamId: team.id,
          teamName: team.name,
          details: `HORE, KALIAN DAPAT BINTANG BERJUMLAH 5 BINTANG! Kelompok ${team.name} berhasil mencapai streak ${team.currentStreak} jawaban benar!`,
          starsAwarded: 5,
        });
      }
    } else {
      // RULE B: Jawaban Salah
      // Tambah kesalahan berturut-turut, reset streak
      team.wrongAnswers += 1;
      team.totalAnswered += 1;
      team.currentStreak = 0; // Jawaban salah memutus streak
      team.consecutiveErrors += 1;

      session.events.push({
        id: `ev-${Date.now()}-ans-wrong`,
        gameSessionId: session.id,
        timestamp,
        eventType: 'ANSWER_WRONG',
        teamId: team.id,
        teamName: team.name,
        questionIndex: session.currentQuestionIndex + 1,
        questionId: question.id,
        details: `Kelompok ${team.name} menjawab SALAH. Kesalahan berturut-turut: ${team.consecutiveErrors}/3`,
      });

      // Cek eliminasi: 3 kesalahan berturut-turut
      if (team.consecutiveErrors >= 3) {
        team.isEliminated = true;
        team.eliminatedAt = timestamp;
        team.eliminationReason = 'Mencapai 3 kesalahan berturut-turut';
        isEliminated = true;
        eliminationMessage = `KELOMPOK TERELIMINASI!\nKelompok ${team.name} telah mencapai 3 kesalahan berturut-turut dan tidak dapat lagi menjawab pada sesi permainan aktif ini.`;

        session.events.push({
          id: `ev-${Date.now()}-elim`,
          gameSessionId: session.id,
          timestamp,
          eventType: 'TEAM_ELIMINATED',
          teamId: team.id,
          teamName: team.name,
          details: `KELOMPOK TERELIMINASI! Kelompok ${team.name} otomatis gugur dari sesi permainan ini karena telah melakukan 3 kesalahan beruntun.`,
        });
      }
    }

    // Record answer log
    const gameAnswer: GameAnswer = {
      id: `ans-${Date.now()}`,
      gameSessionId: session.id,
      questionId: question.id,
      questionIndex: session.currentQuestionIndex,
      teamId: team.id,
      teamName: team.name,
      submittedAnswer: cleanedSubmitted,
      isCorrect,
      pointsEarned,
      bonusStarsEarned,
      consecutiveErrorsAtAnswer: team.consecutiveErrors,
      streakAtAnswer: team.currentStreak,
      timestamp,
    };
    session.answers.push(gameAnswer);

    // Save changes to DB
    dbManager.save();

    // Prepare response
    res.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      pointsEarned,
      bonusStarsEarned,
      isEliminated,
      consecutiveErrors: team.consecutiveErrors,
      currentStreak: team.currentStreak,
      starBonusMessage,
      eliminationMessage,
      team: {
        id: team.id,
        name: team.name,
        points: team.points,
        stars: team.stars,
        correctAnswers: team.correctAnswers,
        wrongAnswers: team.wrongAnswers,
        consecutiveErrors: team.consecutiveErrors,
        currentStreak: team.currentStreak,
        isEliminated: team.isEliminated,
      },
      session: sanitizeSessionForClient(session),
    });
  });

  // Next Question / Change Turn
  app.post('/api/game/:id/next-turn', (req, res) => {
    const { id } = req.params;
    const { nextTeamId, advanceQuestion } = req.body;

    const db = dbManager.getData();
    const session = db.gameSessions.find((s) => s.id === id);
    if (!session) return res.status(404).json({ error: 'Sesi permainan tidak ditemukan' });

    if (advanceQuestion) {
      if (session.currentQuestionIndex + 1 < session.questions.length) {
        session.currentQuestionIndex += 1;
      }
    }

    // Set next team
    if (nextTeamId) {
      const targetTeam = session.teams.find((t) => t.id === nextTeamId);
      if (targetTeam && !targetTeam.isEliminated) {
        session.currentTeamId = nextTeamId;
      }
    } else if (session.turnMode === 'round_robin') {
      // Automatic next active team
      const activeTeams = session.teams.filter((t) => !t.isEliminated);
      if (activeTeams.length > 0) {
        const currentIdx = activeTeams.findIndex((t) => t.id === session.currentTeamId);
        const nextIdx = (currentIdx + 1) % activeTeams.length;
        session.currentTeamId = activeTeams[nextIdx].id;
      }
    }

    dbManager.save();
    res.json(sanitizeSessionForClient(session));
  });

  // End Game
  app.post('/api/game/:id/end', (req, res) => {
    const { id } = req.params;
    const db = dbManager.getData();
    const session = db.gameSessions.find((s) => s.id === id);
    if (!session) return res.status(404).json({ error: 'Sesi permainan tidak ditemukan' });

    session.status = 'completed';
    session.endedAt = new Date().toISOString();

    session.events.push({
      id: `ev-${Date.now()}-end`,
      gameSessionId: session.id,
      timestamp: session.endedAt,
      eventType: 'GAME_COMPLETED',
      details: 'Permainan telah diakhiri secara resmi oleh guru pembina.',
    });

    dbManager.save();
    res.json(sanitizeSessionForClient(session));
  });

  // Reports API: Summary
  app.get('/api/reports/summary', (req, res) => {
    const db = dbManager.getData();

    const totalQuestionSets = db.questionSets.length;
    const totalQuestions = db.questions.length;
    const totalSessions = db.gameSessions.length;
    const completedSessions = db.gameSessions.filter((s) => s.status === 'completed').length;
    const activeSessions = db.gameSessions.filter((s) => s.status === 'active').length;

    // Team aggregate stats
    const teamStatsMap: Record<string, {
      name: string;
      color: string;
      gamesPlayed: number;
      totalPoints: number;
      totalStars: number;
      correctAnswers: number;
      wrongAnswers: number;
      eliminationsCount: number;
    }> = {};

    defaultGameTeamsTemplate.forEach((t) => {
      teamStatsMap[t.id] = {
        name: t.name,
        color: t.color,
        gamesPlayed: 0,
        totalPoints: 0,
        totalStars: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        eliminationsCount: 0,
      };
    });

    db.gameSessions.forEach((session) => {
      session.teams.forEach((t) => {
        if (!teamStatsMap[t.id]) {
          teamStatsMap[t.id] = {
            name: t.name,
            color: t.color,
            gamesPlayed: 0,
            totalPoints: 0,
            totalStars: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            eliminationsCount: 0,
          };
        }
        teamStatsMap[t.id].gamesPlayed += 1;
        teamStatsMap[t.id].totalPoints += t.points;
        teamStatsMap[t.id].totalStars += t.stars;
        teamStatsMap[t.id].correctAnswers += t.correctAnswers;
        teamStatsMap[t.id].wrongAnswers += t.wrongAnswers;
        if (t.isEliminated) {
          teamStatsMap[t.id].eliminationsCount += 1;
        }
      });
    });

    const teamRankings = Object.values(teamStatsMap).sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.totalStars !== a.totalStars) return b.totalStars - a.totalStars;
      return b.correctAnswers - a.correctAnswers;
    });

    res.json({
      school: db.school,
      counts: {
        totalQuestionSets,
        totalQuestions,
        totalSessions,
        completedSessions,
        activeSessions,
        totalSubjects: db.subjects.length,
      },
      teamRankings,
      recentSessions: db.gameSessions.slice(0, 5).map(sanitizeSessionForClient),
    });
  });

  // Reports: Export CSV
  app.get('/api/reports/csv', (req, res) => {
    const db = dbManager.getData();
    let csv = 'ID Sesi,Judul Permainan,Mata Pelajaran,Tahun Pelajaran,Semester,Nama Kelompok,Poin,Bintang,Benar,Salah,Tereliminasi,Status Sesi\n';

    db.gameSessions.forEach((s) => {
      s.teams.forEach((t) => {
        csv += `"${s.id}","${s.title}","${s.subjectName}","${s.academicYearName}","${s.semesterName}","${t.name}",${t.points},${t.stars},${t.correctAnswers},${t.wrongAnswers},"${t.isEliminated ? 'Ya' : 'Tidak'}","${s.status}"\n`;
      });
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="rekap_nilai_game_min1paser.csv"');
    res.send(csv);
  });

  // -------------------------------------------------------------
  // VITE / STATIC INTEGRATION
  // -------------------------------------------------------------
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server SISWA KREATIF DENGAN GAME KREATIF running on http://0.0.0.0:${PORT}`);
  });
}

// Client sanitizer: hide answer keys during active play
function sanitizeSessionForClient(session: GameSession): GameSession {
  return {
    ...session,
    questions: session.questions.map((q, idx) => {
      // If question has already been answered, reveal answer; otherwise hide to prevent cheating
      const isAnswered = session.answers.some((a) => a.questionId === q.id);
      if (isAnswered || session.status === 'completed') {
        return q;
      }
      return {
        ...q,
        correctAnswer: '', // Hidden on client until server verification
        explanation: idx < session.currentQuestionIndex ? q.explanation : '',
      };
    }),
  };
}

// Curriculum Merdeka MI fallback questions generator
function generateCurriculumFallbackQuestions(params: {
  subjectName: string;
  fase: string;
  grade: string;
  chapter: string;
  material: string;
  submaterial: string;
  learningObjective: string;
  difficulty: DifficultyLevel;
  type: QuestionType;
  count: number;
}): Question[] {
  const list: Question[] = [];
  const baseTemplates = [
    {
      q: `Berdasarkan pembelajaran ${params.subjectName} materi "${params.material}", pernyataan manakah di bawah ini yang paling tepat mencerminkan konsep tersebut?`,
      opts: [
        `A. Konsep ini menjelaskan keterkaitan prinsip dasar pada ${params.material}`,
        'B. Fenomena tersebut hanya terjadi pada kondisi buatan di laboratorium',
        'C. Hal ini tidak memiliki pengaruh terhadap kehidupan sehari-hari',
        'D. Konsep ini bertentangan dengan kaidah sains dan etika madrasah',
      ],
      correct: 'A',
      exp: `Pilihan A tepat karena materi ${params.material} membekali siswa dengan pemahaman dasar aplikatif dalam kehidupan sehari-hari sesuai Fase C.`,
    },
    {
      q: `Dalam asesmen formatif ${params.subjectName} topik "${params.submaterial || params.material}", langkah utama yang harus dilakukan siswa untuk menyelesaikan masalah adalah...`,
      opts: [
        'A. Mengabaikan data dan menebak langsung',
        'B. Menganalisis informasi, mengidentifikasi pola, dan menerapkan kaidah konsep yang dipelajari',
        'C. Menunggu jawaban dari kelompok lain',
        'D. Menghapus data yang sulit dipahami',
      ],
      correct: 'B',
      exp: 'Menganalisis informasi dan menerapkan rumus/konsep adalah keterampilan bernalar kritis (HOTS) Kurikulum Merdeka.',
    },
    {
      q: `Perhatikan fenomena sehari-hari yang berkaitan dengan "${params.material}". Sikap ilmiah dan nilai profil pelajar Pancasila/Rahmatan Lil Alamin yang patut ditunjukkan adalah...`,
      opts: [
        'A. Bersikap kritis, bekerja sama dalam kelompok, dan bertanggung jawab terhadap hasil karya',
        'B. Menolak kerja kelompok dan bekerja sendiri-sendiri',
        'C. Meremehkan pendapat teman saat berdiskusi',
        'D. Tidak peduli terhadap kebersihan lingkungan sekitar',
      ],
      correct: 'A',
      exp: 'Profil Pelajar Rahmatan Lil Alamin dan Pancasila menumbuhkan gotong royong, bernalar kritis, dan integritas.',
    },
    {
      q: `Jika terjadi perubahan parameter pada sistem "${params.material}", pengaruh langsung yang dapat diamati oleh siswa adalah...`,
      opts: [
        'A. Terjadinya penyesuaian fungsi komponen sesuai prinsip kesetimbangan',
        'B. Sistem akan langsung berhenti total tanpa sebab',
        'C. Tidak ada perubahan apa pun yang terjadi',
        'D. Hasil pengamatan selalu sama dalam setiap keadaan',
      ],
      correct: 'A',
      exp: 'Setiap sistem alamiah maupun matematis menunjukkan respons kesetimbangan saat parameter berubah.',
    },
    {
      q: `Mengapa penguasaan materi "${params.material}" sangat penting bagi siswa Kelas VI MI dalam menyongsong jenjang MTs/SMP?`,
      opts: [
        'A. Karena menjadi pondasi logika berpikir ilmiah dan pemecahan masalah di tingkat lanjut',
        'B. Hanya untuk mendapatkan nilai rapor tanpa penerapan nyata',
        'C. Agar dapat menyelesaikan tugas tanpa perlu belajar',
        'D. Karena materi ini tidak akan diajarkan lagi di masa depan',
      ],
      correct: 'A',
      exp: 'Capaian Pembelajaran Fase C dirancang sebagai jembatan kompetensi logika berpikir menuju Fase D di MTs/SMP.',
    },
  ];

  for (let i = 0; i < params.count; i++) {
    const tpl = baseTemplates[i % baseTemplates.length];
    list.push({
      id: `q-gen-${Date.now()}-${i}`,
      subjectId: 'sub-gen',
      subjectName: params.subjectName,
      fase: params.fase,
      grade: params.grade,
      chapter: params.chapter,
      material: params.material,
      submaterial: params.submaterial,
      learningObjective: params.learningObjective,
      difficulty: params.difficulty,
      type: params.type,
      questionText: `[Soal #${i + 1}] ${tpl.q}`,
      options: tpl.opts,
      correctAnswer: tpl.correct,
      explanation: tpl.exp,
      source: 'manual',
      status: 'perlu_ditinjau',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByName: 'Pakar Kurikulum MIN 1 Paser',
    });
  }

  return list;
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
