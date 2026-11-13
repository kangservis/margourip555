import { auth } from './firebase.js';

// Foto diperkecil di browser sebelum diunggah: sisi terpanjang maksimal SISI_MAKS, target ukuran BATAS_BYTE.
const SISI_MAKS = 1600;
const BATAS_BYTE = 250 * 1024;
const BATAS_ASLI_BYTE = 20 * 1024 * 1024;

function galatRamah(pesan) {
	const galat = new Error(pesan);
	galat.ramah = true; // pesan aman ditampilkan ke pengguna
	return galat;
}

function keBlob(kanvas, tipe, kualitas) {
	return new Promise((selesai) => kanvas.toBlob(selesai, tipe, kualitas));
}

async function bacaGambar(berkas) {
	try {
		return await createImageBitmap(berkas, { imageOrientation: 'from-image' });
	} catch {
		try {
			return await createImageBitmap(berkas);
		} catch {
			throw galatRamah('Foto tidak dapat dibaca. Coba foto lain.');
		}
	}
}

export async function kecilkanFoto(berkas) {
	if (!berkas.type.startsWith('image/')) throw galatRamah('Berkas bukan foto.');
	if (berkas.size > BATAS_ASLI_BYTE) throw galatRamah('Foto terlalu besar (maksimal 20 MB).');
	const gambar = await bacaGambar(berkas);
	let sisi = Math.min(SISI_MAKS, Math.max(gambar.width, gambar.height));
	let kualitas = 0.82;
	let blob = null;
	let lebar = 0;
	let tinggi = 0;
	for (let percobaan = 0; percobaan < 6; percobaan++) {
		const skala = sisi / Math.max(gambar.width, gambar.height);
		lebar = Math.max(1, Math.round(gambar.width * skala));
		tinggi = Math.max(1, Math.round(gambar.height * skala));
		const kanvas = document.createElement('canvas');
		kanvas.width = lebar;
		kanvas.height = tinggi;
		const konteks = kanvas.getContext('2d');
		if (!konteks) {
			gambar.close?.();
			throw galatRamah('Foto tidak dapat diproses.');
		}
		konteks.drawImage(gambar, 0, 0, lebar, tinggi);
		blob = await keBlob(kanvas, 'image/webp', kualitas);
		// Cadangan bila browser tidak mendukung WebP
		if (!blob || blob.type !== 'image/webp') blob = await keBlob(kanvas, 'image/jpeg', kualitas);
		if (blob && blob.size <= BATAS_BYTE) break;
		if (kualitas > 0.55) kualitas -= 0.1;
		else sisi = Math.round(sisi * 0.8);
	}
	gambar.close?.();
	if (!blob) throw galatRamah('Foto tidak dapat diproses.');
	return { blob, lebar, tinggi, rasio: Math.round((lebar / tinggi) * 1000) / 1000 };
}

// Memperkecil lalu mengunggah satu foto lewat /api/upload. Mengembalikan { url, rasio }.
export async function unggahFoto(berkas) {
	const { blob, rasio } = await kecilkanFoto(berkas);
	const pengguna = auth?.currentUser;
	if (!pengguna) throw galatRamah('Sesi berakhir. Silakan masuk lagi.');
	const tiket = await pengguna.getIdToken();
	const form = new FormData();
	form.append('file', blob, blob.type === 'image/jpeg' ? 'foto.jpg' : 'foto.webp');

	let respons;
	try {
		respons = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${tiket}` }, body: form });
	} catch {
		throw galatRamah('Tidak ada koneksi internet. Periksa koneksi lalu coba lagi.');
	}
	if (respons.status === 404) {
		throw galatRamah('Fungsi unggah tidak ditemukan. Fungsi ini hanya berjalan di alamat Cloudflare Pages, bukan di npm run dev.');
	}
	let isi = null;
	try {
		isi = await respons.json();
	} catch {
		// abaikan: isi bukan JSON
	}
	if (respons.status === 401 || respons.status === 403) throw galatRamah('Akses ditolak. Silakan keluar lalu masuk lagi.');
	if (respons.status === 413) throw galatRamah('Foto terlalu besar.');
	if (!respons.ok || !isi?.url) throw galatRamah(isi?.galat || 'Gagal mengunggah foto.');
	return { url: isi.url, rasio };
}
