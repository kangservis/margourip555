---
description: Aturan styling Tailwind v4, identitas visual merah tua-putih-emas, dan performa mobile untuk website Desa Margourip
applyTo: "**/*.astro,src/styles/**"
---

# Aturan Styling & Performa — Desa Margourip

File ini melengkapi `.github/copilot-instructions.md`. Jika ada pertentangan, berhenti dan tanyakan pemilik proyek.

## Tailwind CSS v4

- CSS-first: `@import "tailwindcss"` di `src/styles/global.css`, token warna lewat `@theme`. **Jangan** membuat `tailwind.config.js`, dan jangan mengubah konfigurasi plugin `@tailwindcss/vite` di `astro.config.mjs` tanpa izin.
- Utility class langsung di markup. Gaya yang berulang masuk `global.css`. Kelas kustom yang sudah ada: `skip-link`, `ornament`, `ornament-center`, `batik-panel`, `batik-panel-dark`, `batik-panel-card`, `batik-panel-slim`, `site-container`.
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
- Dekorasi hanya yang sudah ada (`batik-panel` dan `ornament`). Jangan menambah elemen dekoratif lain tanpa alasan kuat.
- Pengecualian dekorasi: bingkai emas tipis (border 1px `gold`) yang digeser 12px di belakang kartu pratinjau di Beranda, dan lingkaran ikon `gold-soft` di atas judul bagian. Kartu bergaya kertas di bagian Tentang desa (lembar belakang miring `gold-soft` + bingkai dalam emas 1px) juga diizinkan. Tidak ada dekorasi lain.
- Halaman Struktur: kartu anggota memakai gaya kertas yang sama dengan bagian Tentang desa, dan garis penghubung vertikal 1px `gold` (digambar dengan `border-l`) antar tingkat. Tidak ada dekorasi lain.
- **Bidang merah besar** (hero, kartu foto hero, band ajakan, footer, dan bidang merah lain di masa depan) WAJIB memakai `batik-panel` (garis emas tebal di atas dan bawah + corak batik CSS). Pakai `batik-panel-dark` untuk merah gelap dan `batik-panel-card` untuk kartu bersudut membulat. Tombol, badge, dan teks merah kecil tetap solid tanpa corak.
- Corak `batik-panel` berupa segitiga bertingkat (conic-gradient) dengan dua nada merah; kekuatannya diatur lewat satu variabel `--batik-strength` di `.batik-panel`. Jangan memakai corak atau gambar lain untuk bidang merah.
- Kartu produk (`ProductCard.astro`) dipakai seragam di Beranda dan halaman Produk. Badge: Unggulan = `gold-soft` + border `gold`; Pre-order = putih + border `line`; Habis = `ink` + teks putih. Tidak ada warna baru.
- Kotak penunggu (skeleton) berupa blok `surface` tanpa animasi.
- Komponen foto admin: nomor posisi pada lingkaran `primary`, penanda 'Baru' memakai `gold-soft` + border `gold`, geser posisi lewat tombol panah; tidak ada warna baru.
- Halaman `/admin` memakai token dan gaya yang sama. Notifikasi (toast): info memakai `ink`, galat memakai `primary`; tidak ada warna baru dan tidak ada hijau.
- Kartu login `/admin` di desktop berupa dua panel: panel kiri `batik-panel batik-panel-dark`, panel kanan putih dengan garis emas atas dan bawah yang menyambung; di mobile bertumpuk. Tidak ada warna baru.
- Foto di kartu produk dan kartu berita memakai `object-contain` di wadah berasio tetap berlatar `surface` (tidak dipotong). Kartu berita (`NewsCard.astro`) dipakai seragam di Beranda dan halaman Berita.
- Garis emas atas dan bawah `batik-panel` harus selalu terlihat di semua lebar layar. Jangan menimpa tepi `batik-panel` dengan margin negatif atau elemen berlapis, dan jangan memberi latar pada elemen sesudahnya yang bisa menutupinya.
- Panel merah yang sangat pendek (mis. footer) memakai tambahan `batik-panel-slim` (garis emas 2px dan sedikit lebih tua) agar proporsinya sama dengan panel tinggi. Ini satu-satunya variasi ketebalan garis emas.
- Garis dekoratif tipis (1px) diposisikan dengan nilai piksel bulat (bukan `transform: translate(-50%)`) dan digambar dengan `border` (bukan `height: 1px` + latar), karena border dipaku ke piksel perangkat dan tidak hilang atau pudar saat zoom atau skala layar pecahan.
- Minimalis, lapang, konsisten. Ritme bagian: latar selang-seling putih dan `surface`, padding bagian `py-20 sm:py-24`, pola judul bagian: eyebrow kecil, `<h2>`, lalu `ornament`.

## Tipografi dan ikon

- Font lewat Astro Fonts API: Playfair Display untuk judul (h1-h4 dan nama desa lewat `font-serif`) dan Plus Jakarta Sans untuk teks isi (`font-sans`). Tanpa <link> ke CDN dan tanpa @font-face manual. Subset latin, style normal, weight seminimal mungkin. Preload hanya untuk font di bagian atas halaman (judul 700 dan isi 400). Menambah font atau weight: sebut dampak ukuran dan minta persetujuan.
- Ikon hanya lewat `Icon.astro` (sumber: Remix Icon, varian `-line`). Jangan menulis SVG inline manual, jangan memakai icon font, dan jangan menambah paket ikon lain.
- Teks isi minimal 16px. Label kecil seperti eyebrow, badge, dan teks menu bawah boleh lebih kecil (`text-xs`/`text-sm`) selama bukan teks bacaan utama.

## Performa (prioritas: HP kelas menengah, koneksi biasa)

Target Lighthouse mobile: LCP < 2,5 dtk, CLS mendekati 0, INP < 200 ms.

- **Hindari di mobile**: `backdrop-blur`, bayangan besar, elemen `fixed` berukuran besar (mis. watermark), `will-change` berlebihan, `transition: all`, dan animasi yang memicu layout.
- Animasi hanya bila benar-benar perlu, hanya `transform` dan `opacity`, singkat. Untuk hover cukup `transition-colors`.
- Satu-satunya animasi yang ada: crossfade `opacity` 500 ms dan transisi `aspect-ratio` 500 ms pada slider foto hero, dimatikan oleh `motion-reduce` (foto berganti instan dan kartu langsung berubah ukuran, autoplay tetap berjalan). Autoplay tidak dijeda oleh hover atau fokus; klik titik atau geser hanya mengulang hitungan.
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