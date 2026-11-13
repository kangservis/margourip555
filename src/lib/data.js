import { bacaDokumen, queryKoleksi } from './firestore.js';
import { petakanProduk, petakanBerita } from './pemetaan.js';
import { urlAman } from './foto.js';

// Batas pembacaan (hemat kuota gratis Firestore). Naikkan hanya bila perlu.
const MAKS_PRODUK = 60;
const MAKS_BERITA = 24;

export async function muatProduk() {
	const dokumen = await queryKoleksi({ koleksi: 'produk', batas: MAKS_PRODUK });
	const produk = dokumen
		.map(petakanProduk)
		.filter(Boolean)
		.sort((a, b) => a.urutan - b.urutan || a.nama.localeCompare(b.nama));

	let sudahUnggulan = false;
	let adaUnggulanTambahan = false;
	const hasil = produk.map((item) => {
		if (!item.unggulan) return item;
		if (sudahUnggulan) {
			adaUnggulanTambahan = true;
			return { ...item, unggulan: false };
		}
		sudahUnggulan = true;
		return item;
	});

	if (adaUnggulanTambahan) {
		console.warn('Lebih dari satu produk bertanda unggulan; hanya yang pertama dipakai.');
	}

	return hasil;
}

export async function muatProdukUnggulan() {
	let dokumen = await queryKoleksi({
		koleksi: 'produk',
		filter: [{ bidang: 'unggulan', nilai: true }],
		batas: 1,
	});
	if (dokumen.length === 0) {
		dokumen = await queryKoleksi({ koleksi: 'produk', batas: 1 });
	}
	return dokumen.length > 0 ? petakanProduk(dokumen[0]) : null;
}

export async function muatBerita(batas = MAKS_BERITA) {
	// Filter status wajib ada: Firestore Rules menolak query berita tanpa filter itu. Query ini membutuhkan indeks komposit berita: status (naik), tanggal (turun).
	const dokumen = await queryKoleksi({
		koleksi: 'berita',
		filter: [{ bidang: 'status', nilai: 'terbit' }],
		urutan: { bidang: 'tanggal', turun: true },
		batas,
	});
	return dokumen.map(petakanBerita).filter(Boolean);
}

export async function muatBeritaTerbaru() {
	return (await muatBerita(1))[0] ?? null;
}

// Foto slider depan dari dokumen pengaturan/slider: daftar { url, alt, rasio }, maksimal 5 (urutan = urutan tampil).
export async function muatSlider() {
	const dok = await bacaDokumen('pengaturan', 'slider');
	const daftar = Array.isArray(dok?.foto) ? dok.foto : [];
	return daftar
		.filter((foto) => foto && urlAman(foto.url))
		.slice(0, 5)
		.map((foto) => ({
			url: foto.url,
			alt: String(foto.alt ?? ''),
			rasio: Number(foto.rasio) > 0 ? Number(foto.rasio) : null,
		}));
}
