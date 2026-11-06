# Konsep Website Desa [Margourip]

Dokumen acuan untuk agent. Berisi rincian halaman dan model konten. Aturan kerja, prinsip, dan palet warna ada di `.github/copilot-instructions.md`. Data yang belum ada ditandai [CONTOH] atau [ISI NANTI]; jangan mengarang isinya.

## Tujuan dan pengunjung

- Mengenalkan produk unggulan desa kepada pembeli di luar daerah (kelak luar negeri), memudahkan mereka menghubungi admin via WhatsApp, dan menjadi tempat berita resmi desa.
- Pengunjung utama: pembeli dan calon mitra yang membuka lewat HP, serta warga yang mencari berita dan kontak desa.

## Navigasi

Beranda | Produk | Berita Desa | Struktur Organisasi | Kontak

- Header berisi logo/nama desa + menu. Menu aktif ditandai jelas.
- Tab di atas (desktop). Untuk mobile, pilihan menu atau bottom nav diputuskan lewat rencana (lihat instruksi).
- Footer: hanya tampil di desktop (`md:` ke atas); di mobile navigasi memakai bottom nav dan footer tidak ditampilkan. Isinya panel merah gelap ramping bercorak batik (`batik-panel-dark`): satu baris hak cipta (tahun + nama desa) dan, bila `siteConfig.credit` terisi, satu baris kredit desain. Tanpa tautan menu, tanpa tombol WhatsApp, tanpa alamat.
- Semua halaman publik statis dan berpindah instan.

## Halaman

### 1. Beranda (landing)

Urutan bagian, dari atas ke bawah:

1. **Hero:** nama desa, satu kalimat tagline, dua tombol: "Lihat Produk" dan "Hubungi via WhatsApp". Slider foto utama (berganti otomatis tiap 5 detik tanpa henti; klik titik atau geser di HP mengulang hitungan 5 detik); foto ditaruh di `src/assets/hero/`, foto pertama dimuat prioritas dan lainnya lazy; foto potret/persegi tampil utuh, foto lanskap memenuhi kotak; tanpa foto tampil placeholder. Di desktop (lg ke atas) hero memenuhi satu layar penuh (tinggi layar dikurangi header), teks di kiri dan slider besar di kanan; di mobile tinggi mengikuti isi.
2. **Tentang desa:** 2-3 kalimat singkat + tautan ke Struktur Organisasi atau Kontak. Isi dari saya, jangan dikarang.
3. **Produk unggulan:** 1 kartu produk bertanda "unggulan" (yang pertama menurut urutan) bersama blok judul bergaya etalase (dua kolom di desktop, selang-seling dengan bagian Berita), tombol "Lihat semua produk".
4. **Berita terbaru:** 1 berita terbaru dengan tata letak dua kolom yang dicerminkan, tombol "Lihat semua berita".
5. **Ajakan bertindak:** ajakan menghubungi admin via WhatsApp (untuk pembelian, kerja sama, atau ekspor).
6. **Lokasi singkat:** nama desa yang ditonjolkan dan tautan ke Google Maps; jangan tampilkan placeholder alamat.

- Semua bidang merah besar (hero, kartu foto hero, ajakan bertindak, footer) memakai `batik-panel`: motif batik CSS yang halus + garis emas di sisi atas dan bawah.

### 2. Produk

- Daftar produk berupa kartu (foto, nama, kategori, harga atau "Hubungi admin").
- Filter kategori berupa tombol chip. Dirancang agar bekerja tanpa memuat ulang data.
- Halaman detail per produk (`/produk/[slug]`): galeri foto, deskripsi, rincian (satuan, minimal pesan, asal produsen/UMKM), tombol "Pesan via WhatsApp".
- Tombol WhatsApp membuka `wa.me/<nomor>` dengan pesan awal yang sudah terisi: nama produk + tautan halaman produk. Nomor diambil dari `src/config/site.js`.
- Jika produk banyak: tampilkan sebagian dulu + "Muat lebih banyak" (hemat data HP).

### 3. Berita Desa

- Daftar berita dari yang terbaru: foto sampul kecil, judul, tanggal, ringkasan.
- Halaman detail per berita (`/berita/[slug]`): judul, tanggal, foto sampul, isi.
- Berita berstatus draf tidak tampil di publik.
- Judul dan ringkasan jelas agar enak dibagikan di WhatsApp (pertimbangkan tag Open Graph).

### 4. Struktur Organisasi

- Menampilkan susunan perangkat desa (dan bila perlu komunitas Ikatan 555 sebagai bagian terpisah, tergantung keputusan saya).
- Mobile: daftar vertikal berupa kartu (foto, nama, jabatan), dikelompokkan per tingkat.
- Desktop: tata letak bertingkat memakai CSS grid. Tanpa library bagan.
- Data diurutkan berdasarkan field `urutan` dan `tingkat`.

### 5. Kontak

- Kartu alamat kantor desa dengan placeholder `[ISI NANTI: alamat kantor desa]` sampai alamat asli diberikan.
- Di bawah kartu alamat, tampilkan iframe peta Google Maps untuk lokasi Desa Margourip dengan `loading="lazy"`, judul deskriptif, dan wadah berasio tetap.
- Semua ajakan kontak admin yang dapat diklik diarahkan ke WhatsApp melalui `getWhatsAppLink()` atau `getContactLink()` dan nomor di `src/config/site.js`; jangan gunakan tautan `mailto:`.
- Semua nilai kontak dibaca dari `src/config/site.js`.
- Tautan Google Maps dan URL embed peta disimpan di `src/config/site.js`; gunakan `mapUrl` untuk membuka Maps dan `mapEmbedUrl` sebagai sumber iframe.

## Dashboard admin

Persyaratan (cara penyimpanan data diputuskan lewat rencana; lihat "Keputusan yang belum diambil"):

- Alamat di bawah `/admin`, `noindex`, tidak masuk sitemap, wajib login. Cukup 1-2 akun admin.
- Nyaman dipakai dari HP, bahasa sederhana, tombol besar, konfirmasi sebelum menghapus.
- Mengelola: **Produk**, **Berita**, **Struktur Organisasi**, dan **Pengaturan situs** (kontak, alamat, jam pelayanan, teks hero).
- Unggah foto: ukuran dikecilkan dan diubah ke WebP otomatis sebelum disimpan, dengan batas ukuran yang jelas.
- Perubahan di admin harus tampil di halaman publik tanpa mengorbankan kecepatan halaman publik.
- Tidak ada secret yang terlihat di browser. Jika memakai layanan pihak ketiga, aturan akses (rules/izin) wajib dibahas sebelum fitur admin dibuat.

## Model konten (apa pun cara penyimpanannya)

**Produk**
| Field | Keterangan |
|---|---|
| nama | wajib |
| slug | otomatis dari nama, unik |
| kategori | dari daftar kategori [ISI NANTI] |
| ringkasan | 1-2 kalimat untuk kartu |
| deskripsi | teks lengkap untuk halaman detail |
| foto | 1-5 foto, foto pertama = sampul |
| harga | angka, atau kosong = "Hubungi admin" |
| satuan | mis. kg, pcs, kotak |
| minimalPesan | opsional |
| produsen | nama UMKM/kelompok, opsional |
| status | tersedia / pre-order / habis |
| unggulan | ya/tidak (tampil di Beranda) |
| urutan | angka untuk pengurutan manual |

**Berita**
| Field | Keterangan |
|---|---|
| judul | wajib |
| slug | otomatis dari judul, unik |
| tanggal | tanggal terbit |
| ringkasan | 1-2 kalimat |
| isi | teks lengkap |
| fotoSampul | opsional tapi disarankan |
| status | draf / terbit |

**Struktur organisasi**
| Field | Keterangan |
|---|---|
| nama | wajib |
| jabatan | wajib |
| foto | opsional |
| tingkat | angka (1 = tertinggi) untuk pengelompokan |
| urutan | urutan dalam satu tingkat |

**Pengaturan situs** (satu dokumen)
namaDesa, tagline, alamat, jamPelayanan, nomorWhatsApp (angka internasional tanpa `+`, untuk `wa.me`), email, mapUrl, mediaSosial[].

## SEO dasar

- Judul dan deskripsi unik per halaman, `lang="id"`, tag Open Graph, `robots` yang benar (admin `noindex`).
- Sitemap dan JSON-LD sederhana (nama desa, alamat) boleh diusulkan, tetapi pasang hanya setelah saya setujui dan dampaknya disebutkan.
- Judul dan alt gambar memakai kata kunci alami (nama produk + nama desa).

## Urutan pengerjaan yang disarankan (bahas dulu sebelum mulai)

1. Fondasi: `Layout`, header/footer/navigasi, token warna, `src/config/site.js`.
2. Halaman statis dengan data [CONTOH]: Beranda, Produk, Berita, Struktur Organisasi, Kontak.
3. Keputusan penyimpanan konten + admin (opsi, perbandingan, pilihan saya).
4. Hubungkan data nyata dan dashboard admin, satu jenis konten per langkah (mulai dari Produk).
5. Optimasi akhir: ukur Lighthouse mobile, rapikan gambar, SEO dasar, deploy ke Cloudflare Pages.
