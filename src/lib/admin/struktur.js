import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from './firebase.js';
import { buatGaleri } from './galeri.js';
import { tampilkanToast, konfirmasi } from './ui.js';
import { judulTingkat } from '../format.js';
import { urlAman, urlFoto } from '../foto.js';

let daftar = [];
let galeri = null;
let idEdit = null;
let kotor = false;
let sedangSimpan = false;
let sudahMulai = false;
let pemuatanDaftar = 0;
let sesiStruktur = 0;
const sedangHapus = new Set();

let tambahEl;
let jumlahEl;
let daftarEl;
let pesanEl;
let ulangEl;
let dialogEl;
let formEl;
let judulFormEl;
let statusFormEl;
let simpanEl;
let batalEl;
let tutupEl;
let wadahGaleriEl;

function teks(nilai) {
	return typeof nilai === 'string' ? nilai : '';
}

function petakan(snapshotDoc) {
	const data = snapshotDoc.data();
	const nama = teks(data.nama).trim();
	const jabatan = teks(data.jabatan).trim();
	if (!nama || !jabatan) return null;
	return {
		id: snapshotDoc.id,
		nama,
		jabatan,
		tingkat: Number.isInteger(data.tingkat) && data.tingkat >= 1 ? data.tingkat : 99,
		urutan: Number.isInteger(data.urutan) ? data.urutan : 9999,
		foto: urlAman(data.foto),
	};
}

function urut() {
	daftar.sort((a, b) => a.tingkat - b.tingkat || a.urutan - b.urutan || a.nama.localeCompare(b.nama, 'id'));
}

function ambilInput(nama) {
	const elemen = formEl?.querySelector(`[name="${nama}"]`);
	if (
		elemen instanceof HTMLInputElement
		|| elemen instanceof HTMLSelectElement
	) {
		return elemen;
	}
	return null;
}

function tampilkanPesan(pesan) {
	pesanEl.textContent = pesan;
	pesanEl.hidden = false;
}

function render() {
	if (!daftarEl || !pesanEl || !jumlahEl) return;
	const template = document.querySelector('#tpl-struktur-baris');
	if (!(template instanceof HTMLTemplateElement)) {
		throw new Error('Template baris anggota tidak ditemukan.');
	}

	const baris = daftar.map((anggota) => {
		const elemen = template.content.firstElementChild?.cloneNode(true);
		if (!(elemen instanceof HTMLLIElement)) throw new Error('Template baris anggota tidak valid.');
		elemen.dataset.strukturBaris = '';
		elemen.dataset.strukturId = anggota.id;
		const nama = elemen.querySelector('[data-slot="nama"]');
		const meta = elemen.querySelector('[data-slot="meta"]');
		if (!nama || !meta) throw new Error('Slot teks baris anggota tidak lengkap.');
		nama.textContent = anggota.nama;
		meta.textContent = `${anggota.jabatan} · ${judulTingkat[anggota.tingkat] ?? `Tingkat ${anggota.tingkat}`} · Urutan ${anggota.urutan === 9999 ? '-' : anggota.urutan}`;

		const gambar = elemen.querySelector('[data-slot="foto"]');
		if (!(gambar instanceof HTMLImageElement)) throw new Error('Slot foto baris anggota tidak valid.');
		if (anggota.foto) {
			gambar.src = urlFoto(anggota.foto, 160);
			gambar.alt = `Foto ${anggota.jabatan} ${anggota.nama}`;
			elemen.querySelector('[data-slot="foto-kosong"]')?.remove();
		} else {
			gambar.remove();
		}

		const tombolUbah = elemen.querySelector('[data-struktur-aksi="ubah"]');
		const tombolHapus = elemen.querySelector('[data-struktur-aksi="hapus"]');
		if (tombolUbah instanceof HTMLButtonElement) tombolUbah.disabled = sedangHapus.has(anggota.id);
		if (tombolHapus instanceof HTMLButtonElement) tombolHapus.disabled = sedangHapus.has(anggota.id);
		return elemen;
	});
	daftarEl.replaceChildren(...baris);

	if (daftar.length === 0) {
		jumlahEl.textContent = '0 anggota';
		tampilkanPesan('[ISI NANTI: belum ada anggota. Tekan Tambah anggota.]');
		ulangEl.hidden = true;
		return;
	}

	pesanEl.hidden = true;
	pesanEl.textContent = '';
	jumlahEl.textContent = `${daftar.length} anggota`;
	ulangEl.hidden = true;
}

async function muatDaftar() {
	const nomorPemuatan = ++pemuatanDaftar;
	pesanEl.hidden = true;
	pesanEl.textContent = '';
	ulangEl.hidden = true;
	jumlahEl.textContent = 'Memuat anggota...';
	tambahEl.disabled = true;
	try {
		const snap = await getDocs(collection(db, 'struktur'));
		if (nomorPemuatan !== pemuatanDaftar) return;
		daftar = snap.docs.map(petakan).filter(Boolean);
		urut();
		render();
		tambahEl.disabled = false;
	} catch (galat) {
		if (nomorPemuatan !== pemuatanDaftar) return;
		console.error('Gagal memuat struktur:', galat.code ?? galat.message);
		daftar = [];
		daftarEl.replaceChildren();
		jumlahEl.textContent = '';
		tampilkanPesan('Struktur belum dapat dimuat. Periksa koneksi lalu coba lagi.');
		ulangEl.hidden = false;
		tambahEl.disabled = true;
		tampilkanToast('Gagal memuat struktur.', 'galat');
	}
}

function bukaForm(anggota = null) {
	idEdit = anggota?.id ?? null;
	const tingkatInput = ambilInput('tingkat');
	tingkatInput.querySelectorAll('option[data-struktur-sementara]').forEach((opsi) => opsi.remove());
	formEl.reset();
	judulFormEl.textContent = anggota ? 'Ubah anggota' : 'Tambah anggota';
	ambilInput('nama').value = anggota?.nama ?? '';
	ambilInput('jabatan').value = anggota?.jabatan ?? '';
	const opsiTingkat = [...tingkatInput.options];
	if (anggota && !opsiTingkat.some((opsi) => opsi.value === String(anggota.tingkat))) {
		const opsi = document.createElement('option');
		opsi.value = String(anggota.tingkat);
		opsi.textContent = `Tingkat ${anggota.tingkat}`;
		opsi.dataset.strukturSementara = '';
		tingkatInput.appendChild(opsi);
	}
	tingkatInput.value = String(anggota?.tingkat ?? tingkatInput.options[1]?.value ?? tingkatInput.options[0]?.value ?? '');
	ambilInput('urutan').value = anggota && anggota.urutan !== 9999 ? String(anggota.urutan) : '';
	galeri.setFoto(anggota?.foto ? [{ url: anggota.foto, alt: '', rasio: null }] : []);
	kotor = false;
	statusFormEl.textContent = '';
	dialogEl.showModal();
	ambilInput('nama').focus();
}

async function mintaTutup() {
	if (sedangSimpan) return;
	if (kotor || galeri.adaBelumTersimpan()) {
		const ya = await konfirmasi({
			judul: 'Buang perubahan?',
			pesan: 'Perubahan yang belum disimpan akan hilang.',
			tombol: 'Ya, buang',
		});
		if (!ya) return;
	}
	dialogEl.close();
}

function bacaForm() {
	const nama = ambilInput('nama').value.trim();
	const jabatan = ambilInput('jabatan').value.trim();
	const tingkatTeks = ambilInput('tingkat').value;
	const urutanTeks = ambilInput('urutan').value.trim();
	const tingkat = Number(tingkatTeks);
	if (!nama) return { galat: 'Isi nama anggota.', fokus: 'nama' };
	if (nama.length > 120) return { galat: 'Nama maksimal 120 karakter.', fokus: 'nama' };
	if (!jabatan) return { galat: 'Isi jabatan anggota.', fokus: 'jabatan' };
	if (jabatan.length > 80) return { galat: 'Jabatan maksimal 80 karakter.', fokus: 'jabatan' };
	if (!Number.isInteger(tingkat) || tingkat < 1) return { galat: 'Pilih tingkat yang valid.', fokus: 'tingkat' };
	if (urutanTeks && (!Number.isInteger(Number(urutanTeks)) || Number(urutanTeks) < 1)) {
		return { galat: 'Urutan harus berupa angka bulat minimal 1.', fokus: 'urutan' };
	}

	const urutanTingkat = daftar
		.filter((item) => item.tingkat === tingkat && item.urutan < 9999)
		.map((item) => item.urutan);
	const urutan = urutanTeks
		? Number(urutanTeks)
		: urutanTingkat.length ? Math.max(...urutanTingkat) + 1 : 1;
	return { data: { nama, jabatan, tingkat, urutan } };
}

async function simpan(event) {
	event.preventDefault();
	if (sedangSimpan) return;
	const hasilForm = bacaForm();
	if (hasilForm.galat) {
		statusFormEl.textContent = hasilForm.galat;
		tampilkanToast(hasilForm.galat, 'galat');
		ambilInput(hasilForm.fokus).focus();
		return;
	}

	sedangSimpan = true;
	simpanEl.disabled = true;
	batalEl.disabled = true;
	tutupEl.disabled = true;
	simpanEl.textContent = 'Menyimpan...';
	const sesiSaatSimpan = sesiStruktur;
	const galeriSaatSimpan = galeri;
	const idSaatSimpan = idEdit;
	const anggotaLama = daftar.find((anggota) => anggota.id === idSaatSimpan);

	try {
		const foto = await galeriSaatSimpan.unggahSemua((ke, total) => {
			statusFormEl.textContent = `Mengunggah foto ${ke} dari ${total}...`;
		});
		if (sesiSaatSimpan !== sesiStruktur) return;
		const fotoUrl = foto[0]?.url ?? '';
		statusFormEl.textContent = 'Menyimpan...';
		const referensi = idSaatSimpan
			? doc(db, 'struktur', idSaatSimpan)
			: doc(collection(db, 'struktur'));
		const data = { ...hasilForm.data, foto: fotoUrl };
		await setDoc(referensi, data);
		if (sesiSaatSimpan !== sesiStruktur) return;

		const tersimpan = { id: referensi.id, ...data, foto: urlAman(fotoUrl) };
		daftar = anggotaLama
			? daftar.map((anggota) => anggota.id === tersimpan.id ? tersimpan : anggota)
			: [...daftar, tersimpan];
		urut();
		render();
		kotor = false;
		galeriSaatSimpan.tandaiBersih();
		dialogEl.close();
		tampilkanToast('Anggota disimpan. Perubahan langsung tampil di website.');
	} catch (galat) {
		if (sesiSaatSimpan !== sesiStruktur) return;
		console.error('Gagal menyimpan struktur:', galat.code ?? galat.message);
		const pesan = galat.ramah
			? galat.message
			: galat.code === 'permission-denied'
				? 'Penyimpanan ditolak oleh aturan akses (Rules). Periksa Rules.'
				: 'Gagal menyimpan. Coba lagi.';
		statusFormEl.textContent = pesan;
		tampilkanToast(pesan, 'galat');
	} finally {
		if (sesiSaatSimpan === sesiStruktur) {
			sedangSimpan = false;
			simpanEl.disabled = false;
			batalEl.disabled = false;
			tutupEl.disabled = false;
			simpanEl.textContent = 'Simpan';
		}
	}
}

async function hapus(anggota) {
	if (sedangHapus.has(anggota.id)) return;
	const sesiSaatKonfirmasi = sesiStruktur;
	const ya = await konfirmasi({
		judul: 'Hapus anggota?',
		pesan: `"${anggota.nama}" (${anggota.jabatan}) akan dihapus dari halaman Struktur. Tindakan ini tidak bisa dibatalkan.`,
		tombol: 'Ya, hapus',
	});
	if (!ya || sesiSaatKonfirmasi !== sesiStruktur) return;

	sedangHapus.add(anggota.id);
	render();
	try {
		await deleteDoc(doc(db, 'struktur', anggota.id));
		daftar = daftar.filter((item) => item.id !== anggota.id);
		render();
		tampilkanToast('Anggota dihapus.');
	} catch (galat) {
		console.error('Gagal menghapus anggota:', galat.code ?? galat.message);
		tampilkanToast(
			galat.code === 'permission-denied'
				? 'Penghapusan ditolak oleh aturan akses (Rules).'
				: 'Gagal menghapus. Coba lagi.',
			'galat',
		);
	} finally {
		sedangHapus.delete(anggota.id);
		render();
	}
}

function pasangElemen() {
	tambahEl = document.querySelector('[data-struktur-tambah]');
	jumlahEl = document.querySelector('[data-struktur-jumlah]');
	daftarEl = document.querySelector('[data-struktur-daftar]');
	pesanEl = document.querySelector('[data-struktur-pesan]');
	ulangEl = document.querySelector('[data-struktur-ulang]');
	dialogEl = document.querySelector('#struktur-form-dialog');
	if (!(dialogEl instanceof HTMLDialogElement)) return false;
	formEl = dialogEl.querySelector('[data-struktur-form]');
	judulFormEl = dialogEl.querySelector('[data-struktur-form-judul]');
	statusFormEl = dialogEl.querySelector('[data-struktur-form-status]');
	simpanEl = dialogEl.querySelector('[data-struktur-form-simpan]');
	batalEl = dialogEl.querySelector('[data-struktur-form-batal]');
	tutupEl = dialogEl.querySelector('[data-struktur-form-tutup]');
	wadahGaleriEl = dialogEl.querySelector('[data-struktur-galeri]');
	return Boolean(
		tambahEl instanceof HTMLButtonElement
		&& jumlahEl
		&& daftarEl instanceof HTMLUListElement
		&& pesanEl
		&& ulangEl instanceof HTMLButtonElement
		&& formEl instanceof HTMLFormElement
		&& judulFormEl
		&& statusFormEl
		&& simpanEl instanceof HTMLButtonElement
		&& batalEl instanceof HTMLButtonElement
		&& tutupEl instanceof HTMLButtonElement
		&& wadahGaleriEl
		&& ['nama', 'jabatan', 'tingkat', 'urutan'].every((nama) => Boolean(ambilInput(nama))),
	);
}

export async function mulaiTabStruktur() {
	if (!pasangElemen()) return;
	if (sudahMulai) {
		await muatDaftar();
		return;
	}

	const selectTingkat = ambilInput('tingkat');
	Object.entries(judulTingkat)
		.sort(([a], [b]) => Number(a) - Number(b))
		.forEach(([tingkat, judul]) => {
			const opsi = document.createElement('option');
			opsi.value = tingkat;
			opsi.textContent = `${tingkat} - ${judul}`;
			selectTingkat.appendChild(opsi);
		});

	galeri = buatGaleri(wadahGaleriEl, {
		maks: 1,
		denganKeterangan: false,
		tandaiSampul: false,
		saatUbah: () => {
			kotor = true;
		},
	});

	tambahEl.addEventListener('click', () => bukaForm());
	ulangEl.addEventListener('click', () => void muatDaftar());
	daftarEl.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;
		const tombol = target.closest('button[data-struktur-aksi]');
		const baris = tombol?.closest('[data-struktur-baris]');
		const anggota = daftar.find((item) => item.id === baris?.dataset.strukturId);
		if (!anggota || !tombol) return;
		if (tombol.dataset.strukturAksi === 'ubah') bukaForm(anggota);
		if (tombol.dataset.strukturAksi === 'hapus') void hapus(anggota);
	});
	formEl.addEventListener('submit', simpan);
	tutupEl.addEventListener('click', () => void mintaTutup());
	batalEl.addEventListener('click', () => void mintaTutup());
	dialogEl.addEventListener('cancel', (event) => {
		event.preventDefault();
		void mintaTutup();
	});
	formEl.addEventListener('input', () => {
		kotor = true;
	});
	formEl.addEventListener('change', () => {
		kotor = true;
	});
	dialogEl.addEventListener('close', () => {
		galeri?.bersihkan();
		ambilInput('tingkat').querySelectorAll('option[data-struktur-sementara]').forEach((opsi) => opsi.remove());
		kotor = false;
		idEdit = null;
		statusFormEl.textContent = '';
	});
	globalThis.addEventListener('beforeunload', (event) => {
		if (dialogEl.open && (kotor || galeri.adaBelumTersimpan())) {
			event.preventDefault();
			event.returnValue = '';
		}
	});
	sudahMulai = true;
	await muatDaftar();
}

export function resetTabStruktur() {
	pemuatanDaftar++;
	sesiStruktur++;
	if (dialogEl?.open) dialogEl.close();
	galeri?.bersihkan();
	daftar = [];
	daftarEl?.replaceChildren();
	if (jumlahEl) jumlahEl.textContent = '';
	if (tambahEl) tambahEl.disabled = true;
	if (pesanEl) {
		pesanEl.hidden = true;
		pesanEl.textContent = '';
	}
	if (ulangEl) ulangEl.hidden = true;
	sedangHapus.clear();
	sedangSimpan = false;
	kotor = false;
	idEdit = null;
}
