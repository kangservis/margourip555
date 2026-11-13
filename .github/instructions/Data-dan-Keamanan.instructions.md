---
description: Aturan data konten, rahasia, dashboard admin, dan upload foto untuk website Desa Margourip
applyTo: "src/config/**,src/content/**,src/lib/**,src/pages/admin/**,functions/**"
---

# Aturan Data & Keamanan — Desa Margourip

File ini melengkapi `.github/copilot-instructions.md` dan `docs/konsep-website.md`. Aturan ini berlaku untuk folder data, admin, dan fungsi server yang terkait.

## Status keputusan

Sudah diputuskan pemilik: konten disimpan di **Firebase (Firestore + Authentication, paket Spark/gratis)**, foto di **ImgBB** (diunggah lewat fungsi server), dan URL foto dibungkus proxy **wsrv.nl**. Dashboard admin berada di `/admin` dan dikerjakan bertahap atas permintaan pemilik.
- Halaman publik membaca Firestore lewat REST (`fetch`), TANPA package `firebase`. Package `firebase` (npm) sudah disetujui pemilik dan hanya boleh di-import dari `src/lib/admin/` untuk halaman `/admin`.
- Variabel `PUBLIC_*` yang diizinkan hanya `PUBLIC_FIREBASE_API_KEY`, `PUBLIC_FIREBASE_PROJECT_ID`, dan `PUBLIC_FIREBASE_AUTH_DOMAIN` (kunci browser dibatasi ke domain situs di Google Cloud Console). Jangan menambah yang lain tanpa persetujuan.
- Fungsi upload ada di `functions/api/upload.js` (Cloudflare Pages Function).

## Model konten

- Sumber kebenaran model konten (Produk, Berita, Struktur organisasi, Pengaturan situs) ada di `docs/konsep-website.md`. Jangan menyalin ulang di banyak tempat.
- Mengganti nama atau menghapus field, atau membuat jenis konten baru = ajukan rencana migrasi data dulu dan tunggu persetujuan.
- Kode harus tahan field yang kosong atau tidak ada: harga kosong ditampilkan "Hubungi admin"; foto, produsen, dan minimalPesan opsional; berita tanpa foto sampul tetap tampil rapi.
- Slug dibuat otomatis dari nama/judul, huruf kecil, dan unik.
- Berita berstatus draf tidak tampil di publik dan tidak dibuatkan halaman. Produk berstatus habis tetap tampil dengan penanda.
- Nilai identitas dan kontak (nama desa, WhatsApp, email, alamat) tetap satu sumber di `src/config/site.js` (kelak dari "Pengaturan situs"), tidak disalin ke file lain.

## Pembacaan data di halaman publik

Keputusan pemilik: perubahan dari admin harus LANGSUNG tampil, jadi daftar produk dan berita dimuat dari Firestore di browser. Aturannya:
- Hanya data produk, berita, dan slider depan (kartu Beranda, halaman Produk, halaman Berita, slider hero) yang dimuat di browser. Kerangka halaman, header, judul, dan bagian lain tetap statis (HTML hasil build).
- Semua akses Firestore lewat `src/lib/firestore.js` (REST `runQuery`) dan `src/lib/data.js`. Jangan memanggil `fetch` ke Firestore langsung dari halaman atau komponen.
- Selalu tampilkan kotak penunggu berukuran tetap (tanpa animasi) agar tidak ada layout shift, serta pesan galat dan tombol "Muat ulang" bila gagal.
- Tanpa cache persisten, tanpa listener real-time, tanpa membaca dalam perulangan, dan selalu memakai batas (`limit`) untuk query koleksi. Kuota gratis Firestore 50.000 pembacaan per hari per project: Beranda hanya membaca 1 produk unggulan, 1 berita terbaru, dan 1 dokumen slider.
- Query berita publik WAJIB menyertakan filter `status == 'terbit'` (Rules menolak query tanpa filter itu) dan membutuhkan indeks komposit `berita`: `status` naik, `tanggal` turun.

## Rahasia dan variabel lingkungan

- Jangan membuka, meminta, atau menampilkan isi `.env`, password admin, token, kunci API, atau service account.
- `.env`, `.env.production`, dan file `.env.*` selain `.env.example` harus tetap di-ignore oleh Git.
- Variabel `PUBLIC_*` terlihat siapa saja di browser. Pakai hanya untuk nilai yang memang aman dipublikasikan.
- Kunci yang bersifat rahasia disimpan sebagai secret di server (di Cloudflare Pages: variabel tanpa awalan `PUBLIC_`, dipakai dari Pages Function), tidak pernah di kode sisi klien. Jika fitur membutuhkan rahasia, jelaskan dulu cara menyimpannya dengan aman.
- Nomor WhatsApp dan email admin memang publik; boleh ada di `site.js`.

## Layanan pihak ketiga (bila dipilih)

- Sebelum fitur admin dibuat: jelaskan aturan akses (rules/izin) dengan bahasa sederhana, tulis usulannya, dan ingatkan pemilik untuk mengeceknya di dashboard layanan tersebut. Prinsipnya: baca publik hanya untuk data yang memang publik; tulis hanya untuk admin yang terdaftar, bukan sekadar "siapa pun yang sudah login".
- Jangan mengklaim sebuah endpoint atau fitur sudah aman jika verifikasi pemanggilnya belum dibuat.
- Pakai satu versi yang konsisten untuk setiap layanan/library, dengan versi dipin (bukan `@latest`).
- Paket gratis, harga, dan kuota wajib diverifikasi lewat dokumentasi resmi, bukan dari ingatan. Jika tidak bisa memverifikasi, katakan terus terang.
- Jangan menambah package npm atau skrip CDN baru tanpa persetujuan (lihat `styling-dan-performa.instructions.md`).

## Dashboard admin (`/admin`), bila dibuat

- `noindex` (meta robots), tidak masuk sitemap, wajib login. Cukup 1-2 akun admin.
- Pemeriksaan hak akses dilakukan di sisi layanan/server, bukan sekadar menyembunyikan halaman.
- Akses admin diperiksa dengan membaca dokumen `admin/ping` (hanya terbaca admin menurut Rules); akun yang berhasil login tetapi ditolak langsung dikeluarkan. Daftar UID admin hanya ada di Firestore Rules.
- Nyaman dipakai dari HP: bahasa sederhana, tombol besar, konfirmasi sebelum menghapus.
- Mengelola: Produk, Berita, Struktur Organisasi, dan Pengaturan situs. Kerjakan **satu jenis konten per langkah**, mulai dari Produk.
- Produk: foto disimpan sebagai daftar URL string; produk unggulan dijaga hanya satu lewat `writeBatch` (set produk + update unggulan=false pada produk lain). Dokumen `produk` tanpa `nama` akan membuat penulisan batch ditolak Rules; lengkapi atau hapus dokumen itu.
- Data teks bebas yang dimasukkan ke HTML harus di-escape (pakai `textContent` bila memungkinkan).
- Jangan menambah efek berat (`backdrop-blur`, bayangan besar) di halaman admin.

## Foto dan upload

- Foto produk 1-5 per item (foto pertama = sampul), berita 1 foto sampul.
- Foto dikecilkan dan diubah ke WebP otomatis sebelum disimpan (sisi terpanjang maksimal 1600px, target sekitar 250 KB per foto).
- Kunci layanan penyimpanan foto tidak pernah ada di kode browser. Upload yang memakai kunci harus lewat sisi server, dan server wajib memverifikasi bahwa pemanggilnya admin yang login sebelum endpoint itu dianggap aman.
- Penyimpanan foto sudah diputuskan: ImgBB, dengan URL publik dibungkus proxy wsrv.nl.
- Alur upload: admin login -> foto diperkecil di browser (WebP, sisi terpanjang maksimal 1600px, target sekitar 250 KB) -> POST `/api/upload` bersama tiket login -> fungsi memeriksa admin dengan membaca dokumen `admin/ping` lewat Firestore REST memakai tiket itu -> meneruskan ke ImgBB dengan `IMGBB_API_KEY` (secret, tanpa awalan PUBLIC_) -> mengembalikan URL dan ukuran foto tanpa `delete_url` atau kunci. Nama berkas diawali `margourip-`. Variabel `FIREBASE_PROJECT_ID` (tanpa PUBLIC_) dipakai fungsi. `npm run dev` tidak menjalankan fungsi Cloudflare; uji unggah di alamat Cloudflare Pages.

## Aturan khusus layanan terpilih

- Koleksi dan bidang (bahasa Indonesia):
  - `produk`: nama, slug, kategori, ringkasan, deskripsi, harga (angka atau null), satuan, minimalPesan, produsen, foto (array URL string, maksimal 5; pertama = sampul), status (tersedia / pre-order / habis), unggulan (boolean; hanya satu yang boleh true), urutan (angka).
  - `berita`: judul, slug, tanggal (string YYYY-MM-DD), ringkasan, isi (paragraf dipisah satu baris kosong), fotoSampul (URL string), status (draf / terbit).
  - `struktur`: nama, jabatan, foto (URL string), tingkat (angka), urutan (angka).
  - `pengaturan`: satu dokumen dengan ID `situs` (namaDesa, tagline, alamat, jamPelayanan, nomorWhatsApp, email, mapUrl, mediaSosial).
  - `pengaturan/slider`: satu dokumen berisi `foto`, yaitu daftar `{ url, alt, rasio }` (maksimal 5; urutan = urutan tampil).
- Firestore Rules: baca publik untuk `produk`, `struktur`, `pengaturan`; `berita` hanya yang berstatus terbit untuk publik; tulis hanya UID admin yang terdaftar di Rules (bukan sekadar sudah login), dengan pemeriksaan bentuk data (foto produk maksimal 5, slider maksimal 5, status dan tipe field). Koleksi `admin` (dokumen `ping`) hanya terbaca admin dan tidak bisa ditulis dari aplikasi. Dokumen `pengaturan/slider` menyimpan foto slider depan dan tidak bisa dihapus. Rules dikelola di console Firebase, bukan di repo; ingatkan pemilik mengeceknya setiap ada koleksi atau fitur baru.
- Foto: URL ImgBB disimpan sebagai string di dokumen dan SELALU ditampilkan lewat `urlFoto()` / `srcsetFoto()` di `src/lib/foto.js` (proxy wsrv.nl). Kunci ImgBB disimpan sebagai secret `IMGBB_API_KEY` di Cloudflare Pages (tanpa awalan PUBLIC_), dipakai hanya dari fungsi server yang memverifikasi admin yang login; `delete_url` ImgBB tidak pernah disimpan di dokumen yang bisa dibaca publik.
- Foto produk/berita tidak lagi diproses `astro:assets`; folder `src/assets/produk` dan `src/assets/berita` tidak dipakai lagi.