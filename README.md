# Website Desa Margourip

Website swasta untuk Desa Margourip yang disponsori oleh Ikatan Persaudaraan 555 (bukan situs resmi pemerintah desa). Memperkenalkan produk unggulan desa dan memudahkan pembeli menghubungi admin lewat WhatsApp.

## Teknologi

Astro (statis, multi-halaman), Tailwind CSS v4, JavaScript vanilla. Konten disimpan di Firebase (Firestore + Authentication), foto di ImgBB lewat proxy wsrv.nl, hosting Cloudflare Pages.

## Halaman

Beranda, Produk, Berita, Struktur, dan Kontak. Admin di `/admin` (noindex, wajib login) untuk mengelola slider depan, produk, berita, dan struktur.

## Menjalankan di komputer

`npm install`, salin `.env.example` menjadi `.env` lalu isi nilainya, kemudian `npm run dev`. Perintah lain: `npm run build` dan `npm run preview`. Fungsi unggah foto (`functions/api/upload.js`) hanya berjalan di Cloudflare Pages, bukan di `npm run dev`.

## Variabel lingkungan (hanya nama; jangan pernah meng-commit nilainya)

Untuk build dan `.env`: `PUBLIC_FIREBASE_API_KEY`, `PUBLIC_FIREBASE_PROJECT_ID`, `PUBLIC_FIREBASE_AUTH_DOMAIN`. Untuk fungsi server (diisi di Cloudflare Pages): `IMGBB_API_KEY` (secret) dan `FIREBASE_PROJECT_ID`.

## Struktur folder

`src/pages` (halaman), `src/components`, `src/layouts`, `src/config` (data situs dan sponsor), `src/lib` (akses data publik), `src/lib/admin` (khusus `/admin`), `functions/api` (fungsi upload), `docs` dan `.github` (aturan proyek).

## Dokumentasi proyek

Rincian halaman dan model konten: `docs/konsep-website.md`. Aturan kerja: `.github/copilot-instructions.md` dan `.github/instructions/`.
