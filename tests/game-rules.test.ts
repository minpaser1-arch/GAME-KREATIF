/**
 * PENGUJIAN OTOMATIS ATURAN PERMAINAN & INTEGRITAS SISTEM
 * MIN 1 PASER - SISWA KREATIF DENGAN GAME KREATIF
 * 
 * Menguji seluruh skenario wajib Bagian 19:
 * 1. Jawaban benar menambah 10 poin.
 * 2. Jawaban salah menambah penghitung kesalahan berturut-turut.
 * 3. Jawaban benar mereset kesalahan berturut-turut.
 * 4. Tiga kesalahan berturut-turut menyebabkan eliminasi.
 * 5. Lima jawaban benar berturut-turut memberikan lima bintang.
 * 6. Sepuluh jawaban benar berturut-turut memberikan total sepuluh bintang dari dua bonus.
 * 7. Jawaban salah memutus streak.
 * 8. Kelompok tereliminasi tidak dapat menjawab lagi.
 * 9. Idempotensi: jawaban duplikat ditolak.
 * 10. Generator menolak jumlah soal di luar rentang 1-100.
 */

interface TeamState {
  id: string;
  name: string;
  points: number;
  stars: number;
  correctAnswers: number;
  wrongAnswers: number;
  consecutiveErrors: number;
  currentStreak: number;
  isEliminated: boolean;
}

function createTestTeam(name: string): TeamState {
  return {
    id: `team-${name.toLowerCase()}`,
    name,
    points: 0,
    stars: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    consecutiveErrors: 0,
    currentStreak: 0,
    isEliminated: false,
  };
}

function processAnswer(
  team: TeamState,
  isCorrect: boolean,
  alreadyAnsweredIds: Set<string>,
  questionId: string
): { success: boolean; error?: string; bonusStars: number } {
  if (team.isEliminated) {
    return { success: false, error: 'Kelompok telah tereliminasi dan tidak dapat menjawab', bonusStars: 0 };
  }

  // Idempotency check
  if (alreadyAnsweredIds.has(questionId)) {
    return { success: false, error: 'Pertanyaan ini telah dijawab sebelumnya (Idempotent Guard)', bonusStars: 0 };
  }
  alreadyAnsweredIds.add(questionId);

  let bonusStars = 0;

  if (isCorrect) {
    // Poin baru = poin sebelumnya + 10
    team.points += 10;
    team.correctAnswers += 1;
    team.consecutiveErrors = 0; // Reset kesalahan berturut-turut
    team.currentStreak += 1;

    // Bonus 5 bintang setiap kelipatan 5 streak
    if (team.currentStreak > 0 && team.currentStreak % 5 === 0) {
      bonusStars = 5;
      team.stars += 5;
    }
  } else {
    team.wrongAnswers += 1;
    team.currentStreak = 0; // Jawaban salah memutus streak
    team.consecutiveErrors += 1;

    // 3 kesalahan berturut-turut -> eliminasi otomatis
    if (team.consecutiveErrors >= 3) {
      team.isEliminated = true;
    }
  }

  return { success: true, bonusStars };
}

function validateGeneratorCount(count: number): boolean {
  return Number.isInteger(count) && count >= 1 && count <= 100;
}

// -------------------------------------------------------------
// TEST RUNNER
// -------------------------------------------------------------
function assert(condition: boolean, testName: string) {
  if (!condition) {
    console.error(`❌ GAGAL: ${testName}`);
    process.exit(1);
  } else {
    console.log(`✅ LULUS: ${testName}`);
  }
}

console.log('====================================================');
console.log('MEMULAI PENGUJIAN ATURAN PERMAINAN SISWA KREATIF');
console.log('MIN 1 PASER - KELAS VI (FASE C)');
console.log('====================================================');

// Uji 1: Jawaban benar menambah 10 poin
{
  const team = createTestTeam('Garuda');
  const answered = new Set<string>();
  const res = processAnswer(team, true, answered, 'q1');
  assert(res.success && team.points === 10, 'Uji 1: Jawaban benar menambah 10 poin');
}

// Uji 2: Jawaban salah menambah penghitung kesalahan berturut-turut
{
  const team = createTestTeam('Elang');
  const answered = new Set<string>();
  processAnswer(team, false, answered, 'q1');
  assert(team.consecutiveErrors === 1 && team.wrongAnswers === 1, 'Uji 2: Jawaban salah menambah penghitung kesalahan berturut-turut');
}

// Uji 3: Jawaban benar mereset kesalahan berturut-turut
{
  const team = createTestTeam('Rajawali');
  const answered = new Set<string>();
  processAnswer(team, false, answered, 'q1'); // 1 error
  processAnswer(team, false, answered, 'q2'); // 2 errors
  assert(team.consecutiveErrors === 2, 'Uji 3a: Mencapai 2 kesalahan sebelum benar');
  processAnswer(team, true, answered, 'q3'); // Benar -> reset!
  assert(team.consecutiveErrors === 0 && team.points === 10, 'Uji 3b: Jawaban benar mereset kesalahan berturut-turut ke 0');
}

// Uji 4: Tiga kesalahan berturut-turut menyebabkan eliminasi
{
  const team = createTestTeam('Cendekia');
  const answered = new Set<string>();
  processAnswer(team, false, answered, 'q1');
  processAnswer(team, false, answered, 'q2');
  assert(!team.isEliminated, 'Uji 4a: Belum tereliminasi di kesalahan ke-2');
  processAnswer(team, false, answered, 'q3');
  assert(team.isEliminated === true && team.consecutiveErrors === 3, 'Uji 4b: Tiga kesalahan berturut-turut menyebabkan eliminasi otomatis');
}

// Uji 5: Lima jawaban benar berturut-turut memberikan 5 bintang
{
  const team = createTestTeam('Kreator');
  const answered = new Set<string>();
  for (let i = 1; i <= 4; i++) {
    processAnswer(team, true, answered, `q${i}`);
  }
  assert(team.stars === 0 && team.currentStreak === 4, 'Uji 5a: Streak 4 belum mendapat bintang');
  const res5 = processAnswer(team, true, answered, 'q5');
  assert(team.stars === 5 && res5.bonusStars === 5 && team.currentStreak === 5, 'Uji 5b: Jawaban benar ke-5 berturut-turut memberikan 5 bintang');
}

// Uji 6: Sepuluh jawaban benar berturut-turut memberikan total 10 bintang dari dua bonus
{
  const team = createTestTeam('Inovator');
  const answered = new Set<string>();
  for (let i = 1; i <= 10; i++) {
    processAnswer(team, true, answered, `q${i}`);
  }
  assert(team.stars === 10 && team.currentStreak === 10 && team.points === 100, 'Uji 6: Sepuluh jawaban benar berturut-turut memberikan total 10 bintang');
}

// Uji 7: Jawaban salah memutus streak
{
  const team = createTestTeam('Juara');
  const answered = new Set<string>();
  for (let i = 1; i <= 4; i++) {
    processAnswer(team, true, answered, `q${i}`);
  }
  assert(team.currentStreak === 4, 'Uji 7a: Streak 4 sebelum salah');
  processAnswer(team, false, answered, 'q5');
  assert(team.currentStreak === 0 && team.stars === 0, 'Uji 7b: Jawaban salah memutus streak ke 0');
}

// Uji 8: Kelompok tereliminasi tidak dapat menjawab lagi
{
  const team = createTestTeam('Bintang');
  const answered = new Set<string>();
  processAnswer(team, false, answered, 'q1');
  processAnswer(team, false, answered, 'q2');
  processAnswer(team, false, answered, 'q3'); // Tereliminasi!
  assert(team.isEliminated, 'Uji 8a: Kelompok tereliminasi');
  const attempt = processAnswer(team, true, answered, 'q4');
  assert(attempt.success === false && team.points === 0, 'Uji 8b: Kelompok tereliminasi ditolak saat mencoba menjawab');
}

// Uji 9: Permintaan jawaban ganda tidak menggandakan skor (idempotensi)
{
  const team = createTestTeam('Garuda');
  const answered = new Set<string>();
  processAnswer(team, true, answered, 'q-same');
  assert(team.points === 10, 'Uji 9a: Jawaban pertama bernilai 10 poin');
  const duplicateRes = processAnswer(team, true, answered, 'q-same');
  assert(duplicateRes.success === false && team.points === 10, 'Uji 9b: Jawaban duplikat ditolak tanpa menggandakan poin');
}

// Uji 10: Generator menolak jumlah soal di luar rentang 1-100
{
  assert(validateGeneratorCount(1) === true, 'Uji 10a: Batas bawah 1 valid');
  assert(validateGeneratorCount(100) === true, 'Uji 10b: Batas atas 100 valid');
  assert(validateGeneratorCount(0) === false, 'Uji 10c: 0 ditolak');
  assert(validateGeneratorCount(101) === false, 'Uji 10d: 101 ditolak');
  assert(validateGeneratorCount(-5) === false, 'Uji 10e: Negatif ditolak');
}

console.log('====================================================');
console.log('SELURUH 10 SKENARIO PENGUJIAN ATURAN PERMAINAN LULUS 100%!');
console.log('====================================================');
