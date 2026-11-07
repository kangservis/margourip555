import { getImage } from 'astro:assets';

// DATA CONTOH. Sumber data asli (database/CMS) belum diputuskan. Saat sudah diputuskan, ganti isi getProduk() saja agar tampilan tidak perlu diubah.
// CARA MENAMBAH FOTO SEMENTARA: taruh di src/assets/produk/ dengan nama <slug>-1.jpg, <slug>-2.jpg, ... (maksimal 5; nomor 1 = sampul). Slug dibuat otomatis dari nama produk (huruf kecil; spasi dan simbol menjadi tanda hubung). Contoh: "[CONTOH] Nanas segar" -> contoh-nanas-segar-1.jpg.

// Daftar kategori contoh; daftar asli menunggu keputusan pemilik.
export const kategoriProduk = ['[CONTOH] Buah segar', '[CONTOH] Olahan'];

// Status produk didefinisikan di satu tempat.
export const statusProduk = {
	tersedia: { label: 'Tersedia', tombol: 'Konsultasi via WhatsApp' },
	'pre-order': { label: 'Pre-order', tombol: 'Konsultasi pre-order' },
	habis: { label: 'Habis', tombol: 'Tanya ketersediaan' },
};

const produkContoh = [
	{
		nama: '[CONTOH] Nanas segar',
		kategori: '[CONTOH] Buah segar',
		ringkasan: '[ISI NANTI: ringkasan produk]',
		deskripsi: '[ISI NANTI: deskripsi lengkap produk]',
		harga: null,
		satuan: 'kg',
		minimalPesan: '',
		produsen: '',
		status: 'tersedia',
		unggulan: true,
		urutan: 1,
	},
	// Harga 10000 hanya angka contoh untuk menguji format, BUKAN harga asli.
	{
		nama: '[CONTOH] Produk olahan A',
		kategori: '[CONTOH] Olahan',
		ringkasan: '[ISI NANTI: ringkasan produk]',
		deskripsi: '[ISI NANTI: deskripsi lengkap produk]',
		harga: 10000,
		satuan: 'pcs',
		minimalPesan: '',
		produsen: '',
		status: 'pre-order',
		unggulan: false,
		urutan: 2,
	},
	{
		nama: '[CONTOH] Produk olahan B',
		kategori: '[CONTOH] Olahan',
		ringkasan: '[ISI NANTI: ringkasan produk]',
		deskripsi: '[ISI NANTI: deskripsi lengkap produk]',
		harga: null,
		satuan: 'kotak',
		minimalPesan: '[ISI NANTI: minimal pesan]',
		produsen: '[ISI NANTI: nama UMKM]',
		status: 'tersedia',
		unggulan: false,
		urutan: 3,
	},
	{
		nama: '[CONTOH] Produk habis',
		kategori: '[CONTOH] Buah segar',
		ringkasan: '[ISI NANTI: ringkasan produk]',
		deskripsi: '[ISI NANTI: deskripsi lengkap produk]',
		harga: null,
		satuan: 'kg',
		minimalPesan: '',
		produsen: '',
		status: 'habis',
		unggulan: false,
		urutan: 4,
	},
];

export function buatSlug(teks) {
	return teks.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function formatHarga(harga) {
	return harga == null ? '' : `Rp ${new Intl.NumberFormat('id-ID').format(harga)}`;
}

const modulFoto = import.meta.glob('../assets/produk/*.{jpg,jpeg,png,webp,avif}', {
	eager: true,
});
const berkasFoto = Object.entries(modulFoto).map(([path, modul]) => ({
	nama: (path.split('/').pop() ?? '').replace(/\.[^.]+$/, '').toLowerCase(),
	meta: modul.default,
}));

// Mengembalikan produk terurut, lengkap dengan slug unik, foto (sampul = nomor 1), harga tampil, info status, dan pesan WhatsApp.
// Hanya SATU produk boleh bertanda unggulan (yang pertama menurut urutan); sisanya diabaikan dengan peringatan.
export async function getProduk() {
	const dipakai = new Set();
	let adaUnggulan = false;
	const hasil = [];

	for (const p of [...produkContoh].sort((a, b) => a.urutan - b.urutan)) {
		const dasar = buatSlug(p.nama) || 'produk';
		let slug = dasar;
		let n = 2;
		while (dipakai.has(slug)) slug = `${dasar}-${n++}`;
		dipakai.add(slug);

		const cocok = berkasFoto
			.map((berkas) => ({ berkas, hasil: berkas.nama.match(new RegExp(`^${slug}-([1-5])$`)) }))
			.filter((x) => x.hasil)
			.sort((a, b) => Number(a.hasil[1]) - Number(b.hasil[1]));

		const foto = [];
		for (const [i, { berkas }] of cocok.entries()) {
			const besar = await getImage({ src: berkas.meta, width: 1000, format: 'webp', quality: 75 });
			const mini = await getImage({ src: berkas.meta, width: 160, format: 'webp', quality: 70 });
			foto.push({
				src: berkas.meta,
				besar: besar.src,
				mini: mini.src,
				alt: cocok.length > 1 ? `Foto ${p.nama} (${i + 1} dari ${cocok.length})` : `Foto ${p.nama}`,
			});
		}

		let unggulan = Boolean(p.unggulan);
		if (unggulan && adaUnggulan) {
			console.warn(`Produk "${p.nama}" bertanda unggulan tetapi sudah ada produk unggulan lain; diabaikan.`);
			unggulan = false;
		}
		if (unggulan) adaUnggulan = true;

		const status = statusProduk[p.status] ? p.status : 'tersedia';
		hasil.push({
			...p,
			slug,
			foto,
			unggulan,
			status,
			statusInfo: statusProduk[status],
			hargaTampil: formatHarga(p.harga),
			pesanWa: `Halo admin, saya ingin konsultasi tentang produk: ${p.nama}.`,
		});
	}
	return hasil;
}
