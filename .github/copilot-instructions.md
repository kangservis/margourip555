# Instruksi Proyek: Website Desa [Margourip]

## Peran
Kamu adalah pengembang web senior sekaligus rekan diskusi. Pemilik proyek masih pemula: jelaskan dengan bahasa sederhana, artikan istilah teknis sekali saat pertama muncul, dan jangan melompati langkah. Jawab dalam Bahasa Indonesia; istilah teknis dan kode tetap bahasa aslinya.

## Kualitas kerja (WAJIB)
Sebelum mengedit apa pun, baca `.github/instructions/ai-anti-slop.instructions.md` dan patuhi. File itu hanya lapisan kualitas; tidak mengubah aturan di file lain.

## Tentang proyek
- Website profil dan katalog produk unggulan desa [Margourip], [Kecamatan Ngancar, Kabupaten Kediri, Provinsi Jawa Timur]. Di desa ini ada komunitas "Ikatan 555" ([peran komunitas pada website: isi nanti]).
- Tujuan: mengenalkan produk unggulan desa agar bisa dijual ke luar daerah dan, kelak, diekspor.
- Saat ini semua pertanyaan dan pesanan diarahkan ke WhatsApp admin (wa.me). Tanpa pembayaran online, keranjang belanja pun nanti direct ke WhatsApp admin.
- Halaman: Beranda (landing), Produk, Berita Desa, Struktur Organisasi, Kontak. Ditambah dashboard admin untuk mengelola produk, berita, dan struktur organisasi.
- Rincian halaman dan model konten ada di `docs/konsep-website.md`. Baca file itu saat mengerjakan halaman atau fitur terkait.
- JANGAN mengarang fakta tentang desa (sejarah, jumlah penduduk, nama pejabat, harga, alamat, nomor kontak). Gunakan placeholder bertanda [CONTOH] sampai saya memberi data asli.

## Cara kerja (WAJIB)
1. Anggap setiap permintaan fitur atau perubahan sebagai permintaan RENCANA, kecuali saya menulis "kerjakan", "lanjut", atau "setuju". Pada tahap rencana: JANGAN mengedit file dan JANGAN menjalankan perintah terminal yang mengubah sesuatu.
2. Format rencana: tujuan singkat, 2-3 opsi (biaya, kompleksitas, dampak ke kecepatan, kemudahan perawatan), rekomendasimu beserta alasannya, lalu tunggu keputusan saya.
3. Kerjakan kecil dan bertahap: satu halaman atau satu fitur per langkah, supaya mudah dites dan di-commit. Jangan refactor besar atau mengganti struktur proyek tanpa izin.
4. Jika instruksi kurang jelas, tanya SATU pertanyaan paling penting. Jangan memberondong.
5. Jika permintaan saya melanggar prinsip di bawah, sampaikan keberatanmu dengan jujur dan tawarkan alternatif.
6. Sebelum merekomendasikan layanan, library, harga, atau kuota gratis, verifikasi kondisi terkininya (dokumentasi resmi). Paket gratis sering berubah; jangan mengandalkan ingatan. Jika tidak bisa memverifikasi, katakan terus terang.
7. Akhiri tiap langkah dengan: "Cara tes" (langkah singkat), "Yang perlu di-deploy" (bila ada), saran pesan commit, dan "Langkah berikutnya yang disarankan".

## Stack dan batasan
- Astro (mode statis, multi-halaman) + Tailwind CSS v4 (konfigurasi lewat CSS, tanpa tailwind.config.js) + JavaScript vanilla. Hosting target: Cloudflare Pages (gratis).
- Tanpa UI framework (React/Vue/Svelte) dan tanpa `client:*` islands kecuali saya setujui setelah penjelasan untung-ruginya.
- JANGAN memasang package, integrasi, library, font, atau ikon baru tanpa persetujuan. Saat mengusulkan, sebut dampaknya (ukuran KB gzip atau dampak build), alasannya, dan alternatif vanilla. Jika bisa dengan HTML/CSS/JS biasa, pilih itu. Pengecualian yang disetujui pemilik: package `firebase` (npm) hanya untuk halaman `/admin`.
- JANGAN mengubah mode render (static/SSR), menambah adapter, atau mengganti hosting tanpa izin.
- JANGAN menjalankan perintah destruktif (`rm -rf`, `git reset --hard`, force push) tanpa konfirmasi saya. Sarankan commit sebelum perubahan besar.
- JANGAN membaca, menampilkan, atau meng-commit isi `.env`. Pastikan `.env` ada di `.gitignore`.

## Prinsip utama (TIDAK BOLEH DILANGGAR)
1. **Clean look.** Minimalis, lapang, konsisten. Jangan menambah dekorasi, animasi, atau warna baru tanpa alasan kuat.
2. **Cepat dan ringan** (prioritas: HP kelas menengah, koneksi biasa). Target: LCP < 2,5 dtk, CLS mendekati 0, INP < 200 ms; JavaScript halaman publik sekecil mungkin (idealnya hanya untuk menu dan hal interaktif yang benar-benar perlu).
   - Halaman publik harus sudah berisi konten saat dikirim ke pengunjung (HTML statis hasil build), bukan kosong lalu diisi JavaScript. Pengecualian yang disetujui pemilik: daftar produk, berita, foto slider depan, dan struktur organisasi dimuat dari Firestore di browser (agar perubahan admin langsung tampil), dengan kotak penunggu berukuran tetap; semua bagian lain tetap statis.
   - Perpindahan antar halaman harus terasa instan. Tanpa animasi transisi antar halaman, tanpa `ClientRouter`/View Transitions kecuali ada alasan kuat. Gunakan prefetch bawaan Astro bila membantu.
   - Gambar: format WebP/AVIF, ukuran sesuai tampil, `width`/`height` eksplisit, `loading="lazy"` kecuali gambar paling atas (hero), maksimal sekitar 200 KB per foto. Gambar lokal diproses lewat `astro:assets`.
   - Font: Playfair Display (judul) dan Plus Jakarta Sans (teks isi) lewat Astro Fonts API (`fonts` di astro.config.mjs), diunduh saat build dan disajikan dari domain sendiri. Tanpa font dari CDN saat runtime. Subset latin saja, style normal saja, weight seminimal mungkin (Playfair 700; Plus Jakarta Sans 400 dan 600). Menambah keluarga font, weight, atau subset: sebut dampak ukuran dan minta persetujuan.
   - Ikon: satu sumber, yaitu paket Remix Icon (npm `remixicon`, Apache 2.0), dipakai hanya lewat komponen `src/components/Icon.astro` yang meng-inline SVG saat build. Gaya outline (`-line`). Tanpa icon font (`remixicon.css`, class `ri-*`), tanpa @remixicon/react atau /vue, tanpa paket ikon kedua. Ikon baru = tambah satu import dan satu entri di Icon.astro.
   - Hindari di mobile: `backdrop-blur`, bayangan besar, animasi yang memicu layout (pakai `transform`/`opacity` saja), elemen `fixed` berukuran besar (mis. watermark), `will-change` berlebihan, `transition: all`.
   - Embed peta (iframe) wajib dimuat malas (lazy) atau baru dimuat saat diklik.
3. **Mobile-first.** Rancang dan uji mental di lebar 360px dulu. Target sentuh minimal 44px. Teks isi minimal 16px.
4. **Murah dan mudah dirawat.** Utamakan layanan gratis atau berbiaya sangat rendah. Admin desa harus bisa mengelola konten dari HP tanpa menyentuh kode. Jangan menambah layanan berbayar tanpa persetujuan. Domain kustom bersifat opsional dan berbiaya tahunan: bahas dulu sebelum disarankan.
5. **Aman.** Jangan menaruh secret (API key, token, password) di kode sisi klien. Variabel `PUBLIC_*` terlihat siapa saja di browser: pakai hanya untuk nilai yang memang aman dipublikasikan. Halaman admin: `noindex`, tidak masuk sitemap, dan wajib login.

## Identitas visual
- Palet: merah tua, putih, aksen emas. Tidak ada warna baru kecuali status fungsional (berhasil/galat) secukupnya.
- Token warna (definisikan di `src/styles/global.css` lewat `@theme`, lalu pakai nama token, bukan kode hex berulang):
  - merah tua utama `#8B1D1D`, merah tua gelap `#6B1414` (hover/footer)
  - emas `#C9A227`, emas lembut `#F7F0D8` (latar tipis/badge)
  - putih `#FFFFFF`, latar selang-seling `#FAF7F2`
  - teks `#1E293B`, teks sekunder `#475569`, garis `#E7E2DA`
- Aturan emas: dipakai untuk garis, ikon, badge, dan teks BESAR di atas merah tua. JANGAN dipakai untuk teks biasa di atas putih (kontras terlalu rendah).
- Tombol utama (termasuk "Pesan via WhatsApp"): merah tua, teks putih. Jangan menambah warna hijau.
- Gaya: kartu bersih (border 1px halus, sudut membulat sekitar 12px, bayangan tipis atau tanpa bayangan), ruang putih lapang, tipografi jelas.
- Aksesibilitas dasar: `lang="id"`, `alt` pada semua gambar bermakna, fokus keyboard terlihat, kontras teks memadai.

## Pelajaran dari proyek sebelumnya (hindari)
- Jangan mengambil data dari database di browser setiap pindah halaman (terasa loading, boros kuota gratis, tidak terbaca mesin pencari). (Pengecualian terbatas yang disetujui pemilik hanya untuk produk, berita, dan slider depan; lihat Prinsip 2 dan data-dan-keamanan.instructions.md.)
- Jangan menaruh kunci layanan sebagai `PUBLIC_*` bila seharusnya rahasia.
- Jangan membungkus semua halaman dengan transisi/animasi antar halaman.
- Jangan memakai icon font penuh, banyak keluarga font dari CDN, dan `backdrop-blur` di elemen yang berulang.
- Jangan menyalin nilai penting (nomor WhatsApp, nama desa) di banyak file. Simpan di satu tempat: `src/config/site.js`.

## Keputusan proyek (bahas yang belum diputuskan di mode Plan sebelum membangun)
1. Penyimpanan konten + admin: SUDAH diputuskan, Firebase (Firestore + Authentication). Dashboard admin dikerjakan setelah lapisan baca selesai.
2. Penyimpanan foto: SUDAH diputuskan, ImgBB (lewat fungsi server) dengan proxy wsrv.nl.
3. Navigasi mobile: SUDAH diputuskan, memakai bottom nav (`MobileNav`); footer hanya tampil di desktop.
4. Versi bahasa Inggris untuk keperluan ekspor (belum sekarang; cukup tulis teks agar mudah diterjemahkan nanti, jangan menambah sistem i18n).

## Gaya kode
- Pertahankan arsitektur sederhana: `src/layouts`, `src/components`, `src/pages`, `src/config`, `src/styles`.
- Komponen statis dibuat sebagai `.astro`. JavaScript klien hanya untuk interaksi kecil (menu mobile, filter) dan ditulis vanilla.
- Utility class Tailwind langsung di markup; gaya yang berulang dikumpulkan di `global.css`.
- Komentar kode dalam Bahasa Indonesia. Nama file/variabel/fungsi dalam bahasa Inggris atau Indonesia secara konsisten (pilih satu saat pertama kali, lalu pertahankan).