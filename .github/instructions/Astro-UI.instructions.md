---
description: Aturan halaman, komponen, layout, dan JavaScript kecil untuk website Desa Margourip (Astro statis, tanpa ClientRouter)
applyTo: "src/pages/**,src/components/**,src/layouts/**,src/config/**"
---

# Aturan UI Astro — Desa Margourip

File ini melengkapi `.github/copilot-instructions.md` dan `docs/konsep-website.md`. Jika ada pertentangan, berhenti dan tanyakan pemilik proyek.

## Arsitektur

- Pola: **Layout + komponen + halaman**. Halaman publik memakai `src/layouts/SiteLayout.astro`. Komponen statis dibuat sebagai `.astro`.
- Struktur folder tetap: `src/layouts`, `src/components`, `src/pages`, `src/config`, `src/styles`, `src/lib` (untuk logika data dan helper klien). Jangan menambah folder atau mengganti struktur tanpa izin.
- Mode statis (multi-halaman). Halaman publik harus sudah berisi konten saat dikirim (HTML hasil build), bukan kosong lalu diisi JavaScript. Pengecualian: daftar produk dan berita dimuat dari Firestore di browser lewat `src/lib/data.js`.
- Tanpa UI framework (React/Vue/Svelte), tanpa `client:*`, tanpa `ClientRouter`/View Transitions, tanpa SSR atau adapter.
- Pekerjaan yang bisa dilakukan saat build (frontmatter `.astro`) jangan dipindah ke browser, kecuali data produk dan berita yang harus segera menampilkan perubahan dari Firestore sesuai keputusan pemilik.
- Halaman dinamis (`/produk/[slug]`, `/berita/[slug]`) memakai `getStaticPaths`. Slug unik dan huruf kecil. Berita berstatus draf tidak dibuatkan halaman.
- Dashboard admin (jika kelak dibuat): berdiri sendiri di `/admin`, tidak memakai `SiteLayout` (tanpa SiteHeader/SiteFooter/MobileNav), `noindex`, dan tidak masuk sitemap. Jangan mulai sebelum keputusan penyimpanan konten diambil (lihat `data-dan-keamanan.instructions.md`).

## Satu sumber kebenaran: `src/config/site.js`

- Nama desa, deskripsi, tagline, alamat, nomor WhatsApp, email, `navigationItems`, serta fungsi `isActive`, `getWhatsAppLink`, dan `getContactLink` hanya ada di `site.js`. Jangan menyalinnya ke file lain.
- Tautan WhatsApp selalu lewat helper. Tombol "Hubungi" memakai `getContactLink()` (otomatis ke `/kontak` bila nomor belum diisi). Tombol konsultasi produk memakai `getContactLink(pesan)` dengan pesan awal berisi nama produk; tautan halaman produk ditambahkan nanti setelah `site` diatur.
- Menambah atau mengubah menu cukup dengan mengubah `navigationItems`. `SiteHeader` dan `MobileNav` sama-sama membaca daftar itu dan memakai `isActive`. Jangan menulis logika "menu aktif" sendiri di komponen, dan jangan menggantungkannya pada teks label.
- Jika mengganti nama atau parameter fungsi/field di `site.js`, cari dan perbarui SEMUA pemakainya (header, footer, mobile nav, halaman).

## Halaman baru

- Pakai `SiteLayout` dengan `title` unik berformat `"<Halaman> - <nama desa>"` dan `description` unik.
- Container standar: kelas `site-container` (di `global.css`). Satu `<h1>` per halaman, urutan heading logis.
- Data yang belum ada diisi placeholder `[ISI NANTI]` atau `[CONTOH]`. Jangan mengarang fakta desa (sejarah, penduduk, pejabat, harga, alamat, kontak).
- Band judul halaman dalam memakai komponen `PageHeader.astro` (eyebrow opsional, `<h1>`, `ornament-center`, deskripsi opsional; tata letak rata tengah dan ramping `py-8 sm:py-10`).
- Teks ditulis agar mudah diterjemahkan nanti, tetapi jangan menambah sistem i18n.
- Kategori produk dan status (tersedia / pre-order / habis) didefinisikan di satu tempat. Sebelum daftar kategori ditetapkan pemilik, jangan mengarang kategori.

## JavaScript (vanilla, seminimal mungkin)

- Hanya untuk interaksi kecil yang benar-benar perlu: menu, filter chip, "Muat lebih banyak", slider foto hero, memuat peta saat diklik, popup foto (`<dialog>` bawaan browser), popup detail produk dan popup foto produk (`<dialog>` bawaan browser), popup baca berita dan popup foto berita (`<dialog>` bawaan browser).
- Tanpa ClientRouter, setiap pindah halaman adalah muat penuh. `<script>` di Astro berjalan sekali per halaman, jadi tidak perlu pola `astro:page-load` atau `astro:after-swap`. Jangan menambahkannya.
- Kartu produk/berita yang dimuat dari data berupa `<template>` ber-`data-slot`; JavaScript hanya mengisi teks dan atribut serta menampilkan/menyembunyikan elemen dengan class `hidden` (`classList.toggle`), tanpa `innerHTML`.
- **Progressive enhancement**: isi yang tersedia saat build tetap ada di HTML. Data produk dan berita yang dimuat dari Firestore memakai placeholder awal dan pesan galat yang jelas bila JavaScript atau jaringan tidak tersedia.
- Pasang listener lewat `addEventListener` di dalam `<script>` (boleh event delegation). Jangan memakai fungsi global `window.*` dan `onclick="..."` inline.
- Wajib guard `if (!el) return` sebelum menyentuh elemen.
- Jangan menaruh teks bebas ke `innerHTML`. Pakai `textContent` atau `createElement`. Jika terpaksa memakai `innerHTML`, lakukan escaping.
- Peta (iframe) tidak dimuat otomatis. Tampilkan tombol "Buka di Google Maps" dan/atau muat peta baru saat diklik.
- Prefetch bawaan Astro boleh dipakai bila membantu. Cek dokumentasi resmi untuk versi Astro yang terpasang sebelum mengaktifkannya.

## Layout dan sentuhan

- Mobile-first, uji mental di lebar 360px dulu.
- `SiteHeader` memakai `md:sticky md:top-0 md:z-30`: menempel di atas layar saat discroll pada tampilan desktop (`md:` ke atas). Pada mobile tetap statis agar tidak mempersempit ruang pandang layar HP bersama `MobileNav`.
- Hero Beranda memakai tinggi minimal satu layar: `calc(100svh-65px)` di md ke atas dan `calc(100svh-65px-4rem)` di mobile (65px = tinggi header, 4rem = tinggi MobileNav). Jika tinggi `SiteHeader` atau `MobileNav` berubah, perbarui angka itu di `index.astro`.
- `MobileNav` bersifat fixed di bawah (hilang di `md:`) dan menggantikan footer di mobile; `SiteFooter` hanya tampil di desktop (`hidden md:block`). Karena itu `<main>` di `SiteLayout` wajib memberi ruang bawah setinggi MobileNav di mobile (`pb-16 md:pb-0`) agar konten terakhir tidak tertutup.
- Target sentuh minimal 44px (`min-h-11`); tombol utama `min-h-12`.
- Tautan internal tanpa `target="_blank"`. Tautan eksternal (wa.me, Google Maps) memakai `target="_blank" rel="noopener noreferrer"`.
- Setiap `<a>` dan tombol punya fokus keyboard yang terlihat (`focus-visible:outline-2 focus-visible:outline-offset-2`, warna menyesuaikan latar).

## Gambar

- Gambar lokal diproses lewat `astro:assets` (`<Image>`), format WebP/AVIF, ukuran sesuai tampil, `width`/`height` eksplisit, `decoding="async"`, dan `loading="lazy"` kecuali gambar paling atas (hero) yang dimuat prioritas.
- Maksimal sekitar 200 KB per foto.
- Placeholder foto berupa `<div>` dengan `role="img"` dan `aria-label` yang deskriptif, berisi teks `[ISI NANTI: ...]`.
- Foto anggota struktur ada di `src/assets/struktur/`; nama berkas = field `kunci` anggota (huruf kecil); tanpa berkas tampil placeholder.
- Aturan untuk foto yang berasal dari layanan penyimpanan luar menunggu keputusan penyimpanan foto.

## Aksesibilitas

- `lang="id"`, skip link "Lewati ke konten", `aria-current="page"` pada menu aktif, `alt` bermakna pada gambar bermakna.
- Ikon dipakai lewat `Icon.astro`, yang otomatis memberi `aria-hidden="true"` dan `focusable="false"`. Tombol atau tautan yang hanya berisi ikon wajib punya teks tersembunyi (`sr-only`).