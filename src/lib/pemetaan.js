import { buatSlug, formatHarga, formatTanggal, statusProduk } from './format.js';
import { urlAman } from './foto.js';

function teks(nilai) {
	return typeof nilai === 'string' ? nilai : '';
}

function idDokumen(dok) {
	return teks(dok?.id);
}

function slugDokumen(slug, nama, id) {
	return teks(slug) || buatSlug(nama) || id;
}

export function petakanProduk(dok) {
	const nama = teks(dok?.nama);
	if (!nama) return null;

	const id = idDokumen(dok);
	const harga = typeof dok.harga === 'number' && Number.isFinite(dok.harga) ? dok.harga : null;
	const status = Object.prototype.hasOwnProperty.call(statusProduk, dok.status)
		? dok.status
		: 'tersedia';
	const foto = Array.isArray(dok.foto)
		? dok.foto.map(urlAman).filter(Boolean).slice(0, 5)
		: [];

	return {
		id,
		slug: slugDokumen(dok.slug, nama, id),
		nama,
		kategori: teks(dok.kategori),
		ringkasan: teks(dok.ringkasan),
		deskripsi: teks(dok.deskripsi),
		harga,
		hargaTampil: formatHarga(harga),
		satuan: teks(dok.satuan),
		minimalPesan: teks(dok.minimalPesan),
		produsen: teks(dok.produsen),
		status,
		statusInfo: statusProduk[status],
		unggulan: Boolean(dok.unggulan),
		urutan: typeof dok.urutan === 'number' && Number.isFinite(dok.urutan) ? dok.urutan : 9999,
		foto,
		pesanWa: `Halo admin, saya ingin konsultasi tentang produk: ${nama}.`,
	};
}

export function petakanBerita(dok) {
	const judul = teks(dok?.judul);
	if (!judul) return null;

	const tanggal = teks(dok.tanggal);
	const id = idDokumen(dok);

	return {
		id,
		slug: slugDokumen(dok.slug, judul, id),
		judul,
		tanggalISO: tanggal,
		tanggalTampil: formatTanggal(tanggal),
		ringkasan: teks(dok.ringkasan),
		paragraf: teks(dok.isi).split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
		foto: urlAman(dok.fotoSampul),
	};
}
