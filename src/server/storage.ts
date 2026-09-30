import fs from 'fs';
import path from 'path';
import {
  UserProfile,
  SchoolProfile,
  AcademicYear,
  Semester,
  Subject,
  Question,
  QuestionSet,
  GameSession,
  GameTeam
} from '../types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export interface DatabaseSchema {
  school: SchoolProfile;
  users: UserProfile[];
  academicYears: AcademicYear[];
  semesters: Semester[];
  subjects: Subject[];
  questions: Question[];
  questionSets: QuestionSet[];
  gameSessions: GameSession[];
}

const defaultSchool: SchoolProfile = {
  name: 'MIN 1 PASER',
  appTitle: 'SISWA KREATIF DENGAN GAME KREATIF',
  headmasterName: 'Ismail, S.Ag',
  headmasterNip: '197405122005011003',
  developerName: 'Dzakirul Husni, S.Pd.',
  developerTitle: 'Guru Pembina & Pengembang Aplikasi',
  educationLevel: 'Madrasah Ibtidaiyah (MI)',
  targetGrade: 'Kelas VI (Fase C)',
  address: 'Jl. R.A. Kartini No. 45, Tanah Grogot, Kabupaten Paser',
  district: 'Tanah Grogot',
  province: 'Kalimantan Timur',
  npsn: '60728192',
  nsm: '111164020001',
  logoUrl: '/src/assets/images/logo_siswa_kreatif_1790734101682.jpg'
};

const defaultUsers: UserProfile[] = [
  {
    id: 'user-admin-1',
    name: 'Dzakirul Husni, S.Pd.',
    email: 'dzakirul@min1paser.sch.id',
    role: 'admin',
    nip: '199208152020121008',
    createdAt: '2026-07-01T08:00:00.000Z'
  },
  {
    id: 'user-guru-1',
    name: 'Siti Aminah, S.Pd.I',
    email: 'guru.kelas6@min1paser.sch.id',
    role: 'guru',
    nip: '198803142015052002',
    createdAt: '2026-07-01T08:00:00.000Z'
  },
  {
    id: 'user-kamad-1',
    name: 'Ismail, S.Ag',
    email: 'kamad@min1paser.sch.id',
    role: 'admin',
    nip: '197405122005011003',
    createdAt: '2026-07-01T08:00:00.000Z'
  }
];

const defaultAcademicYears: AcademicYear[] = [
  {
    id: 'ay-2026-2027',
    name: '2026/2027',
    isActive: true,
    createdAt: '2026-07-01T08:00:00.000Z'
  },
  {
    id: 'ay-2027-2028',
    name: '2027/2028',
    isActive: false,
    createdAt: '2026-07-01T08:00:00.000Z'
  }
];

const defaultSemesters: Semester[] = [
  {
    id: 'sem-2026-ganjil',
    academicYearId: 'ay-2026-2027',
    type: 'ganjil',
    name: 'Semester Ganjil 2026/2027',
    isActive: true
  },
  {
    id: 'sem-2026-genap',
    academicYearId: 'ay-2026-2027',
    type: 'genap',
    name: 'Semester Genap 2026/2027',
    isActive: false
  }
];

const defaultSubjects: Subject[] = [
  {
    id: 'sub-ipas',
    code: 'IPAS-VI',
    name: 'IPAS (Ilmu Pengetahuan Alam dan Sosial)',
    fase: 'Fase C',
    grade: 'Kelas VI',
    description: 'Pembelajaran sains, sistem organ tubuh, geografi, dan lingkungan hidup sesuai Kurikulum Merdeka MI.',
    color: '#10B981',
    iconName: 'Leaf',
    topics: [
      {
        id: 'top-ipas-1',
        subjectId: 'sub-ipas',
        chapter: 'Bab 1',
        material: 'Bagaimana Tubuh Kita Bergerak',
        submaterial: 'Sistem Rangka, Sendi, dan Otot Manusia',
        learningObjective: 'Siswa dapat menjelaskan fungsi rangka, sendi, dan otot dalam sistem gerak manusia serta cara merawat kesehatannya.'
      },
      {
        id: 'top-ipas-2',
        subjectId: 'sub-ipas',
        chapter: 'Bab 2',
        material: 'Mengenal Bumi Kita',
        submaterial: 'Lapisan Bumi, Gempa, dan Gunung Berapi',
        learningObjective: 'Siswa dapat mengidentifikasi struktur lapisan bumi dan mitigasi bencana alam di Indonesia.'
      },
      {
        id: 'top-ipas-3',
        subjectId: 'sub-ipas',
        chapter: 'Bab 3',
        material: 'Ekosistem dan Keanekaragaman Hayati',
        submaterial: 'Rantai Makanan dan Pelestarian Flora Fauna Khas Kalimantan Timur',
        learningObjective: 'Siswa dapat menganalisis interaksi antar komponen ekosistem dan pentingnya konservasi flora-fauna khas Paser/Kaltim.'
      }
    ]
  },
  {
    id: 'sub-matematika',
    code: 'MTK-VI',
    name: 'Matematika',
    fase: 'Fase C',
    grade: 'Kelas VI',
    description: 'Operasi bilangan bulat, geometri bangun ruang, dan penyajian data statistik dasar.',
    color: '#0284C7',
    iconName: 'Calculator',
    topics: [
      {
        id: 'top-mtk-1',
        subjectId: 'sub-matematika',
        chapter: 'Bab 1',
        material: 'Bilangan Bulat Negatif dan Positif',
        submaterial: 'Operasi Penjumlahan, Pengurangan, dan Perkalian',
        learningObjective: 'Siswa dapat menyelesaikan operasi hitung campuran bilangan bulat dalam masalah sehari-hari.'
      },
      {
        id: 'top-mtk-2',
        subjectId: 'sub-matematika',
        chapter: 'Bab 2',
        material: 'Geometri Bangun Ruang',
        submaterial: 'Volume dan Luas Permukaan Prisma, Tabung, dan Kerucut',
        learningObjective: 'Siswa mampu menghitung volume tabung, prisma, dan kerucut serta memecahkan soal kontekstual.'
      },
      {
        id: 'top-mtk-3',
        subjectId: 'sub-matematika',
        chapter: 'Bab 3',
        material: 'Pengolahan dan Penyajian Data',
        submaterial: 'Mean, Median, Modus, dan Diagram Batang',
        learningObjective: 'Siswa dapat menentukan nilai rata-rata, nilai tengah, dan modus dari kumpulan data hasil asesmen.'
      }
    ]
  },
  {
    id: 'sub-bahasa-indonesia',
    code: 'BIN-VI',
    name: 'Bahasa Indonesia',
    fase: 'Fase C',
    grade: 'Kelas VI',
    description: 'Literasi teks eksplanasi, formulir, pidato persuasif, dan karya sastra anak.',
    color: '#F59E0B',
    iconName: 'BookOpen',
    topics: [
      {
        id: 'top-bin-1',
        subjectId: 'sub-bahasa-indonesia',
        chapter: 'Bab 1',
        material: 'Teks Eksplanasi Ilmiah',
        submaterial: 'Menemukan Gagasan Pokok dan Fakta Penting',
        learningObjective: 'Siswa dapat menemukan gagasan utama dan hubungan sebab-akibat dalam teks eksplanasi ilmiah.'
      },
      {
        id: 'top-bin-2',
        subjectId: 'sub-bahasa-indonesia',
        chapter: 'Bab 2',
        material: 'Teks Formulir dan Surat Resmi',
        submaterial: 'Pengisian Formulir Pendaftaran dan Pos Wesel',
        learningObjective: 'Siswa dapat mengisi formulir pengiriman barang, pendaftaran lomba, dan memahami bagian surat resmi.'
      }
    ]
  },
  {
    id: 'sub-pendidikan-pancasila',
    code: 'PPN-VI',
    name: 'Pendidikan Pancasila',
    fase: 'Fase C',
    grade: 'Kelas VI',
    description: 'Pengamalan nilai Pancasila, norma hukum, toleransi, dan wawasan kebangsaan madrasah.',
    color: '#EF4444',
    iconName: 'Shield',
    topics: [
      {
        id: 'top-ppn-1',
        subjectId: 'sub-pendidikan-pancasila',
        chapter: 'Bab 1',
        material: 'Penerapan Nilai-Nilai Pancasila',
        submaterial: 'Pengamalan Sila 1 sampai Sila 5 di Lingkungan Madrasah dan Masyarakat',
        learningObjective: 'Siswa dapat menganalisis dan menerapkan perilaku yang mencerminkan sila-sila Pancasila dalam pergaulan sehari-hari.'
      },
      {
        id: 'top-ppn-2',
        subjectId: 'sub-pendidikan-pancasila',
        chapter: 'Bab 2',
        material: 'Norma, Hak, dan Kewajiban Warga Negara',
        submaterial: 'Keseimbangan Hak dan Kewajiban Siswa di Madrasah',
        learningObjective: 'Siswa dapat membedakan norma kesopanan, kesusilaan, hukum, dan agama serta mempraktikkan kewajiban sebagai pelajar.'
      }
    ]
  },
  {
    id: 'sub-sbdp',
    code: 'SBDP-VI',
    name: 'Seni Budaya dan Prakarya (SBdP)',
    fase: 'Fase C',
    grade: 'Kelas VI',
    description: 'Apresiasi seni rupa, reklame, musik tradisional, dan tari kreasi Nusantara.',
    color: '#8B5CF6',
    iconName: 'Palette',
    topics: [
      {
        id: 'top-sbdp-1',
        subjectId: 'sub-sbdp',
        chapter: 'Bab 1',
        material: 'Reklame dan Poster Edukatif',
        submaterial: 'Ciri Reklame Komersial dan Non-Komersial',
        learningObjective: 'Siswa dapat merancang poster persuasif dan membedakan jenis-jenis reklame di ruang publik.'
      },
      {
        id: 'top-sbdp-2',
        subjectId: 'sub-sbdp',
        chapter: 'Bab 2',
        material: 'Interval Nada dan Lagu Daerah',
        submaterial: 'Tangga Nada Diatonis Mayor dan Minor serta Musik Tradisional Paser',
        learningObjective: 'Siswa dapat mengidentifikasi tangga nada diatonis mayor/minor dan mengenali alat musik tradisional daerah.'
      }
    ]
  }
];

const defaultQuestions: Question[] = [
  // IPAS Questions
  {
    id: 'q-ipas-01',
    subjectId: 'sub-ipas',
    subjectName: 'IPAS (Ilmu Pengetahuan Alam dan Sosial)',
    fase: 'Fase C',
    grade: 'Kelas VI',
    chapter: 'Bab 1',
    material: 'Bagaimana Tubuh Kita Bergerak',
    submaterial: 'Sistem Rangka dan Sendi',
    learningObjective: 'Siswa dapat menjelaskan fungsi sendi peluru.',
    difficulty: 'sedang',
    type: 'pilihan_ganda',
    questionText: 'Sendi yang memungkinkan terjadinya gerakan ke segala arah pada tubuh manusia adalah...',
    options: [
      'A. Sendi engsel pada siku',
      'B. Sendi peluru pada gelang bahu dan gelang panggul',
      'C. Sendi putar pada leher',
      'D. Sendi pelana pada ibu jari'
    ],
    correctAnswer: 'B',
    explanation: 'Sendi peluru menghubungkan tulang berbentuk bola dengan mangkuk tulang, memungkinkan gerakan bebas ke segala arah seperti pada bahu dan panggul.',
    source: 'manual',
    status: 'disetujui',
    createdAt: '2026-07-10T09:00:00.000Z',
    updatedAt: '2026-07-10T09:00:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },
  {
    id: 'q-ipas-02',
    subjectId: 'sub-ipas',
    subjectName: 'IPAS (Ilmu Pengetahuan Alam dan Sosial)',
    fase: 'Fase C',
    grade: 'Kelas VI',
    chapter: 'Bab 2',
    material: 'Mengenal Bumi Kita',
    submaterial: 'Lapisan Bumi',
    learningObjective: 'Siswa mengidentifikasi lapisan terluar bumi.',
    difficulty: 'mudah',
    type: 'pilihan_ganda',
    questionText: 'Lapisan bumi terluar tempat makhluk hidup tinggal dan melakukan aktivitas disebut...',
    options: [
      'A. Kerak bumi (crust)',
      'B. Mantel bumi (mantle)',
      'C. Inti luar (outer core)',
      'D. Inti dalam (inner core)'
    ],
    correctAnswer: 'A',
    explanation: 'Kerak bumi adalah lapisan paling luar dan paling tipis dari bumi, tempat seluruh ekosistem daratan dan lautan berada.',
    source: 'manual',
    status: 'disetujui',
    createdAt: '2026-07-10T09:05:00.000Z',
    updatedAt: '2026-07-10T09:05:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },
  {
    id: 'q-ipas-03',
    subjectId: 'sub-ipas',
    subjectName: 'IPAS (Ilmu Pengetahuan Alam dan Sosial)',
    fase: 'Fase C',
    grade: 'Kelas VI',
    chapter: 'Bab 3',
    material: 'Ekosistem dan Keanekaragaman Hayati',
    submaterial: 'Konservasi Fauna Kaltim',
    learningObjective: 'Siswa mengidentifikasi satwa endemik Kalimantan Timur.',
    difficulty: 'sedang',
    type: 'pilihan_ganda',
    questionText: 'Hewan mamalia air tawar yang menjadi simbol kelestarian perairan sungai di Kalimantan Timur adalah...',
    options: [
      'A. Bekantan',
      'B. Pesut Mahakam',
      'C. Orangutan',
      'D. Burung Enggang'
    ],
    correctAnswer: 'B',
    explanation: 'Pesut Mahakam (Orcaella brevirostris) adalah lumba-lumba air tawar yang hidup di Sungai Mahakam, Kalimantan Timur dan berstatus sangat terancam punah.',
    source: 'manual',
    status: 'disetujui',
    createdAt: '2026-07-10T09:10:00.000Z',
    updatedAt: '2026-07-10T09:10:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },
  {
    id: 'q-ipas-04',
    subjectId: 'sub-ipas',
    subjectName: 'IPAS (Ilmu Pengetahuan Alam dan Sosial)',
    fase: 'Fase C',
    grade: 'Kelas VI',
    chapter: 'Bab 1',
    material: 'Bagaimana Tubuh Kita Bergerak',
    submaterial: 'Kesehatan Tulang',
    learningObjective: 'Siswa memahami kelainan tulang lordosis.',
    difficulty: 'hots',
    type: 'pilihan_ganda',
    questionText: 'Kebiasaan posisi duduk yang terlalu condong ke depan sehingga tulang belakang melengkung ke belakang dinamakan...',
    options: [
      'A. Skoliosis',
      'B. Kifosis',
      'C. Lordosis',
      'D. Osteoporosis'
    ],
    correctAnswer: 'B',
    explanation: 'Kifosis adalah kelainan tulang belakang melengkung ke arah belakang sehingga tampak membungkuk, sering dipicu posisi duduk yang salah terus-menerus.',
    source: 'ai_gemini',
    status: 'disetujui',
    createdAt: '2026-07-10T09:15:00.000Z',
    updatedAt: '2026-07-10T09:15:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },
  {
    id: 'q-ipas-05',
    subjectId: 'sub-ipas',
    subjectName: 'IPAS (Ilmu Pengetahuan Alam dan Sosial)',
    fase: 'Fase C',
    grade: 'Kelas VI',
    chapter: 'Bab 2',
    material: 'Mengenal Bumi Kita',
    submaterial: 'Tata Surya dan Gerak Bumi',
    learningObjective: 'Siswa memahami akibat revolusi bumi.',
    difficulty: 'sedang',
    type: 'pilihan_ganda',
    questionText: 'Peristiwa pergantian musim dan perbedaan lamanya waktu siang dan malam di belahan bumi merupakan akibat dari...',
    options: [
      'A. Rotasi bumi',
      'B. Revolusi bumi',
      'C. Gravitasi bulan',
      'D. Pasang surut air laut'
    ],
    correctAnswer: 'B',
    explanation: 'Revolusi bumi mengelilingi matahari disertai kemiringan sumbu bumi menyebabkan pergantian musim dan perbedaan panjang siang-malam.',
    source: 'manual',
    status: 'disetujui',
    createdAt: '2026-07-10T09:20:00.000Z',
    updatedAt: '2026-07-10T09:20:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },

  // Matematika Questions
  {
    id: 'q-mtk-01',
    subjectId: 'sub-matematika',
    subjectName: 'Matematika',
    fase: 'Fase C',
    grade: 'Kelas VI',
    chapter: 'Bab 1',
    material: 'Bilangan Bulat Negatif dan Positif',
    submaterial: 'Operasi Campuran',
    learningObjective: 'Siswa menyelesaikan operasi hitung bilangan bulat.',
    difficulty: 'sedang',
    type: 'pilihan_ganda',
    questionText: 'Hasil dari -15 + 24 × (-2) - (-30) adalah...',
    options: [
      'A. -33',
      'B. 3',
      'C. -18',
      'D. -45'
    ],
    correctAnswer: 'A',
    explanation: 'Kerjakan perkalian dulu: 24 × (-2) = -48. Lalu: -15 + (-48) - (-30) = -63 + 30 = -33.',
    source: 'manual',
    status: 'disetujui',
    createdAt: '2026-07-10T09:30:00.000Z',
    updatedAt: '2026-07-10T09:30:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },
  {
    id: 'q-mtk-02',
    subjectId: 'sub-matematika',
    subjectName: 'Matematika',
    fase: 'Fase C',
    grade: 'Kelas VI',
    chapter: 'Bab 2',
    material: 'Geometri Bangun Ruang',
    submaterial: 'Volume Tabung',
    learningObjective: 'Siswa menghitung volume tabung dengan jari-jari 7 cm dan tinggi 10 cm.',
    difficulty: 'sedang',
    type: 'pilihan_ganda',
    questionText: 'Sebuah kaleng susu berbentuk tabung memiliki jari-jari alas 7 cm dan tinggi 10 cm. Volume kaleng tersebut (menggunakan π = 22/7) adalah...',
    options: [
      'A. 1.540 cm³',
      'B. 440 cm³',
      'C. 770 cm³',
      'D. 3.080 cm³'
    ],
    correctAnswer: 'A',
    explanation: 'V = π × r² × t = (22/7) × 7 × 7 × 10 = 22 × 7 × 10 = 1.540 cm³.',
    source: 'manual',
    status: 'disetujui',
    createdAt: '2026-07-10T09:35:00.000Z',
    updatedAt: '2026-07-10T09:35:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },
  {
    id: 'q-mtk-03',
    subjectId: 'sub-matematika',
    subjectName: 'Matematika',
    fase: 'Fase C',
    grade: 'Kelas VI',
    chapter: 'Bab 3',
    material: 'Pengolahan dan Penyajian Data',
    submaterial: 'Mean (Rata-rata)',
    learningObjective: 'Siswa menghitung nilai rata-rata dari sekelompok nilai ulangan.',
    difficulty: 'mudah',
    type: 'pilihan_ganda',
    questionText: 'Nilai tugas matematika 5 siswa MIN 1 Paser berturut-turut adalah: 80, 85, 90, 75, dan 95. Rata-rata (mean) nilai tugas tersebut adalah...',
    options: [
      'A. 82',
      'B. 85',
      'C. 86',
      'D. 88'
    ],
    correctAnswer: 'B',
    explanation: 'Total nilai = 80 + 85 + 90 + 75 + 95 = 425. Rata-rata = 425 / 5 = 85.',
    source: 'manual',
    status: 'disetujui',
    createdAt: '2026-07-10T09:40:00.000Z',
    updatedAt: '2026-07-10T09:40:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },
  {
    id: 'q-mtk-04',
    subjectId: 'sub-matematika',
    subjectName: 'Matematika',
    fase: 'Fase C',
    grade: 'Kelas VI',
    chapter: 'Bab 1',
    material: 'Bilangan Bulat Negatif dan Positif',
    submaterial: 'Soal Cerita Termometer',
    learningObjective: 'Siswa memecahkan soal perubahan suhu.',
    difficulty: 'hots',
    type: 'pilihan_ganda',
    questionText: 'Suhu di dalam lemari pembeku mula-mula -6°C. Karena listrik padam, suhu naik 2°C setiap 15 menit. Setelah listrik padam selama 1 jam, suhu lemari pembeku menjadi...',
    options: [
      'A. -2°C',
      'B. 2°C',
      'C. 8°C',
      'D. -14°C'
    ],
    correctAnswer: 'B',
    explanation: '1 jam = 60 menit. Kenaikan suhu = (60 / 15) × 2°C = 4 × 2°C = 8°C. Suhu akhir = -6°C + 8°C = +2°C.',
    source: 'ai_gemini',
    status: 'disetujui',
    createdAt: '2026-07-10T09:45:00.000Z',
    updatedAt: '2026-07-10T09:45:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },

  // Bahasa Indonesia Questions
  {
    id: 'q-bin-01',
    subjectId: 'sub-bahasa-indonesia',
    subjectName: 'Bahasa Indonesia',
    fase: 'Fase C',
    grade: 'Kelas VI',
    chapter: 'Bab 1',
    material: 'Teks Eksplanasi Ilmiah',
    submaterial: 'Struktur Teks',
    learningObjective: 'Siswa memahami struktur teks eksplanasi.',
    difficulty: 'mudah',
    type: 'pilihan_ganda',
    questionText: 'Bagian pertama dalam struktur teks eksplanasi yang berisi pengenalan fenomena atau peristiwa yang akan dibahas disebut...',
    options: [
      'A. Pernyataan umum',
      'B. Deretan penjelas',
      'C. Interpretasi atau kesimpulan',
      'D. Resolusi permasalahan'
    ],
    correctAnswer: 'A',
    explanation: 'Struktur teks eksplanasi terdiri atas: (1) Pernyataan umum (pengenalan), (2) Deretan penjelas (sebab-akibat), dan (3) Interpretasi (ulasan/kesimpulan).',
    source: 'manual',
    status: 'disetujui',
    createdAt: '2026-07-10T10:00:00.000Z',
    updatedAt: '2026-07-10T10:00:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },
  {
    id: 'q-bin-02',
    subjectId: 'sub-bahasa-indonesia',
    subjectName: 'Bahasa Indonesia',
    fase: 'Fase C',
    grade: 'Kelas VI',
    chapter: 'Bab 2',
    material: 'Teks Formulir dan Surat Resmi',
    submaterial: 'Data Pribadi Formulir',
    learningObjective: 'Siswa mengidentifikasi data penting dalam formulir.',
    difficulty: 'mudah',
    type: 'pilihan_ganda',
    questionText: 'Informasi yang mutlak harus dicantumkan secara jelas dan valid pada formulir pengiriman uang atau barang pos adalah...',
    options: [
      'A. Hobi pengirim dan penerima',
      'B. Alamat lengkap dan nomor telepon penerima',
      'C. Cita-cita pengirim',
      'D. Warna pakaian kesukaan penerima'
    ],
    correctAnswer: 'B',
    explanation: 'Alamat lengkap beserta nomor telepon penerima mutlak diperlukan agar kurir dapat menemukan lokasi pengiriman dengan akurat.',
    source: 'manual',
    status: 'disetujui',
    createdAt: '2026-07-10T10:05:00.000Z',
    updatedAt: '2026-07-10T10:05:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },

  // Pendidikan Pancasila Questions
  {
    id: 'q-ppn-01',
    subjectId: 'sub-pendidikan-pancasila',
    subjectName: 'Pendidikan Pancasila',
    fase: 'Fase C',
    grade: 'Kelas VI',
    chapter: 'Bab 1',
    material: 'Penerapan Nilai-Nilai Pancasila',
    submaterial: 'Sila ke-3',
    learningObjective: 'Siswa mengidentifikasi sikap sesuai Sila ke-3.',
    difficulty: 'mudah',
    type: 'pilihan_ganda',
    questionText: 'Sikap saling menghargai teman yang berbeda suku dan menjaga kerukunan saat bermain di halaman MIN 1 Paser mencerminkan pengamalan Pancasila sila ke...',
    options: [
      'A. Pertama (Ketuhanan Yang Maha Esa)',
      'B. Kedua (Kemanusiaan yang Adil dan Beradab)',
      'C. Ketiga (Persatuan Indonesia)',
      'D. Keempat (Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan)'
    ],
    correctAnswer: 'C',
    explanation: 'Sila ke-3 "Persatuan Indonesia" mengajarkan persaudaraan, persatuan, dan kerukunan di tengah keberagaman bangsa.',
    source: 'manual',
    status: 'disetujui',
    createdAt: '2026-07-10T10:15:00.000Z',
    updatedAt: '2026-07-10T10:15:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },
  {
    id: 'q-ppn-02',
    subjectId: 'sub-pendidikan-pancasila',
    subjectName: 'Pendidikan Pancasila',
    fase: 'Fase C',
    grade: 'Kelas VI',
    chapter: 'Bab 2',
    material: 'Norma, Hak, dan Kewajiban Warga Negara',
    submaterial: 'Kewajiban Pelajar',
    learningObjective: 'Siswa memahami kewajiban utama siswa madrasah.',
    difficulty: 'mudah',
    type: 'pilihan_ganda',
    questionText: 'Contoh kewajiban seorang siswa madrasah terhadap sarana dan prasarana madrasah adalah...',
    options: [
      'A. Menuntut nilai rapor selalu tinggi tanpa belajar',
      'B. Merawat, menjaga kebersihan, dan tidak merusak fasilitas kelas',
      'C. Menyerahkan urusan kebersihan sepenuhnya pada penjaga sekolah',
      'D. Menggunakan sarana madrasah hanya untuk kepentingan pribadi'
    ],
    correctAnswer: 'B',
    explanation: 'Merawat dan menjaga kebersihan fasilitas madrasah adalah kewajiban bersama seluruh siswa sebagai wujud tanggung jawab.',
    source: 'manual',
    status: 'disetujui',
    createdAt: '2026-07-10T10:20:00.000Z',
    updatedAt: '2026-07-10T10:20:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },
  {
    id: 'q-ppn-03',
    subjectId: 'sub-pendidikan-pancasila',
    subjectName: 'Pendidikan Pancasila',
    fase: 'Fase C',
    grade: 'Kelas VI',
    chapter: 'Bab 1',
    material: 'Penerapan Nilai-Nilai Pancasila',
    submaterial: 'Musyawarah Mufakat Sila ke-4',
    learningObjective: 'Siswa memahami pentingnya musyawarah untuk mencapai mufakat dalam pengambilan keputusan bersama.',
    difficulty: 'sedang',
    type: 'pilihan_ganda',
    questionText: 'Ketika kelas VI MIN 1 Paser memilih ketua regu kebersihan, cara terbaik yang mencerminkan sila keempat Pancasila adalah...',
    options: [
      'A. Ditentukan sendiri oleh murid yang paling pandai',
      'B. Melakukan musyawarah bersama untuk mufakat atau pemungutan suara secara adil',
      'C. Memilih siswa yang paling kaya atau ditunjuk paksa',
      'D. Menyerahkan keputusan tanpa berdiskusi sama sekali'
    ],
    correctAnswer: 'B',
    explanation: 'Sila ke-4 "Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan" mengutamakan musyawarah untuk mufakat dalam semangat kekeluargaan.',
    source: 'manual',
    status: 'disetujui',
    createdAt: '2026-07-10T10:22:00.000Z',
    updatedAt: '2026-07-10T10:22:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },
  {
    id: 'q-ppn-04',
    subjectId: 'sub-pendidikan-pancasila',
    subjectName: 'Pendidikan Pancasila',
    fase: 'Fase C',
    grade: 'Kelas VI',
    chapter: 'Bab 2',
    material: 'Norma, Hak, dan Kewajiban Warga Negara',
    submaterial: 'Macam-Macam Norma Masyarakat',
    learningObjective: 'Siswa dapat membedakan norma hukum dengan norma kesopanan dan kesusilaan.',
    difficulty: 'hots',
    type: 'pilihan_ganda',
    questionText: 'Norma yang bersumber dari hati nurani manusia tentang baik dan buruknya suatu perbuatan, yang jika dilanggar menimbulkan rasa bersalah dan penyesalan disebut...',
    options: [
      'A. Norma hukum',
      'B. Norma kesusilaan',
      'C. Norma kesopanan',
      'D. Norma adat kebiasaan'
    ],
    correctAnswer: 'B',
    explanation: 'Norma kesusilaan bersumber dari suara hati nurani manusia. Sanksi atas pelanggarannya adalah perasaan bersalah, malu, dan penyesalan mendalam.',
    source: 'manual',
    status: 'disetujui',
    createdAt: '2026-07-10T10:25:00.000Z',
    updatedAt: '2026-07-10T10:25:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },
  {
    id: 'q-ppn-05',
    subjectId: 'sub-pendidikan-pancasila',
    subjectName: 'Pendidikan Pancasila',
    fase: 'Fase C',
    grade: 'Kelas VI',
    chapter: 'Bab 1',
    material: 'Penerapan Nilai-Nilai Pancasila',
    submaterial: 'Keadilan Sosial Sila ke-5',
    learningObjective: 'Siswa memahami wujud nyata pengamalan keadilan sosial.',
    difficulty: 'sedang',
    type: 'pilihan_ganda',
    questionText: 'Menghargai hasil karya orang lain, suka berhemat, dan tidak bergaya hidup mewah merupakan butir pengamalan Pancasila sila ke...',
    options: [
      'A. Pertama',
      'B. Kedua',
      'C. Ketiga',
      'D. Kelima'
    ],
    correctAnswer: 'D',
    explanation: 'Sila ke-5 "Keadilan Sosial bagi Seluruh Rakyat Indonesia" mengajarkan sikap hemat, suka bekerja keras, tidak boros, serta menghargai karya orang lain.',
    source: 'manual',
    status: 'disetujui',
    createdAt: '2026-07-10T10:28:00.000Z',
    updatedAt: '2026-07-10T10:28:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },

  // SBdP Questions
  {
    id: 'q-sbdp-01',
    subjectId: 'sub-sbdp',
    subjectName: 'Seni Budaya dan Prakarya (SBdP)',
    fase: 'Fase C',
    grade: 'Kelas VI',
    chapter: 'Bab 1',
    material: 'Reklame dan Poster Edukatif',
    submaterial: 'Tujuan Poster Layanan Masyarakat',
    learningObjective: 'Siswa membedakan poster komersial dan non-komersial.',
    difficulty: 'sedang',
    type: 'pilihan_ganda',
    questionText: 'Poster yang mengajak masyarakat untuk menjaga kebersihan lingkungan dan menghemat air bersih termasuk jenis poster...',
    options: [
      'A. Niaga / Komersial',
      'B. Layanan Masyarakat / Non-Komersial',
      'C. Penawaran Jasa',
      'D. Iklan Produk'
    ],
    correctAnswer: 'B',
    explanation: 'Poster layanan masyarakat dibuat oleh lembaga atau instansi untuk memberikan edukasi, pesan sosial, dan imbauan tanpa mencari keuntungan materi.',
    source: 'manual',
    status: 'disetujui',
    createdAt: '2026-07-10T10:30:00.000Z',
    updatedAt: '2026-07-10T10:30:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },
  {
    id: 'q-sbdp-02',
    subjectId: 'sub-sbdp',
    subjectName: 'Seni Budaya dan Prakarya (SBdP)',
    fase: 'Fase C',
    grade: 'Kelas VI',
    chapter: 'Bab 2',
    material: 'Interval Nada dan Lagu Daerah',
    submaterial: 'Tangga Nada Diatonis Mayor',
    learningObjective: 'Siswa mengingat pola interval tangga nada mayor.',
    difficulty: 'hots',
    type: 'pilihan_ganda',
    questionText: 'Pola jarak interval nada pada tangga nada diatonis mayor yang tepat adalah...',
    options: [
      'A. 1 - 1 - 1/2 - 1 - 1 - 1 - 1/2',
      'B. 1 - 1/2 - 1 - 1 - 1/2 - 1 - 1',
      'C. 1 - 1 - 1 - 1/2 - 1 - 1 - 1/2',
      'D. 1/2 - 1 - 1 - 1 - 1/2 - 1 - 1'
    ],
    correctAnswer: 'A',
    explanation: 'Susunan interval tangga nada diatonis mayor adalah 1 - 1 - 1/2 - 1 - 1 - 1 - 1/2 (contoh: C - D - E - F - G - A - B - C).',
    source: 'manual',
    status: 'disetujui',
    createdAt: '2026-07-10T10:35:00.000Z',
    updatedAt: '2026-07-10T10:35:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },
  {
    id: 'q-sbdp-03',
    subjectId: 'sub-sbdp',
    subjectName: 'Seni Budaya dan Prakarya (SBdP)',
    fase: 'Fase C',
    grade: 'Kelas VI',
    chapter: 'Bab 2',
    material: 'Interval Nada dan Lagu Daerah',
    submaterial: 'Tarian Tradisional Khas Paser dan Kaltim',
    learningObjective: 'Siswa mengenali seni tari tradisi kearifan lokal Kalimantan Timur.',
    difficulty: 'sedang',
    type: 'pilihan_ganda',
    questionText: 'Tarian pergaulan tradisional khas suku Paser di Kalimantan Timur yang ditarikan berpasangan dengan iringan musik babun dan gambus adalah...',
    options: [
      'A. Tari Saman',
      'B. Tari Ronggeng Paser',
      'C. Tari Piring',
      'D. Tari Kecak'
    ],
    correctAnswer: 'B',
    explanation: 'Tari Ronggeng Paser adalah tarian tradisional pergaulan khas masyarakat Paser, Kalimantan Timur yang diiringi tabuhan gendang babun dan petikan gambus.',
    source: 'manual',
    status: 'disetujui',
    createdAt: '2026-07-10T10:38:00.000Z',
    updatedAt: '2026-07-10T10:38:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },
  {
    id: 'q-sbdp-04',
    subjectId: 'sub-sbdp',
    subjectName: 'Seni Budaya dan Prakarya (SBdP)',
    fase: 'Fase C',
    grade: 'Kelas VI',
    chapter: 'Bab 1',
    material: 'Reklame dan Poster Edukatif',
    submaterial: 'Teknik Seni Patung Nusantara',
    learningObjective: 'Siswa memahami teknik pembuatan karya seni patung 3 dimensi.',
    difficulty: 'sedang',
    type: 'pilihan_ganda',
    questionText: 'Teknik membuat patung dengan cara mengurangi bahan sedikit demi sedikit menggunakan pisau ukir atau pahat pada kayu atau batu disebut...',
    options: [
      'A. Teknik cor (cetak tuang)',
      'B. Teknik pahat (butsir kurangi)',
      'C. Teknik las sambung',
      'D. Teknik anyam'
    ],
    correctAnswer: 'B',
    explanation: 'Teknik pahat dilakukan dengan membuang atau mengurangi bagian bahan keras (kayu, batu) menggunakan alat pahat hingga membentuk patung yang diinginkan.',
    source: 'manual',
    status: 'disetujui',
    createdAt: '2026-07-10T10:40:00.000Z',
    updatedAt: '2026-07-10T10:40:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },
  {
    id: 'q-sbdp-05',
    subjectId: 'sub-sbdp',
    subjectName: 'Seni Budaya dan Prakarya (SBdP)',
    fase: 'Fase C',
    grade: 'Kelas VI',
    chapter: 'Bab 2',
    material: 'Interval Nada dan Lagu Daerah',
    submaterial: 'Pengertian Interval Nada',
    learningObjective: 'Siswa memahami konsep interval nada dasar.',
    difficulty: 'mudah',
    type: 'pilihan_ganda',
    questionText: 'Jarak antara satu nada ke nada lainnya dalam susunan musik dinamakan...',
    options: [
      'A. Tempo',
      'B. Interval nada',
      'C. Birama',
      'D. Dinamika'
    ],
    correctAnswer: 'B',
    explanation: 'Interval nada adalah jarak antara satu nada dengan nada lainnya, baik jarak ke atas (ascending) maupun jarak ke bawah (descending).',
    source: 'manual',
    status: 'disetujui',
    createdAt: '2026-07-10T10:42:00.000Z',
    updatedAt: '2026-07-10T10:42:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },

  // Matematika Soal Tambahan
  {
    id: 'q-mtk-05',
    subjectId: 'sub-matematika',
    subjectName: 'Matematika',
    fase: 'Fase C',
    grade: 'Kelas VI',
    chapter: 'Bab 3',
    material: 'Pengolahan dan Penyajian Data',
    submaterial: 'Median (Nilai Tengah)',
    learningObjective: 'Siswa menentukan nilai tengah (median) data tunggal.',
    difficulty: 'sedang',
    type: 'pilihan_ganda',
    questionText: 'Diberikan data nilai kuis matematika: 7, 8, 6, 9, 8, 7, 10. Nilai median (nilai tengah) dari data tersebut adalah...',
    options: [
      'A. 7',
      'B. 8',
      'C. 8,5',
      'D. 9'
    ],
    correctAnswer: 'B',
    explanation: 'Urutkan data dari yang terkecil: 6, 7, 7, [8], 8, 9, 10. Nilai tengah (ke-4 dari 7 data) adalah 8.',
    source: 'manual',
    status: 'disetujui',
    createdAt: '2026-07-10T10:45:00.000Z',
    updatedAt: '2026-07-10T10:45:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  }
];

const defaultQuestionSets: QuestionSet[] = [
  {
    id: 'set-ipas-01',
    title: 'Paket Asesmen Interaktif IPAS VI - Gerak Tubuh & Bumi',
    subjectId: 'sub-ipas',
    subjectName: 'IPAS (Ilmu Pengetahuan Alam dan Sosial)',
    grade: 'Kelas VI',
    academicYearId: 'ay-2026-2027',
    academicYearName: '2026/2027',
    semesterId: 'sem-2026-ganjil',
    semesterName: 'Semester Ganjil 2026/2027',
    questionIds: ['q-ipas-01', 'q-ipas-02', 'q-ipas-03', 'q-ipas-04', 'q-ipas-05'],
    totalQuestions: 5,
    description: 'Paket latihan soal asesmen formatif Kurikulum Merdeka Fase C materi rangka, bumi, dan fauna khas Kalimantan Timur.',
    isArchived: false,
    createdAt: '2026-07-12T10:00:00.000Z',
    updatedAt: '2026-07-12T10:00:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },
  {
    id: 'set-mtk-01',
    title: 'Paket Kompetisi Kelompok Matematika VI - Bilangan, Geometri & Statistik',
    subjectId: 'sub-matematika',
    subjectName: 'Matematika',
    grade: 'Kelas VI',
    academicYearId: 'ay-2026-2027',
    academicYearName: '2026/2027',
    semesterId: 'sem-2026-ganjil',
    semesterName: 'Semester Ganjil 2026/2027',
    questionIds: ['q-mtk-01', 'q-mtk-02', 'q-mtk-03', 'q-mtk-04', 'q-mtk-05'],
    totalQuestions: 5,
    description: 'Soal latihan logika berhitung bilangan bulat campuran, volume tabung, rata-rata, dan median data.',
    isArchived: false,
    createdAt: '2026-07-12T10:15:00.000Z',
    updatedAt: '2026-07-12T10:15:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },
  {
    id: 'set-ppn-01',
    title: 'Paket Pengamalan Nilai Pendidikan Pancasila VI - Karakter & Norma Pelajar',
    subjectId: 'sub-pendidikan-pancasila',
    subjectName: 'Pendidikan Pancasila',
    grade: 'Kelas VI',
    academicYearId: 'ay-2026-2027',
    academicYearName: '2026/2027',
    semesterId: 'sem-2026-ganjil',
    semesterName: 'Semester Ganjil 2026/2027',
    questionIds: ['q-ppn-01', 'q-ppn-02', 'q-ppn-03', 'q-ppn-04', 'q-ppn-05'],
    totalQuestions: 5,
    description: 'Paket soal pengamalan sila Pancasila, kewajiban madrasah, musyawarah mufakat, dan norma kesusilaan masyarakat.',
    isArchived: false,
    createdAt: '2026-07-12T10:20:00.000Z',
    updatedAt: '2026-07-12T10:20:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },
  {
    id: 'set-sbdp-01',
    title: 'Paket Apresiasi Seni Budaya dan Prakarya (SBdP) VI - Ragam Karya & Seni Daerah',
    subjectId: 'sub-sbdp',
    subjectName: 'Seni Budaya dan Prakarya (SBdP)',
    grade: 'Kelas VI',
    academicYearId: 'ay-2026-2027',
    academicYearName: '2026/2027',
    semesterId: 'sem-2026-ganjil',
    semesterName: 'Semester Ganjil 2026/2027',
    questionIds: ['q-sbdp-01', 'q-sbdp-02', 'q-sbdp-03', 'q-sbdp-04', 'q-sbdp-05'],
    totalQuestions: 5,
    description: 'Paket soal poster edukatif, tangga nada diatonis mayor, tarian adat Ronggeng Paser, teknik patung, dan interval nada.',
    isArchived: false,
    createdAt: '2026-07-12T10:25:00.000Z',
    updatedAt: '2026-07-12T10:25:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  },
  {
    id: 'set-campuran-01',
    title: 'Paket Asesmen Cerdas Cermat Tematik Fase C',
    subjectId: 'sub-pendidikan-pancasila',
    subjectName: 'Pendidikan Pancasila & SBdP',
    grade: 'Kelas VI',
    academicYearId: 'ay-2026-2027',
    academicYearName: '2026/2027',
    semesterId: 'sem-2026-ganjil',
    semesterName: 'Semester Ganjil 2026/2027',
    questionIds: ['q-ppn-01', 'q-ppn-02', 'q-sbdp-01', 'q-sbdp-02'],
    totalQuestions: 4,
    description: 'Uji pemahaman nilai Pancasila, kewajiban madrasah, reklame edukatif, dan tangga nada.',
    isArchived: false,
    createdAt: '2026-07-12T10:30:00.000Z',
    updatedAt: '2026-07-12T10:30:00.000Z',
    createdByName: 'Dzakirul Husni, S.Pd.'
  }
];

export const defaultGameTeamsTemplate: GameTeam[] = [
  {
    id: 'team-garuda',
    name: 'Garuda',
    color: '#EF4444',
    members: [
      { id: 'm-1', name: 'Ahmad Fauzan' },
      { id: 'm-2', name: 'Siti Nurhaliza' },
      { id: 'm-3', name: 'Rizky Pratama' },
      { id: 'm-4', name: 'Aisyah Putri' }
    ],
    points: 0,
    stars: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalAnswered: 0,
    consecutiveErrors: 0,
    currentStreak: 0,
    isEliminated: false
  },
  {
    id: 'team-elang',
    name: 'Elang',
    color: '#0284C7',
    members: [
      { id: 'm-5', name: 'Budi Santoso' },
      { id: 'm-6', name: 'Dewi Lestari' },
      { id: 'm-7', name: 'Muhammad Alif' },
      { id: 'm-8', name: 'Zahra Amelia' }
    ],
    points: 0,
    stars: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalAnswered: 0,
    consecutiveErrors: 0,
    currentStreak: 0,
    isEliminated: false
  },
  {
    id: 'team-rajawali',
    name: 'Rajawali',
    color: '#10B981',
    members: [
      { id: 'm-9', name: 'Fikri Haikal' },
      { id: 'm-10', name: 'Nabila Syakieb' },
      { id: 'm-11', name: 'Dimas Setiawan' },
      { id: 'm-12', name: 'Salma Khairunnisa' }
    ],
    points: 0,
    stars: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalAnswered: 0,
    consecutiveErrors: 0,
    currentStreak: 0,
    isEliminated: false
  },
  {
    id: 'team-cendekia',
    name: 'Cendekia',
    color: '#F59E0B',
    members: [
      { id: 'm-13', name: 'Rian Hidayat' },
      { id: 'm-14', name: 'Meisya Salsabila' },
      { id: 'm-15', name: 'Farhan Maulana' },
      { id: 'm-16', name: 'Tiara Ananda' }
    ],
    points: 0,
    stars: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalAnswered: 0,
    consecutiveErrors: 0,
    currentStreak: 0,
    isEliminated: false
  },
  {
    id: 'team-kreator',
    name: 'Kreator',
    color: '#8B5CF6',
    members: [
      { id: 'm-17', name: 'Gilang Ramadhan' },
      { id: 'm-18', name: 'Annisa Rahma' },
      { id: 'm-19', name: 'Irfan Hakim' },
      { id: 'm-20', name: 'Khadijah Marwah' }
    ],
    points: 0,
    stars: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalAnswered: 0,
    consecutiveErrors: 0,
    currentStreak: 0,
    isEliminated: false
  },
  {
    id: 'team-inovator',
    name: 'Inovator',
    color: '#0D9488',
    members: [
      { id: 'm-21', name: 'Hafiz Ar-Rasyid' },
      { id: 'm-22', name: 'Syifa Nuraini' },
      { id: 'm-23', name: 'Wahyu Nugroho' },
      { id: 'm-24', name: 'Laila Majnun' }
    ],
    points: 0,
    stars: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalAnswered: 0,
    consecutiveErrors: 0,
    currentStreak: 0,
    isEliminated: false
  },
  {
    id: 'team-juara',
    name: 'Juara',
    color: '#4F46E5',
    members: [
      { id: 'm-25', name: 'Ilham Akbar' },
      { id: 'm-26', name: 'Putri Ayu' },
      { id: 'm-27', name: 'Farel Prayoga' },
      { id: 'm-28', name: 'Maya Anggraini' }
    ],
    points: 0,
    stars: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalAnswered: 0,
    consecutiveErrors: 0,
    currentStreak: 0,
    isEliminated: false
  },
  {
    id: 'team-bintang',
    name: 'Bintang',
    color: '#F97316',
    members: [
      { id: 'm-29', name: 'Danu Wirawan' },
      { id: 'm-30', name: 'Zaskia Adya' },
      { id: 'm-31', name: 'Arif Rahman' },
      { id: 'm-32', name: 'Fatimah Az-Zahra' }
    ],
    points: 0,
    stars: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalAnswered: 0,
    consecutiveErrors: 0,
    currentStreak: 0,
    isEliminated: false
  }
];

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Ensure defaults if any key missing
        return {
          school: parsed.school || defaultSchool,
          users: parsed.users || defaultUsers,
          academicYears: parsed.academicYears || defaultAcademicYears,
          semesters: parsed.semesters || defaultSemesters,
          subjects: parsed.subjects || defaultSubjects,
          questions: parsed.questions || defaultQuestions,
          questionSets: parsed.questionSets || defaultQuestionSets,
          gameSessions: parsed.gameSessions || []
        };
      }
    } catch (err) {
      console.error('Error reading database file, using defaults:', err);
    }

    const initialData: DatabaseSchema = {
      school: defaultSchool,
      users: defaultUsers,
      academicYears: defaultAcademicYears,
      semesters: defaultSemesters,
      subjects: defaultSubjects,
      questions: defaultQuestions,
      questionSets: defaultQuestionSets,
      gameSessions: []
    };

    this.saveData(initialData);
    return initialData;
  }

  private saveData(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  public save() {
    this.saveData(this.data);
  }
}

export const dbManager = new DatabaseManager();
