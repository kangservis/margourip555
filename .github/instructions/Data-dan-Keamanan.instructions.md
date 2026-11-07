---
description: Aturan data konten, rahasia, dashboard admin, dan upload foto untuk website Desa Margourip
applyTo: "src/config/**,src/content/**,src/lib/**,src/pages/admin/**,functions/**"
---

# Aturan Data & Keamanan — Desa Margourip

File ini melengkapi `.github/copilot-instructions.md` dan `docs/konsep-website.md`. Folder seperti `src/content`, `src/lib`, `src/pages/admin`, dan `functions` mungkin belum ada; aturan ini berlaku saat folder itu dibuat.

## Status keputusan (baca dulu)

Cara menyimpan dan mengelola konten + dashboard admin **BELUM diputuskan**. Selama belum diputuskan pemilik proyek:

- Jangan membuat fitur admin, skema database, koleksi, atau folder `functions/` untuk upload.
- Jangan memasang SDK, CMS, atau layanan database apa pun, dan jangan menambah variabel `PUBLIC_*`.
- Data tampil di halaman memakai placeholder `[CONTOH]` di kode. Jangan mengarang data asli.
- Data contoh produk sementara ada di `src/config/products.js`. Saat sumber data dipilih, ganti isi `getProduk()` saja.
- Data contoh berita sementara ada di `src/config/news.js`. Saat sumber data dipilih, ganti isi `getBerita()` saja.

Setelah keputusan diambil, bagian "Aturan khusus layanan terpilih" di bagian bawah file ini diisi lebih dulu (bersama pemilik), baru kode ditulis.

## Model konten

- Sumber kebenaran model konten (Produk, Berita, Struktur organisasi, Pengaturan situs) ada di `docs/konsep-website.md`. Jangan menyalin ulang di banyak tempat.
- Mengganti nama atau menghapus field, atau membuat jenis konten baru = ajukan rencana migrasi data dulu dan tunggu persetujuan.
- Kode harus tahan field yang kosong atau tidak ada: harga kosong ditampilkan "Hubungi admin"; foto, produsen, dan minimalPesan opsional; berita tanpa foto sampul tetap tampil rapi.
- Slug dibuat otomatis dari nama/judul, huruf kecil, dan unik.
- Berita berstatus draf tidak tampil di publik dan tidak dibuatkan halaman. Produk berstatus habis tetap tampil dengan penanda.
- Nilai identitas dan kontak (nama desa, WhatsApp, email, alamat) tetap satu sumber di `src/config/site.js` (kelak dari "Pengaturan situs"), tidak disalin ke file lain.

## Halaman publik tetap statis

- Data dibaca saat build. Jangan mengambil data dari database di browser setiap pindah halaman: terasa loading, boros kuota gratis, dan tidak terbaca mesin pencari.
- Cara agar perubahan dari admin tampil di halaman publik tanpa mengorbankan kecepatan (mis. build ulang otomatis) diputuskan lewat rencana, bukan ditentukan sendiri oleh agent.
- Hemat kuota layanan gratis: tanpa listener real-time dan tanpa pembacaan data dalam perulangan, kecuali ada alasan kuat dan persetujuan.

## Rahasia dan variabel lingkungan

- Jangan membuka, meminta, atau menampilkan isi `.env`, password admin, token, kunci API, atau service account.
- `.env` dan `.env.*` harus tetap ada di `.gitignore`.
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
- Nyaman dipakai dari HP: bahasa sederhana, tombol besar, konfirmasi sebelum menghapus.
- Mengelola: Produk, Berita, Struktur Organisasi, dan Pengaturan situs. Kerjakan **satu jenis konten per langkah**, mulai dari Produk.
- Data teks bebas yang dimasukkan ke HTML harus di-escape (pakai `textContent` bila memungkinkan).
- Jangan menambah efek berat (`backdrop-blur`, bayangan besar) di halaman admin.

## Foto dan upload

- Foto produk 1-5 per item (foto pertama = sampul), berita 1 foto sampul.
- Foto dikecilkan dan diubah ke WebP otomatis sebelum disimpan, dengan batas ukuran jelas (sekitar 200 KB per foto).
- Kunci layanan penyimpanan foto tidak pernah ada di kode browser. Upload yang memakai kunci harus lewat sisi server, dan server wajib memverifikasi bahwa pemanggilnya admin yang login sebelum endpoint itu dianggap aman.
- Pilihan tempat penyimpanan foto belum diputuskan; jangan memilih sendiri.

## Aturan khusus layanan terpilih

[ISI SETELAH KEPUTUSAN: nama layanan/CMS yang dipilih, struktur koleksi atau folder konten, aturan akses (rules), cara perubahan admin sampai ke halaman publik, dan tempat penyimpanan foto.]