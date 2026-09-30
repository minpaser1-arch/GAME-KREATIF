# SISWA KREATIF DENGAN GAME KREATIF
### Aplikasi Pembelajaran Berbasis Permainan, Generator Soal AI, dan Dokumentasi Asesmen Formatif
**Madrasah Ibtidaiyah Negeri 1 Paser (MIN 1 Paser) — Tahun Pelajaran 2026/2027**

---

## 1. Identitas Resmi Aplikasi & Lembaga

- **Nama Aplikasi:** SISWA KREATIF DENGAN GAME KREATIF
- **Nama Madrasah:** MIN 1 PASER
- **Kepala Madrasah:** Ismail, S.Ag (NIP. 197405122005011003)
- **Pembuat & Pengembang:** Dzakirul Husni, S.Pd. (NIP. 199208152020121008)
- **Jenjang Pendidikan:** Madrasah Ibtidaiyah (MI)
- **Sasaran Utama:** Siswa Kelas VI (Fase C Kurikulum Merdeka), dirancang dapat diperluas untuk kelas lainnya
- **Tahun Pelajaran:** 2026/2027 (dapat dikelola dinamis untuk tahun pelajaran berikutnya)
- **Semester:** Semester Ganjil & Semester Genap
- **Alamat Lembaga:** Jl. R.A. Kartini No. 45, Tanah Grogot, Kabupaten Paser, Kalimantan Timur
- **NPSN:** 60728192 | **NSM:** 111164020001

---

## 2. Fitur Unggulan

1. **Arena Permainan Interaktif di Depan Kelas:**
   - Visualisasi layar penuh ramah anak untuk proyektor kelas atau layar interaktif.
   - Papan 8 kelompok interaktif dengan identitas warna dan nama anggota.
   - Sistem audio efek bawaan (*Web Audio API*) tanpa ketergantungan berkas eksternal: denting jawaban benar, bel salah, *fanfare* bonus bintang, dan gong eliminasi.
   - Kontrol giliran kelompok: otomatis bergantian (*round robin*) atau pemilihan manual oleh guru.
   - Kunci verifikasi jawaban di server (*anti-cheat client*).

2. **Aturan Inti Permainan Terstandarisasi:**
   - **Jawaban Benar:** Menambah **+10 Poin** (`Poin Baru = Poin Lama + 10`), mereset kesalahan beruntun menjadi 0, dan menambah hitungan *streak* beruntun.
   - **Jawaban Salah:** Menambah **+1 Kesalahan Berturut-turut** dan mereset hitungan *streak* menjadi 0.
   - **Eliminasi Otomatis:** Apabila kelompok mencapai **3 kesalahan berturut-turut**, kelompok tersebut seketika dinyatakan **TERELIMINASI** dari sesi aktif dan tidak dapat lagi menjawab pada sisa sesi berjalan.
   - **Bonus Bintang Beruntun:** Setiap kelompok yang berhasil mencapai kelipatan 5 jawaban benar berturut-turut (ke-5, 10, 15, dst.) memperoleh **+5 Bintang** disertai animasi konfeti perayaan dan notifikasi resmi: *"HORE, KALIAN DAPAT BINTANG BERJUMLAH 5 BINTANG!"*.
   - **Idempotensi & Keamanan Skor:** Setiap jawaban dicatat secara atomik di server; pengiriman ulang tidak akan menggandakan poin atau bintang.

3. **Generator Soal Berbasis AI (Gemini 3.8 Flash):**
   - Menghasilkan 1 hingga 100 butir soal sesuai Capaian Pembelajaran Kurikulum Merdeka MI Fase C.
   - Parameter lengkap: Mata pelajaran, Fase, Kelas, Bab/Unit, Materi Pokok, Submateri, Tujuan Pembelajaran, Tingkat Kesulitan (Mudah, Sedang, Sulit, HOTS), Bentuk Soal (Pilihan Ganda 4 opsi A/B/C/D, Benar/Salah, Isian Singkat, Uraian), dan instruksi tambahan.
   - Alur peninjauan guru: Status awal soal selalu **"Perlu Ditinjau"**. Guru dapat menyunting redaksi soal, opsi, kunci jawaban, dan pembahasan sebelum menyetujui dan menyimpannya ke Bank Soal.

4. **Bank Soal & Pengelolaan Paket Pembelajaran:**
   - Pembuatan soal secara manual maupun otomatis via AI.
   - Filter cepat berdasarkan mata pelajaran, materi, tingkat kesulitan, dan status persetujuan.
   - Fitur pemilihan soal untuk membuat **Paket Soal Permainan** baru.
   - Ekspor dan impor data format JSON & CSV.
   - Proteksi integritas: Soal yang telah digunakan dalam permainan diproteksi dengan *soft-delete* (diarsipkan) agar riwayat evaluasi tidak rusak.

5. **5 Mata Pelajaran Utama:**
   - **IPAS (Ilmu Pengetahuan Alam dan Sosial):** Sistem gerak/rangka/otot tubuh manusia, lapisan bumi dan mitigasi bencana, ekosistem dan konservasi fauna khas Kalimantan Timur (seperti Pesut Mahakam).
   - **Matematika:** Operasi hitung campuran bilangan bulat negatif/positif, volume bangun ruang (tabung, prisma, kerucut), pengolahan data statistik dasar (mean, median, modus).
   - **Bahasa Indonesia:** Teks eksplanasi ilmiah, pengisian formulir resmi dan pengiriman, pidato persuasif, karya sastra anak.
   - **Pendidikan Pancasila:** Pengamalan sila-sila Pancasila di lingkungan madrasah, norma hukum dan kesopanan, hak dan kewajiban warga negara.
   - **Seni Budaya dan Prakarya (SBdP):** Reklame dan poster edukatif layanan masyarakat, interval tangga nada diatonis mayor/minor, seni tari dan kriya daerah Nusantara.

6. **8 Kelompok Siswa Bawaan:**
   - **Garuda** (Merah Semangat - `#EF4444`)
   - **Elang** (Biru Langit - `#0284C7`)
   - **Rajawali** (Hijau Zamrud - `#10B981`)
   - **Cendekia** (Kuning Keemasan - `#F59E0B`)
   - **Kreator** (Ungu Kreatif - `#8B5CF6`)
   - **Inovator** (Teal Modern - `#0D9488`)
   - **Juara** (Indigo Prestasi - `#4F46E5`)
   - **Bintang** (Oranye Bersinar - `#F97316`)
   *(Setiap kelompok menampung hingga 4 siswa per kelompok secara default dan nama kelompok serta anggotanya dapat dikonfigurasi oleh guru).*

7. **Dokumentasi, Laporan, & Cetak Raport Resmi:**
   - Rekapitulasi per permainan, per mata pelajaran, per semester, dan per tahun ajaran.
   - Generator dokumen cetak **Berita Acara & Rekapitulasi Nilai Asesmen Formatif** berstandar resmi MIN 1 Paser lengkap dengan Kop Surat madrasah, NSM, NPSN, serta kolom tanda tangan Kepala Madrasah (**Ismail, S.Ag**) dan Guru Pengampu (**Dzakirul Husni, S.Pd.**).
   - Ekspor lembar kerja CSV.

---

## 3. Struktur Berkas Proyek

```text
/
├── .env.example                                  # Contoh variabel lingkungan
├── index.html                                    # Entry point HTML aplikasi web
├── metadata.json                                 # Metadata & hak akses AI Studio
├── package.json                                  # Konfigurasi dependensi dan scripts
├── schema.sql                                    # Referensi skema SQL tingkat root
├── server.ts                                     # Backend full-stack Express + Vite Middleware + API
├── tsconfig.json                                 # Konfigurasi TypeScript
├── vite.config.ts                                # Konfigurasi Vite & Tailwind CSS
├── data/
│   └── database.json                             # Penyimpanan persisten lokal aplikasi
├── src/
│   ├── App.tsx                                   # Komponen utama orchestrator tampilan
│   ├── main.tsx                                  # Entry point React
│   ├── index.css                                 # Tailwind CSS global styles
│   ├── types/
│   │   └── index.ts                              # Definisi tipe TypeScript lengkap
│   ├── server/
│   │   └── storage.ts                            # Modul data layer dan seed awal kurikulum
│   ├── lib/
│   │   ├── api.ts                                # Layanan klien API HTTP
│   │   └── sound.ts                              # Synthesizer audio efek berbasis Web Audio API
│   ├── assets/
│   │   └── images/                               # Logo, ilustrasi kelas, dan piala resmi
│   ├── components/
│   │   ├── Header.tsx                            # Top Bar Navigation sesuai Top Bar Contract
│   │   ├── Footer.tsx                            # Footer kredensial resmi madrasah
│   │   ├── CelebrationModal.tsx                  # Modal animasi perayaan bintang & eliminasi
│   │   └── PrintableReport.tsx                   # Dokumen cetak Berita Acara & Rekap Nilai
│   └── views/
│       ├── DashboardView.tsx                     # Dashboard utama metrik & akses modul
│       ├── GameArenaView.tsx                     # Layar pelaksanaan kuis interaktif di depan kelas
│       ├── GameSetupView.tsx                     # Wizard konfigurasi kelompok & pemilihan paket
│       ├── AiGeneratorView.tsx                   # Generator soal AI berbasis Gemini 3.8 Flash
│       ├── QuestionBankView.tsx                  # Bank soal, paket pembelajaran, dan kurasi
│       ├── ArchiveView.tsx                       # Arsip riwayat permainan & log transaksi
│       ├── ReportsView.tsx                       # Rekap nilai kumulatif, akurasi, dan ekspor
│       └── SettingsView.tsx                      # Pengaturan madrasah, tahun ajaran, dan deployment
├── supabase/
│   └── migrations/
│       └── 20260929_siswa_kreatif_schema.sql     # Skema DDL PostgreSQL + RLS Policies + Stored Procedure
└── tests/
    └── game-rules.test.ts                        # Pengujian otomatis 10 skenario aturan permainan
```

---

## 4. Panduan Menjalankan Secara Lokal (Development)

### Prasyarat
- Node.js versi 18 atau lebih baru (LTS direkomendasikan)
- npm versi 9 atau lebih baru
- Git

### Langkah Instalasi
1. Kloning repositori atau unduh kode sumber proyek:
   ```bash
   git clone <URL_REPOSITORI_ANDA>
   cd siswa-kreatif-game-kreatif
   ```

2. Instal dependensi:
   ```bash
   npm install
   ```

3. Salin berkas lingkungan dari `.env.example` ke `.env`:
   ```bash
   cp .env.example .env
   ```

4. Jalankan aplikasi dalam mode pengembangan:
   ```bash
   npm run dev
   ```

5. Buka peramban di `http://localhost:3000`. Aplikasi akan berjalan dengan server Express yang memuat seluruh endpoint `/api/*` terintegrasi dengan Vite middleware.

---

## 5. Panduan Menjalankan Pengujian Aturan Permainan

Aplikasi dilengkapi dengan rangkaian pengujian otomatis terhadap 10 skenario inti aturan permainan:
```bash
npx tsx tests/game-rules.test.ts
```

Output pengujian:
- ✅ Jawaban benar menambah 10 poin.
- ✅ Jawaban salah menambah penghitung kesalahan berturut-turut.
- ✅ Jawaban benar mereset kesalahan berturut-turut ke 0.
- ✅ Tiga kesalahan berturut-turut menyebabkan eliminasi otomatis.
- ✅ Lima jawaban benar berturut-turut memberikan 5 bintang.
- ✅ Sepuluh jawaban benar berturut-turut memberikan total 10 bintang dari dua bonus.
- ✅ Jawaban salah memutus streak ke 0.
- ✅ Kelompok tereliminasi ditolak saat mencoba menjawab.
- ✅ Idempotensi: jawaban duplikat ditolak tanpa menggandakan poin.
- ✅ Generator menolak jumlah soal di luar rentang 1–100.

---

## 6. Panduan Deployment Produksi (Vercel & Supabase)

### A. Konfigurasi Database Supabase
1. Masuk ke [Supabase Dashboard](https://supabase.com) dan buat proyek baru (misal: `min1paser-siswakreatif`).
2. Masuk ke menu **SQL Editor** pada dashboard Supabase.
3. Buka berkas `supabase/migrations/20260929_siswa_kreatif_schema.sql` pada proyek ini, salin seluruh isi script, dan tempel ke SQL Editor Supabase, lalu jalankan (**Run**).
4. Skema akan membuat seluruh tabel (`profiles`, `academic_years`, `semesters`, `subjects`, `learning_materials`, `questions`, `question_sets`, `game_sessions`, `game_teams`, `game_team_members`, `game_answers`, `game_events`), mengaktifkan **Row Level Security (RLS)**, indeks performa, serta fungsi atomik `public.process_game_answer()`.
5. Buka **Project Settings > API** untuk menyalin:
   - `Project URL`
   - `anon / public key`
   - `service_role key` (rahasia server)

### B. Deployment ke Vercel
1. Unggah kode ke repositori GitHub Anda.
2. Buka [Vercel Dashboard](https://vercel.com) dan pilih **Add New > Project**, lalu impor repositori GitHub tersebut.
3. Pada bagian **Environment Variables**, tambahkan:
   - `GEMINI_API_KEY`: API Key Gemini Anda dari Google AI Studio
   - `NEXT_PUBLIC_SUPABASE_URL`: URL Proyek Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon Key Supabase
   - `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key Supabase
4. Klik **Deploy**. Vercel akan membangun aplikasi dan menyediakan tautan produksi HTTPS yang aman.

---

## 7. Pemeliharaan & Integritas Data

- **Pencadangan Data:** Berkas `data/database.json` di server menyimpan seluruh riwayat permainan, soal, dan profil madrasah secara terstruktur. Lakukan *backup* berkala terhadap folder `data/` atau jalankan cadangan snapshot Supabase.
- **Audit Transaksi:** Setiap jawaban benar, salah, eliminasi, dan bonus bintang tercatat di log peristiwa (`game_events` / `session.events`) bersama dengan stempel waktu untuk audit transparansi kompetisi kelas.

---
*Didedikasikan untuk kemajuan pendidikan anak bangsa di Madrasah Ibtidaiyah Negeri 1 Paser, Kabupaten Paser, Kalimantan Timur.*
