import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase.js';
import { urlAman } from '../foto.js';
import { buatGaleri } from './galeri.js';
import { tampilkanToast, konfirmasi } from './ui.js';

const MAKS_SLIDER = 5;

let galeri = null;
let statusSlider = null;
let tombolSimpan = null;
let sedangSimpan = false;
let sedangKonfirmasiKosong = false;
let siapDisimpan = false;
let nomorPemuatan = 0;
let sesiSlider = 0;
let pendengarTerpasang = false;

function aturTombol(aktif, teks = 'Simpan perubahan') {
	if (!tombolSimpan) return;
	tombolSimpan.disabled = !aktif;
	tombolSimpan.textContent = teks;
}

async function muatFotoSlider() {
	const pemuatanIni = ++nomorPemuatan;
	siapDisimpan = false;
	aturTombol(false);
	statusSlider.textContent = 'Memuat foto slider...';
	try {
		const snapshot = await getDoc(doc(db, 'pengaturan', 'slider'));
		if (pemuatanIni !== nomorPemuatan || !galeri) return;
		const daftar = snapshot.exists() && Array.isArray(snapshot.data().foto) ? snapshot.data().foto : [];
		const hasil = daftar
			.filter((elemen) => elemen && urlAman(elemen.url))
			.slice(0, MAKS_SLIDER)
			.map((elemen) => ({
				url: elemen.url,
				alt: String(elemen.alt ?? ''),
				rasio: Number(elemen.rasio) || null,
			}));
		galeri.setFoto(hasil);
		statusSlider.textContent = '';
		siapDisimpan = true;
		aturTombol(true);
	} catch (galat) {
		if (pemuatanIni !== nomorPemuatan) return;
		console.error('Gagal memuat slider:', galat.code ?? galat.message);
		statusSlider.textContent = 'Gagal memuat slider. Muat ulang halaman.';
		tampilkanToast('Gagal memuat slider.', 'galat');
		aturTombol(false);
	}
}

async function simpanSlider() {
	if (!galeri || !siapDisimpan || sedangSimpan || sedangKonfirmasiKosong) return;
	const galeriSaatSimpan = galeri;
	const statusSaatSimpan = statusSlider;
	const sesiSaatSimpan = sesiSlider;
	if (galeriSaatSimpan.jumlah() === 0) {
		sedangKonfirmasiKosong = true;
		let ya = false;
		try {
			ya = await konfirmasi({
				judul: 'Kosongkan slider?',
				pesan: 'Semua foto slider akan dihapus dari Beranda. Beranda akan menampilkan kotak foto kosong.',
				tombol: 'Ya, kosongkan',
			});
		} finally {
			sedangKonfirmasiKosong = false;
		}
		if (!ya || sesiSaatSimpan !== sesiSlider || galeri !== galeriSaatSimpan || galeriSaatSimpan.jumlah() !== 0) return;
	}

	sedangSimpan = true;
	aturTombol(false, 'Menyimpan...');
	try {
		const daftar = await galeriSaatSimpan.unggahSemua((ke, total) => {
			statusSaatSimpan.textContent = `Mengunggah foto ${ke} dari ${total}...`;
		});
		if (sesiSaatSimpan !== sesiSlider || galeri !== galeriSaatSimpan) return;
		statusSaatSimpan.textContent = 'Menyimpan...';
		await setDoc(doc(db, 'pengaturan', 'slider'), {
			foto: daftar.map((foto) => ({ url: foto.url, alt: foto.alt, rasio: foto.rasio })),
		});
		if (sesiSaatSimpan !== sesiSlider || galeri !== galeriSaatSimpan) return;
		galeriSaatSimpan.tandaiBersih();
		statusSaatSimpan.textContent = '';
		tampilkanToast('Slider disimpan. Perubahan langsung tampil di website.');
	} catch (galat) {
		if (sesiSaatSimpan !== sesiSlider) return;
		console.error('Gagal menyimpan slider:', galat.code ?? galat.message);
		const pesan = galat.ramah
			? galat.message
			: galat.code === 'permission-denied'
				? 'Penyimpanan ditolak oleh aturan akses (Rules). Periksa Rules.'
				: 'Gagal menyimpan. Coba lagi.';
		statusSaatSimpan.textContent = pesan;
		tampilkanToast(pesan, 'galat');
	} finally {
		if (sesiSaatSimpan === sesiSlider) {
			sedangSimpan = false;
			aturTombol(siapDisimpan);
		}
	}
}

export async function mulaiTabSlider() {
	const wadah = document.querySelector('[data-slider-galeri]');
	const status = document.querySelector('[data-slider-status]');
	const tombol = document.querySelector('[data-slider-simpan]');
	if (!wadah || !status || !(tombol instanceof HTMLButtonElement)) return;

	statusSlider = status;
	tombolSimpan = tombol;
	if (!galeri) {
		galeri = buatGaleri(wadah, {
			maks: MAKS_SLIDER,
			denganKeterangan: true,
			tandaiSampul: false,
			saatUbah: () => {
				if (statusSlider) statusSlider.textContent = '';
			},
		});
	}
	if (!pendengarTerpasang) {
		tombol.addEventListener('click', simpanSlider);
		globalThis.addEventListener('beforeunload', (event) => {
			if (galeri?.adaBelumTersimpan()) {
				event.preventDefault();
				event.returnValue = '';
			}
		});
		pendengarTerpasang = true;
	}
	await muatFotoSlider();
}

export function resetTabSlider() {
	nomorPemuatan++;
	sesiSlider++;
	galeri?.bersihkan();
	galeri = null;
	statusSlider = null;
	siapDisimpan = false;
	sedangSimpan = false;
	sedangKonfirmasiKosong = false;
	aturTombol(false);
	tombolSimpan = null;
}
