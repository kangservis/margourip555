# Konsep Website Desa [Margourip]

Dokumen acuan untuk agent. Berisi rincian halaman dan model konten. Aturan kerja, prinsip, dan palet warna ada di `.github/copilot-instructions.md`. Data yang belum ada ditandai [CONTOH] atau [ISI NANTI]; jangan mengarang isinya.

## Tujuan dan pengunjung

- Mengenalkan produk unggulan desa kepada pembeli di luar daerah (kelak luar negeri), memudahkan mereka menghubungi admin via WhatsApp, dan menjadi tempat berita resmi desa.
- Pengunjung utama: pembeli dan calon mitra yang membuka lewat HP, serta warga yang mencari berita dan kontak desa.

## Navigasi

Beranda | Produk | Berita Desa | Struktur Organisasi | Kontak

- Header berisi logo/nama desa + menu. Menu aktif ditandai jelas.
- Tab di atas (desktop) dan menempel di bagian atas saat halaman digulir (*sticky*). Untuk mobile, pilihan menu atau bottom nav diputuskan lewat rencana (lihat instruksi).
- Footer: hanya tampil di desktop (`md:` ke atas); di mobile navigasi memakai bottom nav dan footer tidak ditampilkan. Isinya panel merah gelap ramping bercorak batik (`batik-panel-dark`): satu baris hak cipta (tahun + nama desa) dan, bila `siteConfig.credit` terisi, satu baris kredit desain. Tanpa tautan menu, tanpa tombol WhatsApp, tanpa alamat.
- Kerangka semua halaman publik dihasilkan statis dan berpindah instan; daftar produk dan berita dimuat di browser.
- Semua bagian memakai kelas `site-container` (lebar maksimal 1280px, 1440px mulai lg, 1760px mulai 2xl).
- Band judul halaman dalam berukuran ramping (*compact*).

## Halaman

### 1. Beranda (landing)

Urutan bagian, dari atas ke bawah:

1. **Hero:** nama desa, satu kalimat tagline, dua tombol: "Lihat Produk" dan "Hubungi via WhatsApp". Slider foto utama (maksimal 5 foto; berganti otomatis tiap 5 detik tanpa henti; klik titik atau geser di HP mengulang hitungan 5 detik; jumlah titik mengikuti jumlah foto); foto ditaruh di `src/assets/slider-depan/`, foto pertama dimuat prioritas dan lainnya lazy; kartu slider menyesuaikan rasio foto aktif (tinggi kartu bertransisi halus saat berganti, rasio diklem 3:4 s.d. 2:1); foto mengisi penuh kartu (object-cover); tanpa foto tampil placeholder. Hero memenuhi satu layar penuh di semua ukuran: tinggi layar dikurangi header di desktop dan dikurangi header serta bottom nav di mobile. Di desktop (`lg:` ke atas) teks dan tombol rata kiri berdampingan dengan slider foto. Di mobile, teks judul, ornamen, tagline, dan tombol ditata rata tengah di atas slider foto dengan ritme jarak yang kompak agar pas satu layar penuh tanpa bocor; konten didistribusikan dengan tata letak `justify-between`, grup teks ditarik ke atas dan slider berlabuh di bawah sehingga tercipta ruang bernapas yang seimbang di bagian tengah dalam satu layar penuh.
2. **Tentang desa:** judul di sisi kiri dan isi dalam kartu bergaya kertas di sisi kanan (desktop), dengan tautan ke Struktur Organisasi atau Kontak. Isi dari saya, jangan dikarang.
3. **Produk unggulan:** 1 kartu produk bertanda "unggulan" (yang pertama menurut urutan) bersama blok judul bergaya etalase (dua kolom di desktop, selang-seling dengan bagian Berita), tombol "Lihat semua produk".
4. **Berita terbaru:** 1 berita terbaru dengan tata letak dua kolom yang dicerminkan, tombol "Lihat semua berita". Tombol CTA "Hubungi via WhatsApp" pada bagian "Mari terhubung" disejajarkan secara vertikal di desktop dengan tombol ini melalui grid dua kolom.
5. **Ajakan bertindak:** ajakan menghubungi admin via WhatsApp (untuk pembelian, kerja sama, atau ekspor).
6. **Lokasi singkat:** nama desa yang ditonjolkan dan tautan ke Google Maps; jangan tampilkan placeholder alamat.

- Semua bidang merah besar (hero, kartu foto hero, ajakan bertindak, footer) memakai `batik-panel`: motif batik CSS yang halus + garis emas di sisi atas dan bawah.

### 2. Produk

- Data produk dimuat dari Firestore di browser (kotak penunggu berukuran tetap; bila gagal tampil pesan dan tombol Muat ulang). Filter kategori dibuat dari kategori yang ada di data dan hanya tampil bila ada 2 kategori atau lebih.
- Kartu produk yang seragam dipakai di Beranda dan halaman Produk: foto, kategori, nama, harga atau "Hubungi admin", badge (Unggulan, Pre-order, Habis), dan tombol konsultasi via WhatsApp (label mengikuti status). Ringkasan hanya tampil di popup detail.
- Foto di kartu produk ditampilkan utuh (fit) di dalam kotak berasio tetap.
- Hanya satu produk boleh bertanda unggulan.
- Filter kategori berupa tombol chip. Dirancang agar bekerja tanpa memuat ulang data.
- Klik di mana saja pada kartu produk (kecuali tombol WhatsApp) membuka popup detail berisi galeri foto (hingga 5), ringkasan, deskripsi, rincian, dan tombol WhatsApp; foto utama di popup dapat diklik untuk membuka popup foto yang lebih besar. Detail produk memakai popup, bukan halaman `/produk/[slug]`.
- Jika produk memiliki lebih dari satu foto, popup detail memakai tombol panah kiri/kanan (*hover to see*) di atas foto utama untuk menavigasi foto.
- Lightbox foto produk besar mendukung tombol panah kiri/kanan (*hover to see*) dan tombol panah keyboard di desktop, serta gesture usap (*swipe*) satu per satu dengan ambang batas 50px di mobile.
- Tombol WhatsApp memakai nomor dari `src/config/site.js` dan pesan awal berisi nama produk. Tautan halaman produk di dalam pesan ditunda sampai `site` URL diatur.
- Jika produk banyak: tampilkan sebagian dulu + "Muat lebih banyak" (hemat data HP).

### 3. Berita Desa

- Data berita dimuat dari Firestore di browser (hanya berstatus terbit, terbaru lebih dulu; kotak penunggu berukuran tetap; bila gagal tampil pesan dan tombol Muat ulang).
- Daftar berita terbaru berupa kartu dengan foto sampul utuh/fit, tanggal, judul, dan ringkasan.
- Berita berstatus draf tidak tampil di publik.
- Detail berita saat ini berupa popup bergaya blog (bukan halaman `/berita/[slug]`).
- Klik di mana saja pada kartu membuka popup baca bergaya blog yang menampilkan tanggal, judul, foto utuh, dan isi dalam paragraf; foto di popup dapat diklik untuk membuka popup foto yang lebih besar.
- Tag Open Graph per berita ditunda sampai `site` URL diatur dan tiap berita punya alamat sendiri.
- Judul dan ringkasan jelas agar enak dibagikan di WhatsApp.

### 4. Struktur Organisasi

- Halaman memakai band judul (`PageHeader`) dan kartu bergaya kertas berisi foto, nama, serta jabatan, dikelompokkan per tingkat dengan garis penghubung antar tingkat.
- Data anggota berada di frontmatter `src/pages/struktur.astro`. Foto disimpan di `src/assets/struktur/` dengan nama berkas sama dengan `kunci` anggota (misalnya `ketua.jpg`); foto dapat diklik untuk membuka popup, dan tanpa foto tampil placeholder.
- Mobile: daftar vertikal berupa kartu (foto, nama, jabatan), dikelompokkan per tingkat.
- Desktop: tata letak bertingkat memakai CSS grid. Tanpa library bagan.
- Data diurutkan berdasarkan field `urutan` dan `tingkat`.

### 5. Kontak

- Halaman memakai band judul `PageHeader` (dengan judul dan ornamen di tengah).
- Kartu alamat kantor desa dengan placeholder `[ISI NANTI: alamat kantor desa]` sampai alamat asli diberikan.
- Kartu alamat kantor desa memiliki tombol "Buka di Google Maps" yang mengarah ke `siteConfig.mapUrl`.
- Di bawah kartu alamat, tampilkan iframe peta Google Maps berukuran ringkas (`max-w-2xl` dengan rasio tetap) agar ringan.
- Semua ajakan kontak admin yang dapat diklik diarahkan ke WhatsApp melalui `getWhatsAppLink()` atau `getContactLink()` dan nomor di `src/config/site.js`; jangan gunakan tautan `mailto:`.
- Semua nilai kontak dibaca dari `src/config/site.js`.
- Tautan Google Maps dan URL embed peta disimpan di `src/config/site.js`; gunakan `mapUrl` untuk membuka Maps dan `mapEmbedUrl` sebagai sumber iframe.

## Dashboard admin

Persyaratan (cara penyimpanan data diputuskan lewat rencana; lihat "Keputusan yang belum diambil"):

- Alamat di bawah `/admin`, `noindex`, tidak masuk sitemap, wajib login. Cukup 1-2 akun admin.
- Nyaman dipakai dari HP, bahasa sederhana, tombol besar, konfirmasi sebelum menghapus.
- Mengelola: **Produk**, **Berita**, **Struktur Organisasi**, dan **Pengaturan situs** (kontak, alamat, jam pelayanan, teks hero).
- Unggah foto: ukuran dikecilkan dan diubah ke WebP otomatis sebelum disimpan, dengan batas ukuran yang jelas.
- Perubahan di admin langsung tampil di halaman publik (daftar produk dan berita dimuat dari Firestore di browser dengan kotak penunggu berukuran tetap).
- Tidak ada secret yang terlihat di browser. Jika memakai layanan pihak ketiga, aturan akses (rules/izin) wajib dibahas sebelum fitur admin dibuat.

## Model konten

Sumber data: Firebase Firestore (koleksi `produk`, `berita`, `struktur`, `pengaturan`); foto di ImgBB lewat proxy wsrv.nl. Rincian ada di `data-dan-keamanan.instructions.md`.

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
3. Selesaikan lapisan baca Firestore untuk produk dan berita.
4. Bangun dashboard admin dan hubungkan penulisan data, satu jenis konten per langkah (mulai dari Produk).
5. Optimasi akhir: ukur Lighthouse mobile, rapikan gambar, SEO dasar, deploy ke Cloudflare Pages.
