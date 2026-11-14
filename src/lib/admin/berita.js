import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from './firebase.js';
import { buatGaleri } from './galeri.js';
import { tampilkanToast, konfirmasi } from './ui.js';
import { buatSlug, formatTanggal } from '../format.js';
import { urlAman, urlFoto } from '../foto.js';

let daftar = [];
let galeri = null;
let idEdit = null;
let kotor = false;
let sedangSimpan = false;
let sudahMulai = false;
let pemuatanDaftar = 0;
let sesiBerita = 0;
const sedangHapus = new Set();

let cariEl;
let filterStatusEl;
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
	const judul = teks(data.judul).trim();
	if (!judul) return null;

	const tanggal = teks(data.tanggal);
	return {
		id: snapshotDoc.id,
		judul,
		slug: teks(data.slug),
		tanggal: /^\d{4}-\d{2}-\d{2}$/.test(tanggal) ? tanggal : '',
		ringkasan: teks(data.ringkasan),
		isi: teks(data.isi),
		fotoSampul: urlAman(data.fotoSampul),
		status: data.status === 'terbit' ? 'terbit' : 'draf',
	};
}

function urut() {
	daftar.sort((a, b) => (
		(b.tanggal || '').localeCompare(a.tanggal || '')
		|| a.judul.localeCompare(b.judul, 'id')
	));
}

function ambilInput(nama) {
	const elemen = formEl?.querySelector(`[name="${nama}"]`);
	if (
		elemen instanceof HTMLInputElement
		|| elemen instanceof HTMLTextAreaElement
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
	if (!daftarEl || !pesanEl || !jumlahEl || !cariEl || !filterStatusEl) return;

	const kataKunci = cariEl.value.trim().toLocaleLowerCase('id');
	const statusAktif = filterStatusEl.value;
	const tersaring = Boolean(kataKunci || statusAktif);
	const hasil = daftar.filter((berita) => {
		const cocokCari = !kataKunci
			|| berita.judul.toLocaleLowerCase('id').includes(kataKunci)
			|| berita.ringkasan.toLocaleLowerCase('id').includes(kataKunci);
		return cocokCari && (!statusAktif || berita.status === statusAktif);
	});

	const template = document.querySelector('#tpl-berita-baris');
	if (!(template instanceof HTMLTemplateElement)) {
		throw new Error('Template baris berita tidak ditemukan.');
	}

	const baris = hasil.map((berita) => {
		const elemen = template.content.firstElementChild?.cloneNode(true);
		if (!(elemen instanceof HTMLLIElement)) throw new Error('Template baris berita tidak valid.');
		elemen.dataset.id = berita.id;
		const judul = elemen.querySelector('[data-slot="judul"]');
		const meta = elemen.querySelector('[data-slot="meta"]');
		if (!judul || !meta) throw new Error('Slot teks baris berita tidak lengkap.');
		judul.textContent = berita.judul;
		meta.textContent = berita.tanggal
			? formatTanggal(berita.tanggal)
			: 'Tanpa tanggal';

		const gambar = elemen.querySelector('[data-slot="foto"]');
		if (!(gambar instanceof HTMLImageElement)) throw new Error('Slot foto berita tidak valid.');
		if (berita.fotoSampul) {
			gambar.src = urlFoto(berita.fotoSampul, 160);
			gambar.alt = `Foto ${berita.judul}`;
			elemen.querySelector('[data-slot="foto-kosong"]')?.remove();
		} else {
			gambar.remove();
		}

		if (berita.status !== 'terbit') elemen.querySelector('[data-slot="badge-terbit"]')?.remove();
		if (berita.status !== 'draf') elemen.querySelector('[data-slot="badge-draf"]')?.remove();
		const tombolUbah = elemen.querySelector('[data-berita-aksi="ubah"]');
		const tombolHapus = elemen.querySelector('[data-berita-aksi="hapus"]');
		if (tombolUbah instanceof HTMLButtonElement) tombolUbah.disabled = sedangHapus.has(berita.id);
		if (tombolHapus instanceof HTMLButtonElement) tombolHapus.disabled = sedangHapus.has(berita.id);
		return elemen;
	});
	daftarEl.replaceChildren(...baris);

	if (daftar.length === 0) {
		jumlahEl.textContent = '';
		tampilkanPesan('[ISI NANTI: belum ada berita. Tekan Tambah berita.]');
		ulangEl.hidden = true;
		return;
	}

	pesanEl.hidden = hasil.length > 0;
	pesanEl.textContent = hasil.length === 0 ? 'Tidak ada berita yang cocok.' : '';
	jumlahEl.textContent = tersaring
		? `${hasil.length} dari ${daftar.length} berita`
		: `${daftar.length} berita`;
	ulangEl.hidden = true;
}

async function muatDaftar() {
	const nomorPemuatan = ++pemuatanDaftar;
	pesanEl.hidden = true;
	pesanEl.textContent = '';
	ulangEl.hidden = true;
	jumlahEl.textContent = 'Memuat berita...';
	tambahEl.disabled = true;
	try {
		const snap = await getDocs(collection(db, 'berita'));
		if (nomorPemuatan !== pemuatanDaftar) return;
		daftar = snap.docs.map(petakan).filter(Boolean);
		urut();
		render();
		tambahEl.disabled = false;
	} catch (galat) {
		if (nomorPemuatan !== pemuatanDaftar) return;
		console.error('Gagal memuat berita:', galat.code ?? galat.message);
		daftar = [];
		daftarEl.replaceChildren();
		jumlahEl.textContent = '';
		tampilkanPesan('Berita belum dapat dimuat. Periksa koneksi lalu coba lagi.');
		ulangEl.hidden = false;
		tambahEl.disabled = true;
		tampilkanToast('Gagal memuat berita.', 'galat');
	}
}

function slugUnik(judul, idKecuali = null) {
	const dasar = buatSlug(judul) || 'berita';
	let slug = dasar;
	let akhiran = 2;
	while (daftar.some((berita) => berita.id !== idKecuali && berita.slug === slug)) {
		slug = `${dasar}-${akhiran++}`;
	}
	return slug;
}

function tanggalHariIni() {
	const hari = new Date();
	const angkaDuaDigit = (angka) => String(angka).padStart(2, '0');
	return `${hari.getFullYear()}-${angkaDuaDigit(hari.getMonth() + 1)}-${angkaDuaDigit(hari.getDate())}`;
}

function bukaForm(berita = null) {
	idEdit = berita?.id ?? null;
	formEl.reset();
	judulFormEl.textContent = berita ? 'Ubah berita' : 'Tambah berita';
	ambilInput('judul').value = berita?.judul ?? '';
	ambilInput('tanggal').value = berita?.tanggal || tanggalHariIni();
	ambilInput('status').value = berita?.status ?? 'draf';
	ambilInput('ringkasan').value = berita?.ringkasan ?? '';
	ambilInput('isi').value = berita?.isi ?? '';
	galeri.setFoto(berita?.fotoSampul ? [{ url: berita.fotoSampul, alt: '', rasio: null }] : []);
	kotor = false;
	statusFormEl.textContent = '';
	dialogEl.showModal();
	ambilInput('judul').focus();
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
	const judul = ambilInput('judul').value.trim();
	const tanggal = ambilInput('tanggal').value;
	const status = ambilInput('status').value;
	if (!judul) return { galat: 'Isi judul berita.', fokus: 'judul' };
	if (judul.length > 200) return { galat: 'Judul berita maksimal 200 karakter.', fokus: 'judul' };

	const tanggalDate = /^\d{4}-\d{2}-\d{2}$/.test(tanggal)
		? new Date(`${tanggal}T00:00:00Z`)
		: null;
	if (
		!tanggalDate
		|| Number.isNaN(tanggalDate.getTime())
		|| tanggalDate.toISOString().slice(0, 10) !== tanggal
	) {
		return { galat: 'Pilih tanggal berita.', fokus: 'tanggal' };
	}
	if (!['draf', 'terbit'].includes(status)) {
		return { galat: 'Pilih status berita.', fokus: 'status' };
	}

	return {
		data: {
			judul,
			tanggal,
			status,
			ringkasan: ambilInput('ringkasan').value.trim(),
			isi: ambilInput('isi').value.trim(),
		},
	};
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
	const sesiSaatSimpan = sesiBerita;
	const galeriSaatSimpan = galeri;
	const idSaatSimpan = idEdit;
	const beritaLama = daftar.find((berita) => berita.id === idSaatSimpan);

	try {
		const foto = await galeriSaatSimpan.unggahSemua((ke, total) => {
			statusFormEl.textContent = `Mengunggah foto ${ke} dari ${total}...`;
		});
		if (sesiSaatSimpan !== sesiBerita) return;
		const fotoSampul = foto[0]?.url ?? '';
		statusFormEl.textContent = 'Menyimpan...';
		const referensi = idSaatSimpan
			? doc(db, 'berita', idSaatSimpan)
			: doc(collection(db, 'berita'));
		const slug = idSaatSimpan
			? beritaLama?.slug || slugUnik(hasilForm.data.judul, idSaatSimpan)
			: slugUnik(hasilForm.data.judul);
		const data = { ...hasilForm.data, slug, fotoSampul };
		await setDoc(referensi, data);
		if (sesiSaatSimpan !== sesiBerita) return;

		const tersimpan = { id: referensi.id, ...data, fotoSampul: urlAman(fotoSampul) };
		if (beritaLama) {
			daftar = daftar.map((berita) => berita.id === tersimpan.id ? tersimpan : berita);
		} else {
			daftar.push(tersimpan);
		}
		urut();
		render();
		kotor = false;
		galeriSaatSimpan.tandaiBersih();
		dialogEl.close();
		tampilkanToast(data.status === 'terbit'
			? 'Berita diterbitkan. Perubahan langsung tampil di website.'
			: 'Draf berita disimpan. Belum tampil di website.');
	} catch (galat) {
		if (sesiSaatSimpan !== sesiBerita) return;
		console.error('Gagal menyimpan berita:', galat.code ?? galat.message);
		const pesan = galat.ramah
			? galat.message
			: galat.code === 'permission-denied'
				? 'Penyimpanan ditolak oleh aturan akses (Rules). Periksa Rules.'
				: 'Gagal menyimpan. Coba lagi.';
		statusFormEl.textContent = pesan;
		tampilkanToast(pesan, 'galat');
	} finally {
		if (sesiSaatSimpan === sesiBerita) {
			sedangSimpan = false;
			simpanEl.disabled = false;
			batalEl.disabled = false;
			tutupEl.disabled = false;
			simpanEl.textContent = 'Simpan';
		}
	}
}

async function hapus(berita) {
	if (sedangHapus.has(berita.id)) return;
	const sesiSaatKonfirmasi = sesiBerita;
	const pesan = berita.status === 'terbit'
		? `"${berita.judul}" sedang tampil di website. Tindakan ini tidak bisa dibatalkan. Untuk menyembunyikannya sementara, ubah statusnya menjadi Draf.`
		: `"${berita.judul}" akan dihapus. Tindakan ini tidak bisa dibatalkan.`;
	const ya = await konfirmasi({ judul: 'Hapus berita?', pesan, tombol: 'Ya, hapus' });
	if (!ya || sesiSaatKonfirmasi !== sesiBerita) return;

	sedangHapus.add(berita.id);
	render();
	try {
		await deleteDoc(doc(db, 'berita', berita.id));
		daftar = daftar.filter((item) => item.id !== berita.id);
		render();
		tampilkanToast('Berita dihapus.');
	} catch (galat) {
		console.error('Gagal menghapus berita:', galat.code ?? galat.message);
		tampilkanToast(
			galat.code === 'permission-denied'
				? 'Penghapusan ditolak oleh aturan akses (Rules).'
				: 'Gagal menghapus. Coba lagi.',
			'galat',
		);
	} finally {
		sedangHapus.delete(berita.id);
		render();
	}
}

function pasangElemen() {
	cariEl = document.querySelector('[data-berita-cari]');
	filterStatusEl = document.querySelector('[data-berita-filter-status]');
	tambahEl = document.querySelector('[data-berita-tambah]');
	jumlahEl = document.querySelector('[data-berita-jumlah]');
	daftarEl = document.querySelector('[data-berita-daftar]');
	pesanEl = document.querySelector('[data-berita-pesan]');
	ulangEl = document.querySelector('[data-berita-ulang]');
	dialogEl = document.querySelector('#berita-form-dialog');
	if (!(dialogEl instanceof HTMLDialogElement)) return false;
	formEl = dialogEl.querySelector('[data-berita-form]');
	judulFormEl = dialogEl.querySelector('[data-berita-form-judul]');
	statusFormEl = dialogEl.querySelector('[data-berita-form-status]');
	simpanEl = dialogEl.querySelector('[data-berita-form-simpan]');
	batalEl = dialogEl.querySelector('[data-berita-form-batal]');
	tutupEl = dialogEl.querySelector('[data-berita-form-tutup]');
	wadahGaleriEl = dialogEl.querySelector('[data-berita-galeri]');
	return Boolean(
		cariEl
		&& filterStatusEl instanceof HTMLSelectElement
		&& tambahEl instanceof HTMLButtonElement
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
		&& ['judul', 'tanggal', 'status', 'ringkasan', 'isi'].every((nama) => Boolean(ambilInput(nama))),
	);
}

export async function mulaiTabBerita() {
	if (!pasangElemen()) return;
	if (sudahMulai) {
		await muatDaftar();
		return;
	}

	galeri = buatGaleri(wadahGaleriEl, {
		maks: 1,
		denganKeterangan: false,
		tandaiSampul: false,
		saatUbah: () => {
			kotor = true;
		},
	});

	cariEl.addEventListener('input', render);
	filterStatusEl.addEventListener('change', render);
	tambahEl.addEventListener('click', () => bukaForm());
	ulangEl.addEventListener('click', () => void muatDaftar());
	daftarEl.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;
		const tombol = target.closest('button[data-berita-aksi]');
		const baris = tombol?.closest('[data-berita-baris]');
		const berita = daftar.find((item) => item.id === baris?.dataset.id);
		if (!berita || !tombol) return;
		if (tombol.dataset.beritaAksi === 'ubah') bukaForm(berita);
		if (tombol.dataset.beritaAksi === 'hapus') void hapus(berita);
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

export function resetTabBerita() {
	pemuatanDaftar++;
	sesiBerita++;
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
