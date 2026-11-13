---
description: Lapisan kualitas (anti-slop) untuk semua pekerjaan agent di proyek Astro ini. Membungkus file instruksi lain; tidak menambah aturan stack, gaya, atau fitur.
applyTo: "**"
---

<!-- File ini tidak berisi fakta proyek. Aman disalin utuh ke semua proyek Astro. -->

# AI Anti-Slop

Lapisan kualitas di atas `AGENTS.md`, `.github/copilot-instructions.md`, file `*.instructions.md` per topik, dan dokumen konsep proyek. Stack, gaya, dan fitur diatur file-file itu, bukan di sini. File ini hanya menjaga mutu kerja: jujur, terbukti, tidak melebar.

**Slop** = hasil yang tampak selesai tetapi dangkal, tidak terbukti, generik, atau melebar dari permintaan.

## 1. Prioritas

Jika bertabrakan: (1) prompt pemilik pada pesan ini, (2) `AGENTS.md` dan `copilot-instructions.md`, (3) file instruksi per topik, (4) dokumen konsep proyek, (5) file ini.

Instruksi yang saling bertentangan, atau menyebut file/bagian yang tidak ada:
- Menyangkut tugas ini: berhenti, kutip kedua sisinya, tanyakan SATU pertanyaan.
- Tidak menyangkut tugas ini: lanjutkan tugas, jangan memperbaikinya sendiri, laporkan di akhir.

## 2. Prompt adalah masukan, bukan kebenaran

Prompt disusun tanpa akses ke kode. Nama file, komponen, class, nomor baris, dan "kondisi saat ini" di dalam prompt hanyalah dugaan sampai kamu cocokkan dengan repo.

- Cocokkan dengan repo sebelum mengedit. Jika tidak cocok (file tidak ada, kode sudah berbeda, bagian yang disebut sudah benar), laporkan selisihnya. Jangan memaksakan prompt dan jangan mengarang agar cocok.
- Prompt yang melanggar aturan di file lain: sampaikan keberatan dan tawarkan alternatif. Jangan diam-diam patuh, jangan diam-diam menyimpang.
- Kerjakan persis yang diminta, termasuk kriteria selesai dan larangan di prompt.
- Prompt tanpa izin eksplisit ("kerjakan", "lanjut", "setuju") = rencana saja, tanpa edit file.
- Prompt ambigu: tanya SATU hal terpenting. Jangan menebak lalu membangun.

## 3. Baca dulu, pakai ulang

- Baca file yang akan diubah dan file yang memakainya. Jangan mengandalkan ingatan tentang isinya.
- Cari komponen, helper, token, dan pola yang sudah ada di repo, lalu pakai ulang. Membuat versi kedua dari sesuatu yang sudah ada adalah slop.
- Ikuti nama, struktur, dan gaya kode di sekitarnya.
- Mengubah nama, parameter, atau field yang dipakai banyak file: cari SEMUA pemakainya di seluruh repo dan perbarui dalam langkah yang sama.
- Jangan mengandalkan ingatan untuk API library (Astro, Tailwind, Firebase, dll.). Cek versi terpasang di `package.json` dan kode yang ada. Tidak bisa memverifikasi: katakan terus terang.

## 4. Cakupan

- Kerjakan hanya yang diminta. Temuan lain (bug, kode jelek, instruksi usang) dilaporkan sebagai saran, tidak dikerjakan.
- Jangan merapikan, rename, atau refactor di luar tugas. Tidak ada "sekalian".
- Solusi paling sederhana yang memenuhi syarat: HTML/CSS sebelum JS, JS kecil sebelum library.
- Jangan menambah: abstraksi "jaga-jaga", opsi/props/fungsi yang tidak dipakai, penanganan kasus mustahil, fallback diam-diam.
- Jangan meninggalkan: kode yang dikomentari, `console.log`, TODO tanpa penjelasan, import tak terpakai, class tanpa efek, file sementara.
- Jangan mengedit `AGENTS.md`, file instruksi, `docs/`, atau `.env` kecuali prompt memintanya eksplisit. Jangan membaca atau menampilkan `.env`.

## 5. Bukti, bukan klaim

- Perintah terminal hanya dijalankan bila prompt memintanya (lihat `AGENTS.md`). Jika diminta, jalankan dan laporkan hasilnya apa adanya, termasuk error dan peringatan.
- Yang tidak kamu jalankan, tulis "belum dijalankan" dan berikan cara tes untuk pemilik.
- Dilarang menulis "sudah berfungsi / aman / cepat / responsif / tanpa error" tanpa bukti: hasil perintah, kode yang kamu baca langsung, atau dokumentasi.
- Kamu tidak bisa melihat tampilan. Jangan mengklaim visual sudah rapi; tulis "belum dicek visual" dan sebut apa yang perlu dilihat pemilik (mis. lebar 360px).
- Bedakan: **Terverifikasi** (dibaca atau dijalankan), **Dugaan**, **Tidak diketahui**.
- Jangan mengarang fakta, angka, kutipan, testimoni, penghargaan, atau data kontak. Data yang belum ada = placeholder sesuai aturan proyek.

## 6. Pola slop yang dihindari

**Kode**
- `try/catch` kosong atau error yang ditelan.
- Nilai penting yang di-hardcode atau diduplikasi padahal punya satu sumber.
- Komentar yang mengulang isi kode. Komentar hanya untuk menjelaskan kenapa.
- Nama generik (`data2`, `temp`, `handleStuff`).
- Menyelesaikan masalah dengan melanggar prinsip proyek: memasang library, mematikan pemeriksaan, memindahkan secret ke variabel publik.

**UI**
- Menambah warna, gradien, bayangan, animasi, atau dekorasi di luar yang sudah ditetapkan.
- Pola "landing page AI": kartu fitur seragam tanpa isi nyata, ikon di tiap judul tanpa alasan, statistik palsu, emoji sebagai ikon.
- Elemen yang tidak bisa dijelaskan gunanya bagi pengunjung.

**Teks**
- Klise kosong: "selamat datang di website kami", "solusi terbaik", "berkualitas tinggi", "terpercaya", "inovasi", dan superlatif tanpa bukti.
- Konkret lebih baik daripada abstrak. Kalimat pendek. Tombol memakai kata kerja jelas, bukan "klik di sini".

## 7. Periksa diri sebelum lapor

Baca ulang seluruh perubahanmu seperti reviewer, lalu jawab jujur:
1. Apakah setiap perubahan terkait langsung dengan prompt? Yang tidak, kembalikan.
2. Apakah semua pemakai dari hal yang diubah sudah diperbarui?
3. Apakah data kosong, gagal, atau belum dimuat tetap tampil rapi?
4. Apakah ada pelanggaran prinsip utama proyek? Baca ulang daftar prinsipnya di file instruksi; jangan mengandalkan ingatan.
5. Apakah ada klaim di laporan yang belum punya bukti?

## 8. Format laporan

Ikuti format penutup di `copilot-instructions.md` (Cara tes, Yang perlu di-deploy, pesan commit, Langkah berikutnya). Tambahkan di atasnya, singkat:
- **Yang diubah**: file + satu kalimat per file.
- **Status verifikasi**: Terverifikasi / Belum dijalankan / Belum dicek visual, spesifik.
- **Selisih prompt vs repo**, bila ada.
- **Di luar cakupan**: saran yang tidak dikerjakan, termasuk instruksi usang atau bertentangan yang ditemukan.

Tanpa pembuka basa-basi, tanpa penutup yang mengulang isi, tanpa pujian ("ide bagus").

## 9. Saat gagal

- Dua kali gagal dengan pendekatan yang sama: berhenti, jelaskan yang terjadi (diketahui vs diduga), usulkan pendekatan lain. Jangan menumpuk tambalan.
- Jangan menghapus tes, menonaktifkan aturan, atau menyembunyikan error agar tampak lulus.
- Butuh sesuatu yang tidak boleh atau tidak bisa kamu lakukan (baca `.env`, perintah destruktif, akses console layanan): katakan, dan beri pemilik langkah yang jelas.

## 10. Autopilot dan izin penuh

Prompt bisa dijalankan tanpa persetujuan per langkah dan tanpa orang yang menjawab seketika. Pagar satu-satunya adalah instruksi proyek dan riwayat Git, jadi:
- "Berhenti dan tanya" di bagian lain berarti: kerjakan hanya bagian yang pasti, JANGAN mengerjakan bagian yang meragukan, lalu tulis pertanyaannya di laporan. Jangan menjawab pertanyaanmu sendiri lalu melanjutkan.
- Berhenti saat kriteria selesai di prompt terpenuhi. Jangan menambah putaran perbaikan, polesan, atau "pemeriksaan tambahan" di luar itu.
- Tanpa persetujuan eksplisit di prompt, jangan: memasang/menghapus package atau mengubah `package.json` dan lockfile; mengubah `astro.config.*`, konfigurasi hosting, atau `.gitignore`; menghapus atau memindahkan file; menyentuh file di luar folder proyek; menjalankan operasi Git; mengakses jaringan atau layanan eksternal di luar yang diminta.
- Jangan membuka `.env` atau berkas rahasia, sekalipun bisa dan sekalipun galat tampak berasal dari sana. Laporkan dan minta pemilik memeriksa.
- Hal yang sulit dibatalkan atau berefek ke luar repo (Rules Firebase, secret, deploy, data di database): jangan dilakukan. Tulis langkahnya untuk pemilik.
- Batas gagal tetap dua kali per galat. Jangan berputar tanpa batas.
