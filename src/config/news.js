import { getImage } from 'astro:assets';
import { buatSlug } from './products.js';

// DATA CONTOH. Sumber data asli (database/CMS) belum diputuskan. Saat sudah diputuskan, ganti isi getBerita() saja agar tampilan tidak perlu diubah.
// CARA MENAMBAH FOTO SEMENTARA: taruh di src/assets/berita/ dengan nama <slug>-1.jpg (hanya 1 foto sampul). Slug dibuat otomatis dari judul (huruf kecil; spasi dan simbol menjadi tanda hubung). Contoh: "[CONTOH] Berita desa pertama" -> contoh-berita-desa-pertama-1.jpg.
// Pisahkan paragraf di `isi` dengan SATU BARIS KOSONG.
// Tanggal di bawah hanya angka contoh untuk menguji format dan urutan, BUKAN tanggal berita asli.

const beritaContoh = [
	{
		judul: '[CONTOH] Berita desa pertama',
		tanggal: '2026-01-03',
		ringkasan: '[ISI NANTI: ringkasan berita resmi.]',
		isi: '[ISI NANTI: paragraf pertama isi berita.]\n\n[ISI NANTI: paragraf kedua isi berita.]',
		status: 'terbit',
	},
	{
		judul: '[CONTOH] Berita desa kedua',
		tanggal: '2026-01-02',
		ringkasan: '[ISI NANTI: ringkasan berita resmi.]',
		isi: '[ISI NANTI: paragraf pertama isi berita.]\n\n[ISI NANTI: paragraf kedua isi berita.]',
		status: 'terbit',
	},
	{
		judul: '[CONTOH] Berita desa ketiga',
		tanggal: '2026-01-01',
		ringkasan: '[ISI NANTI: ringkasan berita resmi.]',
		isi: '[ISI NANTI: paragraf pertama isi berita.]\n\n[ISI NANTI: paragraf kedua isi berita.]',
		status: 'terbit',
	},
	// Draf: tidak boleh tampil di publik (tanggalnya sengaja paling baru untuk menguji hal itu).
	{
		judul: '[CONTOH] Berita draf',
		tanggal: '2026-01-04',
		ringkasan: '[ISI NANTI: ringkasan berita resmi.]',
		isi: '[ISI NANTI: isi berita.]',
		status: 'draf',
	},
];

export function formatTanggal(iso) {
	const d = new Date(`${iso}T00:00:00Z`);
	if (Number.isNaN(d.getTime())) return '';
	return new Intl.DateTimeFormat('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC',
	}).format(d);
}

const modulFoto = import.meta.glob('../assets/berita/*.{jpg,jpeg,png,webp,avif}', {
	eager: true,
});
const berkasFoto = Object.entries(modulFoto).map(([path, modul]) => ({
	nama: (path.split('/').pop() ?? '').replace(/\.[^.]+$/, '').toLowerCase(),
	meta: modul.default,
}));

// Mengembalikan berita berstatus terbit, terbaru lebih dulu, lengkap dengan slug unik, foto sampul (nama berkas <slug>-1), tanggal tampil, dan paragraf.
// Slug dihitung untuk SEMUA berita (termasuk draf) agar nama berkas foto tidak berubah saat status diganti.
export async function getBerita() {
	const dipakai = new Set();
	const dengan_slug = beritaContoh.map((b) => {
		const dasar = buatSlug(b.judul) || 'berita';
		let slug = dasar;
		let n = 2;
		while (dipakai.has(slug)) slug = `${dasar}-${n++}`;
		dipakai.add(slug);
		return { ...b, slug };
	});

	const hasil = [];
	const terbit = dengan_slug
		.filter((b) => b.status === 'terbit')
		.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
	for (const b of terbit) {
		const berkas = berkasFoto.find((x) => x.nama === `${b.slug}-1`);
		let foto;
		if (berkas) {
			const besar = await getImage({ src: berkas.meta, width: 1000, format: 'webp', quality: 75 });
			foto = { src: berkas.meta, besar: besar.src, alt: `Foto ${b.judul}` };
		}
		hasil.push({
			...b,
			foto,
			tanggalISO: b.tanggal,
			tanggalTampil: formatTanggal(b.tanggal),
			paragraf: b.isi.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
		});
	}
	return hasil;
}
