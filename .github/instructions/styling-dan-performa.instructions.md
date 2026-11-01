---
description: Aturan styling Tailwind v4, identitas visual merah tua-putih-emas, dan performa mobile untuk website Desa Margourip
applyTo: "**/*.astro,src/styles/**"
---

# Aturan Styling & Performa — Desa Margourip

File ini melengkapi `.github/copilot-instructions.md`. Jika ada pertentangan, berhenti dan tanyakan pemilik proyek.

## Tailwind CSS v4

- CSS-first: `@import "tailwindcss"` di `src/styles/global.css`, token warna lewat `@theme`. **Jangan** membuat `tailwind.config.js`, dan jangan mengubah konfigurasi plugin `@tailwindcss/vite` di `astro.config.mjs` tanpa izin.
- Utility class langsung di markup. Gaya yang berulang masuk `global.css`. Kelas kustom yang sudah ada: `skip-link`, `hero-pattern`, `ornament`, `ornament-center`.
- Pakai **nama token** (`bg-primary`, `text-ink`, `border-line`, ...), bukan kode hex yang diulang-ulang.
- Class dinamis harus ditulis **utuh** (mis. `"text-primary"`), jangan dirakit dari potongan (`"text-" + warna`), karena Tailwind hanya mengenali class yang tertulis lengkap.

## Identitas visual (jangan diubah tanpa diminta)

| Token | Nilai | Pakai untuk |
|---|---|---|
| `primary` | `#8B1D1D` | merah tua utama: tombol utama, hero, band ajakan |
| `primary-dark` | `#6B1414` | hover, footer, blok gelap |
| `gold` | `#C9A227` | garis, ikon, badge, ornamen, teks BESAR di atas merah tua |
| `gold-soft` | `#F7F0D8` | latar tipis, badge, lingkaran ikon |
| `white` / `surface` | `#FFFFFF` / `#FAF7F2` | latar, selang-seling antar bagian |
| `ink` / `ink-muted` | `#1E293B` / `#475569` | teks utama / teks sekunder |
| `line` | `#E7E2DA` | garis dan border |

- **Emas** TIDAK boleh dipakai untuk teks biasa di atas putih (kontras terlalu rendah), dan tidak untuk teks kecil di atas merah tua. Teks kecil di atas merah tua memakai putih.
- **Tombol utama** (termasuk "Pesan via WhatsApp"): latar `primary`, teks putih, di atas latar terang. **Di atas latar merah** (hero, band ajakan) tombol utama dibalik: latar putih, teks `primary`. Tombol sekunder di atas merah: outline putih. Jangan menambah warna hijau.
- Tidak ada warna baru kecuali status fungsional (berhasil/galat) secukupnya.
- Gaya kartu: border 1px halus (`border-line`), sudut membulat sekitar 12px (`rounded-xl`), bayangan tipis atau tanpa bayangan.
- Dekorasi hanya yang sudah ada (`hero-pattern`, `ornament`). Jangan menambah elemen dekoratif lain tanpa alasan kuat.
- Minimalis, lapang, konsisten. Ritme bagian: latar selang-seling putih dan `surface`, padding bagian `py-16 sm:py-20`, pola judul bagian: eyebrow kecil, `<h2>`, lalu `ornament`.

## Tipografi dan ikon

- Hanya system font stack (`--font-sans` di `@theme`). Tanpa font dari CDN. Jika butuh satu font khusus: self-host satu file saja dan bahas dulu.
- Ikon berupa SVG inline sederhana (`stroke="currentColor"`) seperlunya. Tanpa icon font atau paket ikon.
- Teks isi minimal 16px. Label kecil seperti eyebrow, badge, dan teks menu bawah boleh lebih kecil (`text-xs`/`text-sm`) selama bukan teks bacaan utama.

## Performa (prioritas: HP kelas menengah, koneksi biasa)

Target Lighthouse mobile: LCP < 2,5 dtk, CLS mendekati 0, INP < 200 ms.

- **Hindari di mobile**: `backdrop-blur`, bayangan besar, elemen `fixed` berukuran besar (mis. watermark), `will-change` berlebihan, `transition: all`, dan animasi yang memicu layout.
- Animasi hanya bila benar-benar perlu, hanya `transform` dan `opacity`, singkat. Untuk hover cukup `transition-colors`.
- Tanpa animasi transisi antar halaman. Perpindahan halaman harus terasa instan.
- Gambar: `astro:assets`, WebP/AVIF, ukuran sesuai tampil, `width`/`height` eksplisit (atau wadah dengan rasio tetap seperti `aspect-[4/3]`) agar tidak ada layout shift, `loading="lazy"` kecuali gambar paling atas.
- Jangan menambah font, ikon, library, atau skrip CDN baru. Jika benar-benar perlu: sebut ukurannya (KB gzip), alasannya, alternatif vanilla, dan minta persetujuan. Versi CDN wajib dipin (bukan `@latest`).
- Pilih vanilla JS/CSS dibanding library. Skrip halaman seminimal mungkin.
- Bersihkan efek berat bila sedang menyentuh bagian itu, tetapi jangan melebar ke file lain tanpa diminta.

## Mobile-first

- Rancang dan uji mental di lebar 360px dulu, baru `sm:`/`md:`/`lg:`.
- Target sentuh minimal 44px (`min-h-11`).
- Jangan membuat horizontal scroll tidak sengaja di 360px: cek teks panjang (pakai `break-words` bila perlu), `min-w`, dan grid (pakai `minmax(0, ...)` pada kolom).
- Kontras teks memadai: putih di atas `primary`/`primary-dark` aman; teks sekunder memakai `ink-muted`, bukan abu-abu yang lebih terang.